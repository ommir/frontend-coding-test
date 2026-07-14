import type { Category } from '@/types/product'

const BASE_URL = import.meta.env.VITE_BASE_API_URL

interface ApiErrorBody {
  message?: string | string[]
  error?: string
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
    : errorBody?.message || errorBody?.error || 'Gagal memuat kategori.'

  throw new Error(message)
}

export async function getCategories(): Promise<Category[]> {
  const response = await fetch(`${BASE_URL}/categories`)

  if (!response.ok) {
    await parseError(response)
  }

  return (await response.json()) as Category[]
}
