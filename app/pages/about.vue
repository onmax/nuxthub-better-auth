<script setup lang="ts">
definePageMeta({
  auth: false,
})
</script>

<template>
  <UPageBody>
    <UCard class="mx-auto mt-8 max-w-2xl">
      <template #header>
        <h1 class="text-2xl font-bold">
          About the template
        </h1>
      </template>
      <p class="text-muted">
        This Nuxt 4 authentication template uses @nuxtjs/better-auth with NuxtHub. It includes deployment configs for Node with SQLite, Cloudflare with D1, and Vercel with Turso.
      </p>
    </UCard>
  </UPageBody>
</template>
