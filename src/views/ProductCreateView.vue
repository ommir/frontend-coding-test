<script setup lang="ts">
import AppLayout from '@/components/layout/AppLayout.vue'
import ProductForm from '@/components/ProductForm.vue'
</script>

<template>
  <AppLayout>
    <section class="mx-auto grid w-full max-w-3xl gap-6">
      <header class="border-b border-border pb-5">
        <p class="text-xs font-bold uppercase tracking-wide text-primary">Products</p>
        <h1 class="mt-2 text-3xl font-bold tracking-normal text-foreground">Tambah produk</h1>
      </header>

      <ProductForm />
    </section>
  </AppLayout>
</template>
