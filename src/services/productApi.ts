import type { CreateProductPayload, Product, UpdateProductPayload } from '@/types/product'

const BASE_URL = import.meta.env.VITE_BASE_API_URL

interface ApiErrorBody {
  message?: string | string[]
  error?: string
}

export interface ProductListParams {
  offset: number
  limit: number
  title?: string
}

async function parseError(response: Response): Promise<never> {
  let errorBody: ApiErrorBody | null = null

  try {
    errorBody = (await response.json()) as ApiErrorBody
  } catch {
    errorBody = null
  }

  const message = Array.isArray(errorBody?.message)
    ? errorBody.message.join(', ')
    : errorBody?.message || errorBody?.error || 'Gagal memproses data produk.'

  throw new Error(message)
}

export async function getProducts(params: ProductListParams): Promise<Product[]> {
  const searchParams = new URLSearchParams({
    offset: String(params.offset),
    limit: String(params.limit),
  })

  if (params.title?.trim()) {
    searchParams.set('title', params.title.trim())
  }

  const response = await fetch(`${BASE_URL}/products?${searchParams.toString()}`)

  if (!response.ok) {
    await parseError(response)
  }

  return (await response.json()) as Product[]
}

export async function getProduct(id: number): Promise<Product> {
  const response = await fetch(`${BASE_URL}/products/${id}`)

  if (!response.ok) {
    await parseError(response)
  }

  return (await response.json()) as Product
}

export async function createProduct(
  payload: CreateProductPayload,
  accessToken?: string | null,
): Promise<Product> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  }

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`
  }

  const response = await fetch(`${BASE_URL}/products`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    await parseError(response)
  }

  return (await response.json()) as Product
}

export async function updateProduct(
  id: number,
  payload: UpdateProductPayload,
  accessToken?: string | null,
): Promise<Product> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  }

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`
  }

  const response = await fetch(`${BASE_URL}/products/${id}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    await parseError(response)
  }

  return (await response.json()) as Product
}

export async function deleteProduct(id: number, accessToken?: string | null): Promise<void> {
  const headers: HeadersInit = {}

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`
  }

  const response = await fetch(`${BASE_URL}/products/${id}`, {
    method: 'DELETE',
    headers,
  })

  if (!response.ok) {
    await parseError(response)
  }
}
