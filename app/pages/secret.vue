<template>
  <UPageBody>
    <UCard class="mx-auto mt-8 max-w-2xl">
      <template #header>
        <h1 class="text-2xl font-bold">
          Protected page
        </h1>
      </template>
      <p class="text-muted">
        This page requires an active session. Nuxt Better Auth applies the auth route rule before rendering it.
      </p>
    </UCard>
  </UPageBody>
</template>
