<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import { AuthApiError } from '@/services/authApi'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()

const form = reactive({
  email: '',
  password: '',
})

const errors = reactive({
  email: '',
  password: '',
})

const apiError = ref('')

function validate() {
  errors.email = form.email.trim() ? '' : 'Email wajib diisi'
  errors.password = form.password ? '' : 'Password wajib diisi'

  return !errors.email && !errors.password
}

async function handleSubmit() {
  apiError.value = ''

  if (!validate()) {
    return
  }

  try {
    await authStore.login(form.email.trim(), form.password)

    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/'
    await router.push(redirect)
  } catch (error) {
    if (error instanceof AuthApiError && error.status === 401) {
      apiError.value = 'Email atau password salah'
      return
    }

    apiError.value = error instanceof Error ? error.message : 'Login gagal. Silakan coba lagi.'
  }
}
</script>

<template>
  <main class="grid min-h-screen place-items-center bg-background p-6">
    <BaseCard class="grid w-full max-w-[420px] gap-6 p-8" aria-labelledby="login-title">
      <div>
        <p class="mb-2 text-xs font-bold uppercase tracking-wide text-primary">Authentication</p>
        <h1 id="login-title" class="text-3xl font-bold leading-tight text-foreground">
          Masuk ke aplikasi
        </h1>
        <p class="mt-2 leading-6 text-muted-foreground">
          Gunakan akun testing EscuelaJS untuk membuka halaman terproteksi.
        </p>
      </div>

      <form class="grid gap-5" novalidate @submit.prevent="handleSubmit">
        <BaseInput
          id="email"
          v-model="form.email"
          autocomplete="email"
          inputmode="email"
          label="Email"
          name="email"
          type="email"
          :error="errors.email"
        />

        <BaseInput
          id="password"
          v-model="form.password"
          autocomplete="current-password"
          label="Password"
          name="password"
          type="password"
          :error="errors.password"
        />

        <p
          v-if="apiError"
          class="rounded-md bg-red-50 p-3 text-sm font-semibold text-danger"
          role="alert"
        >
          {{ apiError }}
        </p>

        <BaseButton class="w-full" type="submit" :disabled="authStore.isLoading">
          {{ authStore.isLoading ? 'Memproses...' : 'Login' }}
        </BaseButton>
      </form>

      <p class="text-sm leading-6 text-muted-foreground">Testing: john@mail.com / changeme</p>
    </BaseCard>
  </main>
</template>
