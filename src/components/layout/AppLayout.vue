<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import type { RouteLocationRaw } from 'vue-router'
import BaseButton from '@/components/ui/BaseButton.vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const router = useRouter()

const sidebarOpen = ref(false)

const links: { label: string; to: RouteLocationRaw; exact: boolean }[] = [
  { label: 'Homepage', to: { name: 'home' }, exact: true },
  { label: 'Products', to: { name: 'products' }, exact: false },
]

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

const activeClass = 'bg-primary/10 text-primary'

async function handleLogout() {
  authStore.logout()
  await router.push({ name: 'login' })
}
</script>

<template>
  <div class="flex min-h-screen bg-background">
    <!-- Overlay saat sidebar terbuka di mobile -->
    <div
      v-if="sidebarOpen"
      class="fixed inset-0 z-30 bg-black/40 lg:hidden"
      aria-hidden="true"
      @click="sidebarOpen = false"
    ></div>

    <!-- Sidebar -->
    <aside
      class="fixed inset-y-0 left-0 z-40 flex w-64 transform flex-col border-r border-border bg-surface transition-transform duration-200 lg:static lg:translate-x-0"
      :class="sidebarOpen ? 'translate-x-0' : '-translate-x-full'"
    >
      <div class="flex h-16 items-center gap-2 border-b border-border px-5">
        <span class="text-lg font-bold text-foreground">Dashboard</span>
      </div>
      <nav class="grid gap-1 p-3" aria-label="Menu utama">
        <RouterLink
          v-for="link in links"
          :key="link.label"
          :to="link.to"
          class="rounded-md px-3 py-2 text-sm font-semibold text-muted-foreground transition hover:bg-slate-100 hover:text-foreground"
          :active-class="link.exact ? '' : activeClass"
          :exact-active-class="link.exact ? activeClass : ''"
          @click="sidebarOpen = false"
        >
          {{ link.label }}
        </RouterLink>
      </nav>
    </aside>

    <!-- Kolom utama -->
    <div class="flex min-w-0 flex-1 flex-col">
      <!-- Navbar -->
      <header
        class="flex h-16 items-center gap-3 border-b border-border bg-surface px-4 sm:px-6"
      >
        <button
          type="button"
          class="inline-flex h-10 w-10 items-center justify-center rounded-md text-foreground transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary lg:hidden"
          aria-label="Buka menu"
          @click="sidebarOpen = true"
        >
          <svg
            class="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="2"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
          </svg>
        </button>

        <div class="ml-auto flex items-center gap-3">
          <div class="flex items-center gap-2">
            <img
              v-if="avatarUrl"
              class="h-9 w-9 rounded-full object-cover"
              :src="avatarUrl"
              alt=""
            />
            <div
              v-else
              class="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary"
              aria-hidden="true"
            >
              {{ displayName.charAt(0).toUpperCase() }}
            </div>
            <span class="hidden text-sm font-semibold text-foreground sm:inline">
              {{ displayName }}
            </span>
          </div>
          <BaseButton variant="danger" type="button" @click="handleLogout">Logout</BaseButton>
        </div>
      </header>

      <main class="flex-1 p-6 sm:p-8">
        <slot />
      </main>
    </div>
  </div>
</template>
