import { defineServerAuth } from '@nuxtjs/better-auth/config'
import { admin, anonymous } from 'better-auth/plugins'
import { demoAccess, demoAdminRole, demoUserRole } from '#shared/auth-access'

export default defineServerAuth(({ runtimeConfig }) => ({
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: runtimeConfig.githubClientId && runtimeConfig.githubClientSecret
    ? {
        github: {
          clientId: runtimeConfig.githubClientId,
          clientSecret: runtimeConfig.githubClientSecret,
        },
      }
    : undefined,
  account: {
    accountLinking: {
      enabled: true,
    },
  },
  rateLimit: {
    enabled: true,
    storage: 'database',
  },
  plugins: [
    anonymous(),
    admin({
      ac: demoAccess,
      roles: {
        user: demoUserRole,
        admin: demoAdminRole,
      },
    }),
  ],
}))
