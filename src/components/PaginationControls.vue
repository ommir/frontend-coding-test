<script setup lang="ts">
import BaseButton from '@/components/ui/BaseButton.vue'

defineProps<{
  page: number
  hasNextPage: boolean
  loading?: boolean
}>()

const emit = defineEmits<{
  next: []
  prev: []
}>()
</script>

<template>
  <nav class="flex items-center justify-between gap-3" aria-label="Pagination produk">
    <BaseButton
      variant="secondary"
      :disabled="page === 1 || loading"
      @click="emit('prev')"
    >
      Prev
    </BaseButton>

    <span class="text-sm font-semibold text-muted-foreground">Halaman {{ page }}</span>

    <BaseButton
      variant="secondary"
      :disabled="!hasNextPage || loading"
      @click="emit('next')"
    >
      Next
    </BaseButton>
  </nav>
</template>
