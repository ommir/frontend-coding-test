import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import * as authApi from '@/services/authApi'
import type { UserProfile } from '@/services/authApi'

const ACCESS_TOKEN_KEY = 'auth.access_token'
const REFRESH_TOKEN_KEY = 'auth.refresh_token'

export const useAuthStore = defineStore('auth', () => {
  const accessToken = ref<string | null>(localStorage.getItem(ACCESS_TOKEN_KEY))
  const refreshToken = ref<string | null>(localStorage.getItem(REFRESH_TOKEN_KEY))
  const user = ref<UserProfile | null>(null)
  const isLoading = ref(false)

  const isAuthenticated = computed(() => Boolean(accessToken.value))

  function persistTokens(tokens: authApi.LoginResponse): void {
    accessToken.value = tokens.access_token
    refreshToken.value = tokens.refresh_token
    localStorage.setItem(ACCESS_TOKEN_KEY, tokens.access_token)
    localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh_token)
  }

  async function login(email: string, password: string): Promise<void> {
    isLoading.value = true

    try {
      const tokens = await authApi.login(email, password)
      persistTokens(tokens)
      try {
        await fetchProfile()
      } catch (error) {
        logout()
        throw error
      }
    } finally {
      isLoading.value = false
    }
  }

  async function fetchProfile(): Promise<UserProfile | null> {
    if (!accessToken.value) {
      user.value = null
      return null
    }

    user.value = await authApi.getProfile(accessToken.value)
    return user.value
  }

  function logout(): void {
    accessToken.value = null
    refreshToken.value = null
    user.value = null
    localStorage.removeItem(ACCESS_TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
  }

  return {
    accessToken,
    refreshToken,
    user,
    isLoading,
    isAuthenticated,
    login,
    fetchProfile,
    logout,
  }
})
