<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue3-toastify'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import { getCategories } from '@/services/categoryApi'
import { uploadFile } from '@/services/fileApi'
import { createProduct, updateProduct } from '@/services/productApi'
import { useAuthStore } from '@/stores/auth'
import { useProductsStore } from '@/stores/products'
import { FALLBACK_IMAGE, resolveImageUrl } from '@/utils/productImage'
import type { Category, CreateProductPayload, Product } from '@/types/product'

const DEFAULT_IMAGE = FALLBACK_IMAGE
const MAX_IMAGE_SIZE = 5 * 1024 * 1024

const props = defineProps<{
  product?: Product
}>()

const router = useRouter()
const authStore = useAuthStore()
const productsStore = useProductsStore()

const isEdit = computed(() => Boolean(props.product))

const categories = ref<Category[]>([])
const loadingCategories = ref(false)
const submitting = ref(false)
const uploading = ref(false)
const categoryError = ref('')

const form = reactive({
  title: props.product?.title ?? '',
  price: props.product ? String(props.product.price) : '',
  description: props.product?.description ?? '',
  categoryId: props.product ? String(props.product.category.id) : '',
})

const initialImage = props.product?.images?.length ? resolveImageUrl(props.product.images) : ''
const imageUrl = ref(initialImage)
const previewSrc = ref(initialImage)
const previewFailed = ref(false)
let objectUrl: string | null = null

const displaySrc = computed(() => (previewFailed.value ? DEFAULT_IMAGE : previewSrc.value))

function revokeObjectUrl(): void {
  if (objectUrl) {
    URL.revokeObjectURL(objectUrl)
    objectUrl = null
  }
}

const errors = reactive({
  title: '',
  price: '',
  categoryId: '',
})

function validate(): boolean {
  const title = form.title.trim()
  const price = Number(form.price)

  errors.title = ''
  errors.price = ''
  errors.categoryId = ''

  if (!title) {
    errors.title = 'Nama produk wajib diisi'
  } else if (title.length > 150) {
    errors.title = 'Nama produk maksimal 150 karakter'
  }

  if (!form.price.trim() || Number.isNaN(price) || price <= 0) {
    errors.price = 'Harga harus berupa angka lebih dari 0'
  }

  if (!form.categoryId) {
    errors.categoryId = 'Kategori wajib dipilih'
  }

  return !errors.title && !errors.price && !errors.categoryId
}

async function loadCategories(): Promise<void> {
  loadingCategories.value = true
  categoryError.value = ''

  try {
    categories.value = await getCategories()
  } catch (error) {
    categoryError.value = error instanceof Error ? error.message : 'Gagal memuat kategori.'
    toast.error(categoryError.value)
  } finally {
    loadingCategories.value = false
  }
}

async function handleFileChange(event: Event): Promise<void> {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]

  if (!file) {
    return
  }

  if (!file.type.startsWith('image/')) {
    toast.error('File harus berupa gambar')
    input.value = ''
    return
  }

  if (file.size > MAX_IMAGE_SIZE) {
    toast.error('Ukuran gambar maksimal 5MB')
    input.value = ''
    return
  }

  const previousPreview = previewSrc.value
  const previousImageUrl = imageUrl.value

  // Pratinjau langsung dari file lokal supaya andal tanpa menunggu server.
  revokeObjectUrl()
  objectUrl = URL.createObjectURL(file)
  previewSrc.value = objectUrl
  previewFailed.value = false
  uploading.value = true

  try {
    imageUrl.value = await uploadFile(file)
    toast.success('Gambar berhasil diunggah')
  } catch (error) {
    revokeObjectUrl()
    previewSrc.value = previousPreview
    imageUrl.value = previousImageUrl
    toast.error(error instanceof Error ? error.message : 'Gagal mengunggah gambar')
  } finally {
    uploading.value = false
    input.value = ''
  }
}

async function handleSubmit(): Promise<void> {
  if (!validate()) {
    return
  }

  const payload: CreateProductPayload = {
    title: form.title.trim(),
    price: Number(form.price),
    description: form.description.trim(),
    categoryId: Number(form.categoryId),
    images: [imageUrl.value || DEFAULT_IMAGE],
  }

  submitting.value = true

  try {
    if (isEdit.value && props.product) {
      const updated = await updateProduct(props.product.id, payload, authStore.accessToken)
      productsStore.updateProductInList(updated)
      toast.success('Produk berhasil diperbarui')
    } else {
      const created = await createProduct(payload, authStore.accessToken)
      productsStore.addProduct(created)
      toast.success('Produk berhasil ditambahkan')
    }

    await router.push({ name: 'products' })
  } catch (error) {
    toast.error(error instanceof Error ? error.message : 'Gagal menyimpan produk')
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  void loadCategories()
})

onUnmounted(() => {
  revokeObjectUrl()
})
</script>

<template>
  <BaseCard>
    <form class="grid gap-5 p-5" @submit.prevent="handleSubmit">
      <BaseInput
        id="product-title"
        v-model="form.title"
        label="Nama produk"
        maxlength="150"
        type="text"
        :error="errors.title"
      />

      <BaseInput
        id="product-price"
        v-model="form.price"
        label="Harga"
        min="1"
        step="1"
        type="number"
        :error="errors.price"
      />

      <label class="grid gap-2 text-sm font-semibold text-slate-700" for="product-category">
        <span>Kategori</span>
        <select
          id="product-category"
          v-model="form.categoryId"
          class="h-11 rounded-md border bg-surface px-3 text-base font-normal text-foreground outline-none transition focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/15 disabled:cursor-not-allowed disabled:bg-slate-100"
          :class="errors.categoryId ? 'border-danger' : 'border-slate-300'"
          :disabled="loadingCategories"
          :aria-invalid="Boolean(errors.categoryId)"
          :aria-describedby="errors.categoryId ? 'product-category-error' : undefined"
        >
          <option value="">
            {{ loadingCategories ? 'Memuat kategori...' : 'Pilih kategori' }}
          </option>
          <option v-for="category in categories" :key="category.id" :value="String(category.id)">
            {{ category.name }}
          </option>
        </select>
        <span
          v-if="errors.categoryId"
          id="product-category-error"
          class="text-sm font-semibold text-danger"
        >
          {{ errors.categoryId }}
        </span>
        <span v-if="categoryError" class="text-sm font-semibold text-danger">
          {{ categoryError }}
        </span>
      </label>

      <BaseInput
        id="product-description"
        v-model="form.description"
        label="Deskripsi"
        textarea
        :rows="4"
      />

      <div class="grid gap-2 text-sm font-semibold text-slate-700">
        <span>Gambar produk</span>
        <div class="flex items-center gap-4">
          <img
            v-if="previewSrc"
            class="h-24 w-24 rounded-md border border-border object-cover"
            :src="displaySrc"
            alt="Pratinjau gambar produk"
            @error="previewFailed = true"
          />
          <div
            v-else
            class="flex h-24 w-24 items-center justify-center rounded-md border border-dashed border-slate-300 text-xs font-normal text-muted-foreground"
          >
            Belum ada
          </div>

          <label
            class="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-md border border-slate-300 bg-surface px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2"
            :class="uploading ? 'cursor-not-allowed opacity-60' : ''"
          >
            <input
              type="file"
              accept="image/*"
              class="sr-only"
              :disabled="uploading"
              @change="handleFileChange"
            />
            {{ uploading ? 'Mengunggah...' : 'Pilih gambar' }}
          </label>
        </div>
        <p class="text-xs font-normal text-muted-foreground">
          Unggah gambar dari komputer (maksimal 5MB). Kosongkan untuk memakai placeholder.
        </p>
      </div>

      <div class="flex flex-wrap justify-end gap-3 border-t border-border pt-5">
        <BaseButton variant="secondary" :to="{ name: 'products' }">Batal</BaseButton>
        <BaseButton type="submit" :disabled="submitting || loadingCategories || uploading">
          {{ submitting ? 'Menyimpan...' : isEdit ? 'Perbarui produk' : 'Simpan produk' }}
        </BaseButton>
      </div>
    </form>
  </BaseCard>
</template>
