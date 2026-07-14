<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    id: string
    label: string
    modelValue: string
    error?: string
    type?: string
    name?: string
    autocomplete?: string
    inputmode?: 'none' | 'text' | 'tel' | 'url' | 'email' | 'numeric' | 'decimal' | 'search'
    maxlength?: string | number
    min?: string | number
    step?: string | number
    placeholder?: string
    disabled?: boolean
    textarea?: boolean
    rows?: number
  }>(),
  {
    error: '',
    type: 'text',
    name: undefined,
    autocomplete: undefined,
    inputmode: undefined,
    maxlength: undefined,
    min: undefined,
    step: undefined,
    placeholder: undefined,
    disabled: false,
    textarea: false,
    rows: 3,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const errorId = computed(() => `${props.id}-error`)

const fieldClass = computed(() => [
  'w-full rounded-md border bg-surface px-3 text-base font-normal text-foreground outline-none transition focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/15 disabled:cursor-not-allowed disabled:bg-slate-100',
  props.textarea ? 'min-h-24 py-2' : 'h-11',
  props.error ? 'border-danger' : 'border-slate-300',
])

function updateValue(event: Event): void {
  emit('update:modelValue', (event.target as HTMLInputElement | HTMLTextAreaElement).value)
}
</script>

<template>
  <label class="grid gap-2 text-sm font-semibold text-slate-700" :for="id">
    <span>{{ label }}</span>
    <textarea
      v-if="textarea"
      :id="id"
      :value="modelValue"
      :class="fieldClass"
      :name="name"
      :rows="rows"
      :placeholder="placeholder"
      :disabled="disabled"
      :aria-invalid="Boolean(error)"
      :aria-describedby="error ? errorId : undefined"
      @input="updateValue"
    ></textarea>
    <input
      v-else
      :id="id"
      :value="modelValue"
      :class="fieldClass"
      :name="name"
      :type="type"
      :autocomplete="autocomplete"
      :inputmode="inputmode"
      :maxlength="maxlength"
      :min="min"
      :step="step"
      :placeholder="placeholder"
      :disabled="disabled"
      :aria-invalid="Boolean(error)"
      :aria-describedby="error ? errorId : undefined"
      @input="updateValue"
    />
    <span v-if="error" :id="errorId" class="text-sm font-semibold text-danger">
      {{ error }}
    </span>
  </label>
</template>
