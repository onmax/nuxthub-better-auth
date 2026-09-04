<script setup lang="ts">
import type { Account } from 'better-auth'

const { user, session } = useUserSession()
const runtimeConfig = useRuntimeConfig()
const toast = useToast()
const linkGitHub = useAuthClientAction(client => client.linkSocial)

const { data: accounts, status: accountsStatus, error: accountsError, refresh: refreshAccounts } = await useFetch<Pick<Account, 'providerId'>[]>('/api/auth/list-accounts', {
  key: computed(() => `accounts:${user.value?.id ?? 'guest'}`),
  default: () => [],
})

const isAnonymous = computed(() => Boolean(user.value?.isAnonymous))
const isAdmin = computed(() => user.value?.role === 'admin')

function hasProvider(provider: string) {
  return accounts.value.some(account => account.providerId === provider)
}

async function linkAccount() {
  if (accountsStatus.value !== 'success' || linkGitHub.status.value === 'pending') return
  await linkGitHub.execute({ provider: 'github', callbackURL: '/user' })
  if (linkGitHub.error.value) {
    toast.add({ title: linkGitHub.error.value.message, color: 'error' })
  }
}

const oauthError = useRoute().query.error
onMounted(() => {
  if (oauthError) toast.add({ color: 'error', title: String(oauthError) })
})
</script>

<template>
  <UPageBody>
    <div class="mx-auto max-w-3xl py-8">
      <div class="flex flex-wrap items-center gap-3">
        <h1 class="text-3xl font-bold">
          Current session
        </h1>
        <UBadge v-if="isAnonymous" color="neutral" label="Anonymous" />
        <UBadge v-else-if="isAdmin" color="primary" label="Admin" />
        <UBadge v-else color="success" label="User" />
      </div>
      <p class="mt-2 text-muted">
        Nuxt Better Auth loaded this session on the server. NuxtHub stores it in the database configured for this deployment.
      </p>

      <div class="mt-6 grid gap-4 md:grid-cols-2">
        <UCard>
          <template #header>
            <h2 class="font-semibold">
              User
            </h2>
          </template>
          <pre class="overflow-auto text-xs">{{ user }}</pre>
        </UCard>
        <UCard>
          <template #header>
            <h2 class="font-semibold">
              Session
            </h2>
          </template>
          <pre class="overflow-auto text-xs">{{ session }}</pre>
        </UCard>
      </div>

      <UCard v-if="runtimeConfig.public.githubAuthEnabled && !isAnonymous" class="mt-4">
        <template #header>
          <h2 class="font-semibold">
            GitHub account
          </h2>
        </template>
        <UAlert
          v-if="accountsError"
          color="error"
          title="Could not load linked accounts"
          :actions="[{ label: 'Retry', onClick: () => refreshAccounts() }]"
        />
        <UButton
          v-else-if="hasProvider('github')"
          color="neutral"
          variant="soft"
          icon="i-simple-icons-github"
          trailing-icon="i-heroicons-check"
          disabled
        >
          Linked with GitHub
        </UButton>
        <UButton
          v-else
          color="neutral"
          icon="i-simple-icons-github"
          :loading="accountsStatus === 'pending' || linkGitHub.status.value === 'pending'"
          :disabled="accountsStatus !== 'success'"
          @click="linkAccount"
        >
          Link GitHub account
        </UButton>
      </UCard>
    </div>
  </UPageBody>
</template>
