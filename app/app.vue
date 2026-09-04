<script setup lang="ts">
const { loggedIn, user, fetchSession } = useUserSession()
const toast = useToast()
const logoutAction = useAuthClientAction(client => user.value?.isAnonymous ? client.deleteAnonymousUser : client.signOut)

const headerLinks = [
  { label: 'Home', to: '/' },
  { label: 'User', to: '/user' },
  { label: 'Secret', to: '/secret' },
  { label: 'Admin', to: '/admin' },
  { label: 'About', to: '/about' },
]

const footerLinks = [
  { label: 'Source', to: 'https://github.com/atinux/nuxthub-better-auth', target: '_blank' },
  { label: 'NuxtHub', to: 'https://hub.nuxt.com', target: '_blank' },
  { label: 'Better Auth', to: 'https://better-auth.com', target: '_blank' },
  { label: 'Nuxt UI', to: 'https://ui.nuxt.com', target: '_blank' },
]

async function logout() {
  if (logoutAction.status.value === 'pending') return

  await logoutAction.execute({
    fetchOptions: {
      onSuccess: async () => {
        await fetchSession({ force: true })
        await navigateTo('/')
      },
    },
  })

  if (logoutAction.error.value) {
    toast.add({ title: logoutAction.error.value.message, color: 'error' })
  }
}
</script>

<template>
  <UApp>
    <NuxtRouteAnnouncer />
    <NuxtLoadingIndicator />
    <UHeader title="Nuxt Better Auth">
      <UNavigationMenu :items="headerLinks" class="hidden md:flex" />
      <template #right>
        <UColorModeButton />
        <UButton
          to="https://github.com/atinux/nuxthub-better-auth"
          icon="i-simple-icons-github"
          color="neutral"
          variant="ghost"
          target="_blank"
          aria-label="View source on GitHub"
        />
        <UButton
          v-if="loggedIn"
          color="neutral"
          :loading="logoutAction.status.value === 'pending'"
          @click="logout"
        >
          Sign out
        </UButton>
      </template>
      <template #body>
        <UNavigationMenu :items="headerLinks" orientation="vertical" />
      </template>
    </UHeader>
    <div class="flow-root bg-gradient-to-b from-primary-50/80 via-transparent to-transparent dark:from-primary-950/30">
      <UContainer>
        <UMain class="min-h-[calc(100svh-150px)]">
          <NuxtPage />
        </UMain>
      </UContainer>
    </div>
    <UFooter class="border-t border-default">
      <template #left>
        <span class="text-sm text-muted">Built with Nuxt, Better Auth, and NuxtHub.</span>
      </template>
      <template #right>
        <UNavigationMenu :items="footerLinks" />
      </template>
    </UFooter>
  </UApp>
</template>
