<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vue3-toastify'
import AppLayout from '@/components/layout/AppLayout.vue'
import ProductForm from '@/components/ProductForm.vue'
import { getProduct } from '@/services/productApi'
import { useProductsStore } from '@/stores/products'
import type { Product } from '@/types/product'

const route = useRoute()
const router = useRouter()
const productsStore = useProductsStore()

const product = ref<Product | null>(null)
const loading = ref(true)

onMounted(async () => {
  const id = Number(route.params.id)

  if (Number.isNaN(id)) {
    toast.error('Produk tidak ditemukan')
    await router.push({ name: 'products' })
    return
  }

  const cached = productsStore.items.find((item) => item.id === id)
  if (cached) {
    product.value = cached
    loading.value = false
    return
  }

  try {
    product.value = await getProduct(id)
  } catch (error) {
    toast.error(error instanceof Error ? error.message : 'Gagal memuat produk')
    await router.push({ name: 'products' })
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <AppLayout>
    <section class="mx-auto grid w-full max-w-3xl gap-6">
      <header class="border-b border-border pb-5">
        <p class="text-xs font-bold uppercase tracking-wide text-primary">Products</p>
        <h1 class="mt-2 text-3xl font-bold tracking-normal text-foreground">Edit produk</h1>
      </header>

      <div v-if="loading" class="h-96 animate-pulse rounded-lg border border-border bg-surface"></div>
      <ProductForm v-else-if="product" :product="product" />
    </section>
  </AppLayout>
</template>
