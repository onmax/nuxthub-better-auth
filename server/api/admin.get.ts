export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event, {
    user: { role: 'admin' },
  })

  return {
    message: 'Restricted admin access confirmed.',
    userId: user.id,
  }
})
