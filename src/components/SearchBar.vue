<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue'
import BaseInput from '@/components/ui/BaseInput.vue'

const props = defineProps<{
  modelValue: string
  disabled?: boolean
}>()

const emit = defineEmits<{
  search: [value: string]
}>()

const localValue = ref(props.modelValue)
let timeoutId: ReturnType<typeof setTimeout> | null = null

watch(
  () => props.modelValue,
  (value) => {
    localValue.value = value
  },
)

function handleInput(value: string): void {
  localValue.value = value

  if (timeoutId) {
    clearTimeout(timeoutId)
  }

  timeoutId = setTimeout(() => {
    emit('search', localValue.value.trim())
  }, 350)
}

onBeforeUnmount(() => {
  if (timeoutId) {
    clearTimeout(timeoutId)
  }
})
</script>

<template>
  <BaseInput
    id="product-search"
    :model-value="localValue"
    label="Cari produk"
    placeholder="Cari berdasarkan nama produk"
    type="search"
    :disabled="disabled"
    @update:model-value="handleInput"
  />
</template>
