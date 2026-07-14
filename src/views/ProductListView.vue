<script setup lang="ts">
import { onMounted } from 'vue'
import { toast } from 'vue3-toastify'
import AppLayout from '@/components/layout/AppLayout.vue'
import PaginationControls from '@/components/PaginationControls.vue'
import ProductCard from '@/components/ProductCard.vue'
import SearchBar from '@/components/SearchBar.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import { deleteProduct } from '@/services/productApi'
import { useAuthStore } from '@/stores/auth'
import { useProductsStore } from '@/stores/products'
import type { Product } from '@/types/product'

const authStore = useAuthStore()
const productsStore = useProductsStore()

onMounted(() => {
  if (!productsStore.items.length) {
    void productsStore.fetchProducts()
  }
})

async function handleDelete(product: Product): Promise<void> {
  if (!window.confirm(`Hapus produk "${product.title}"?`)) {
    return
  }

  try {
    await deleteProduct(product.id, authStore.accessToken)
    productsStore.removeProduct(product.id)
    toast.success('Produk berhasil dihapus')
  } catch (error) {
    toast.error(error instanceof Error ? error.message : 'Gagal menghapus produk')
  }
}
</script>

<template>
  <AppLayout>
    <section class="mx-auto grid w-full max-w-7xl gap-6">
      <header
        class="flex flex-col gap-4 border-b border-border pb-5 md:flex-row md:items-end md:justify-between"
      >
        <div class="grid gap-2">
          <p class="text-xs font-bold uppercase tracking-wide text-primary">Products</p>
          <h1 class="text-3xl font-bold tracking-normal text-foreground">Daftar produk</h1>
        </div>

        <div class="flex flex-wrap gap-3">
          <BaseButton
            v-if="authStore.isAuthenticated"
            :to="{ name: 'product-create' }"
          >
            Tambah produk
          </BaseButton>
        </div>
      </header>

      <SearchBar
        :model-value="productsStore.search"
        :disabled="productsStore.loading"
        @search="productsStore.setSearch"
      />

      <div
        v-if="productsStore.error"
        class="rounded-md border border-red-200 bg-red-50 p-4 text-sm font-semibold text-danger"
        role="alert"
      >
        {{ productsStore.error }}
      </div>

      <div
        v-if="productsStore.loading"
        class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
      >
        <div
          v-for="index in productsStore.limit"
          :key="index"
          class="h-72 animate-pulse rounded-lg border border-border bg-surface"
        ></div>
      </div>

      <div
        v-else-if="!productsStore.items.length && !productsStore.error"
        class="rounded-lg border border-dashed border-slate-300 bg-surface p-10 text-center"
      >
        <p class="text-lg font-bold text-foreground">Produk tidak ditemukan</p>
        <p class="mt-2 text-sm text-muted-foreground">Coba gunakan kata kunci yang lebih pendek.</p>
      </div>

      <div v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <ProductCard
          v-for="product in productsStore.items"
          :key="product.id"
          :product="product"
          @delete="handleDelete(product)"
        />
      </div>

      <PaginationControls
        :page="productsStore.page"
        :has-next-page="productsStore.hasNextPage"
        :loading="productsStore.loading"
        @next="productsStore.nextPage"
        @prev="productsStore.prevPage"
      />
    </section>
  </AppLayout>
</template>
