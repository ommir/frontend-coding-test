<script setup lang="ts">
import { computed } from 'vue'
import AppLayout from '@/components/layout/AppLayout.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

const displayName = computed(() => authStore.user?.name || authStore.user?.email || 'User')
const avatarUrl = computed(() => {
  if (!authStore.user?.avatar) {
    return ''
  }

  try {
    const url = new URL(authStore.user.avatar)
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.toString() : ''
  } catch {
    return ''
  }
})
</script>

<template>
  <AppLayout>
    <section class="mx-auto grid max-w-5xl gap-7" aria-labelledby="home-title">
      <div class="flex items-start gap-5 border-b border-border pb-6 sm:items-center">
        <img v-if="avatarUrl" class="h-20 w-20 rounded-full object-cover" :src="avatarUrl" alt="" />
        <div>
          <p class="mb-2 text-xs font-bold uppercase tracking-wide text-primary">
            Protected Route
          </p>
          <h1 id="home-title" class="text-3xl font-bold leading-tight text-foreground">
            Halo, {{ displayName }}
          </h1>
          <p v-if="authStore.user" class="mt-2 text-muted-foreground">
            {{ authStore.user.email }} · {{ authStore.user.role }}
          </p>
        </div>
      </div>
    </section>
  </AppLayout>
</template>
