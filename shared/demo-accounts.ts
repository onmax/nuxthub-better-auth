export const demoPassword = 'nuxthub-demo'

export const demoAccounts = {
  user: {
    label: 'Demo user',
    email: 'user@nuxthub.demo',
    password: demoPassword,
  },
  admin: {
    label: 'Demo admin',
    email: 'admin@nuxthub.demo',
    password: demoPassword,
  },
} as const
