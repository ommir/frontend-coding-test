import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { getProducts } from '@/services/productApi'
import type { Product } from '@/types/product'

const DEFAULT_LIMIT = 10

export const useProductsStore = defineStore('products', () => {
  const items = ref<Product[]>([])
  const search = ref('')
  const page = ref(1)
  const limit = ref(DEFAULT_LIMIT)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const hasNextPage = ref(false)
  let activeRequestId = 0

  const offset = computed(() => (page.value - 1) * limit.value)

  async function fetchProducts(): Promise<void> {
    const requestId = ++activeRequestId
    loading.value = true
    error.value = null

    try {
      const products = await getProducts({
        offset: offset.value,
        limit: limit.value,
        title: search.value,
      })

      if (requestId !== activeRequestId) {
        return
      }

      items.value = products
      hasNextPage.value = products.length === limit.value
    } catch (fetchError) {
      if (requestId !== activeRequestId) {
        return
      }

      error.value =
        fetchError instanceof Error ? fetchError.message : 'Gagal memuat daftar produk.'
      items.value = []
      hasNextPage.value = false
    } finally {
      if (requestId === activeRequestId) {
        loading.value = false
      }
    }
  }

  async function setSearch(query: string): Promise<void> {
    search.value = query
    page.value = 1
    await fetchProducts()
  }

  async function nextPage(): Promise<void> {
    if (!hasNextPage.value || loading.value) {
      return
    }

    page.value += 1
    await fetchProducts()
  }

  async function prevPage(): Promise<void> {
    if (page.value === 1 || loading.value) {
      return
    }

    page.value -= 1
    await fetchProducts()
  }

  function addProduct(product: Product): void {
    items.value = [product, ...items.value].slice(0, limit.value)
    hasNextPage.value = true
  }

  function updateProductInList(product: Product): void {
    const index = items.value.findIndex((item) => item.id === product.id)
    if (index !== -1) {
      items.value.splice(index, 1, product)
    }
  }

  function removeProduct(id: number): void {
    items.value = items.value.filter((item) => item.id !== id)
  }

  return {
    items,
    search,
    page,
    limit,
    loading,
    error,
    hasNextPage,
    fetchProducts,
    setSearch,
    nextPage,
    prevPage,
    addProduct,
    updateProductInList,
    removeProduct,
  }
})
