<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import type { RouteLocationRaw } from 'vue-router'

const props = withDefaults(
  defineProps<{
    variant?: 'primary' | 'secondary' | 'danger'
    type?: 'button' | 'submit' | 'reset'
    disabled?: boolean
    loading?: boolean
    to?: RouteLocationRaw
  }>(),
  {
    variant: 'primary',
    type: 'button',
    disabled: false,
    loading: false,
    to: undefined,
  },
)

const componentType = computed(() => (props.to ? RouterLink : 'button'))

const variantClass = computed(() => {
  if (props.variant === 'secondary') {
    return 'border border-slate-300 bg-surface text-slate-700 hover:border-slate-400'
  }

  if (props.variant === 'danger') {
    return 'border border-transparent bg-danger text-white hover:bg-red-800'
  }

  return 'border border-transparent bg-primary text-white hover:bg-primary-hover'
})

const disabledClass = computed(() =>
  props.disabled || props.loading ? 'cursor-not-allowed opacity-60' : '',
)
</script>

<template>
  <component
    :is="componentType"
    class="inline-flex min-h-11 items-center justify-center rounded-md px-4 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
    :class="[variantClass, disabledClass]"
    :to="to"
    :type="to ? undefined : type"
    :disabled="!to && (disabled || loading)"
  >
    <slot>{{ loading ? 'Memproses...' : '' }}</slot>
  </component>
</template>
