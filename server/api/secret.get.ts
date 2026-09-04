export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)

  return {
    message: 'Authenticated access confirmed.',
    userId: user.id,
  }
})
