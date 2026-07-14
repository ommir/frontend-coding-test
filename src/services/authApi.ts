const BASE_URL = import.meta.env.VITE_BASE_API_URL ?? 'https://api.escuelajs.co/api/v1'
export interface LoginResponse {
  access_token: string
  refresh_token: string
}

export interface UserProfile {
  id: number
  email: string
  password?: string
  name: string
  role: string
  avatar: string
  creationAt?: string
  updatedAt?: string
}

interface ApiErrorBody {
  message?: string | string[]
  error?: string
  statusCode?: number
}

export class AuthApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'AuthApiError'
    this.status = status
  }
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
    : errorBody?.message || errorBody?.error || 'Terjadi kesalahan. Silakan coba lagi.'

  throw new AuthApiError(message, response.status)
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  })

  if (!response.ok) {
    await parseError(response)
  }

  return (await response.json()) as LoginResponse
}

export async function getProfile(accessToken: string): Promise<UserProfile> {
  const response = await fetch(`${BASE_URL}/auth/profile`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    await parseError(response)
  }

  return (await response.json()) as UserProfile
}

export async function refreshToken(refreshTokenValue: string): Promise<LoginResponse> {
  const response = await fetch(`${BASE_URL}/auth/refresh-token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refreshToken: refreshTokenValue }),
  })

  if (!response.ok) {
    await parseError(response)
  }

  return (await response.json()) as LoginResponse
}
