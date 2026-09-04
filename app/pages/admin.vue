<script setup lang="ts">
const { user } = useUserSession()
const { data, status, error, refresh } = await useFetch('/api/admin', {
  key: computed(() => `admin:${user.value?.id ?? 'guest'}`),
})
</script>

<template>
  <UPageBody>
    <UCard class="mx-auto mt-8 max-w-2xl">
      <template #header>
        <h1 class="text-2xl font-bold">
          Restricted demo admin
        </h1>
      </template>
      <p class="text-muted">
        The admin role can read this demo endpoint, but has no user-management permissions.
      </p>
      <UAlert
        v-if="error"
        class="mt-4"
        color="error"
        title="Could not load admin data"
        :actions="[{ label: 'Retry', onClick: () => refresh() }]"
      />
      <p v-else-if="status === 'pending'" class="mt-4 text-muted" role="status">
        Loading admin data…
      </p>
      <pre v-else class="mt-4 overflow-auto text-xs">{{ data }}</pre>
    </UCard>
  </UPageBody>
</template>
