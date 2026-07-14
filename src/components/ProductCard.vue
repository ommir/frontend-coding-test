<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import { useAuthStore } from '@/stores/auth'
import { FALLBACK_IMAGE, resolveImageUrl } from '@/utils/productImage'
import type { Product } from '@/types/product'

const props = defineProps<{
  product: Product
}>()

const emit = defineEmits<{
  delete: []
}>()

const authStore = useAuthStore()

const imageFailed = ref(false)

const formattedPrice = computed(() =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(props.product.price),
)

const imageUrl = computed(() => {
  if (imageFailed.value) {
    return FALLBACK_IMAGE
  }

  return resolveImageUrl(props.product.images)
})

watch(
  () => props.product.id,
  () => {
    imageFailed.value = false
  },
)
</script>

<template>
  <BaseCard class="overflow-hidden">
    <img
      class="aspect-[4/3] w-full bg-slate-100 object-cover"
      :src="imageUrl"
      :alt="product.title"
      loading="lazy"
      @error="imageFailed = true"
    />

    <div class="grid gap-3 p-4">
      <div class="grid gap-1">
        <p class="text-xs font-semibold uppercase tracking-wide text-primary">
          {{ product.category.name }}
        </p>
        <h2 class="line-clamp-2 min-h-12 text-base font-bold leading-6 text-foreground">
          {{ product.title }}
        </h2>
      </div>

      <div class="flex items-center justify-between gap-3">
        <p class="text-lg font-bold text-foreground">{{ formattedPrice }}</p>
        <span class="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">
          ID {{ product.id }}
        </span>
      </div>

      <div v-if="authStore.isAuthenticated" class="flex gap-2 border-t border-border pt-3">
        <BaseButton
          variant="secondary"
          class="flex-1"
          :to="{ name: 'product-edit', params: { id: product.id } }"
        >
          Edit
        </BaseButton>
        <BaseButton variant="danger" type="button" class="flex-1" @click="emit('delete')">
          Hapus
        </BaseButton>
      </div>
    </div>
  </BaseCard>
</template>
