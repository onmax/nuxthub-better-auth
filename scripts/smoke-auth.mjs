import assert from 'node:assert/strict'

const baseURL = (process.env.BASE_URL || process.argv[2] || 'http://127.0.0.1:3000').replace(/\/$/, '')
const demoPassword = 'nuxthub-demo'
const withDemoAccounts = process.env.SMOKE_DEMO_ACCOUNTS === 'true'

class SessionClient {
  cookies = new Map()

  async request(path, options = {}) {
    const headers = new Headers(options.headers)
    headers.set('accept', 'application/json')
    headers.set('origin', baseURL)

    if (this.cookies.size) {
      headers.set('cookie', [...this.cookies].map(([key, value]) => `${key}=${value}`).join('; '))
    }

    let body
    if (options.body !== undefined) {
      headers.set('content-type', 'application/json')
      body = JSON.stringify(options.body)
    }

    const response = await fetch(`${baseURL}${path}`, {
      ...options,
      signal: options.signal ?? AbortSignal.timeout(10_000),
      body,
      headers,
      redirect: 'manual',
    })

    for (const cookie of response.headers.getSetCookie()) {
      const [pair, ...attributes] = cookie.split(';')
      const separator = pair.indexOf('=')
      const name = pair.slice(0, separator)
      const value = pair.slice(separator + 1)
      if (!value || attributes.some(attribute => /^\s*max-age=0\s*$/i.test(attribute))) {
        this.cookies.delete(name)
      }
      else {
        this.cookies.set(name, value)
      }
    }

    return response
  }
}

async function expectStatus(client, path, expected, options) {
  const response = await client.request(path, options)
  assert.equal(response.status, expected, `${path}: expected ${expected}, received ${response.status}`)
  return response
}

async function waitForReady() {
  const deadline = Date.now() + 30_000
  while (Date.now() < deadline) {
    try {
      const response = await fetch(baseURL, { redirect: 'manual', signal: AbortSignal.timeout(5_000) })
      if (response.status === 200) return
    }
    catch {
      // The server may still be binding its port.
    }
    await new Promise(resolve => setTimeout(resolve, 500))
  }
  throw new Error(`App did not become ready within 30 seconds: ${baseURL}`)
}

async function session(client) {
  const response = await expectStatus(client, '/api/auth/get-session', 200)
  return response.json()
}

async function signIn(client, email) {
  await expectStatus(client, '/api/auth/sign-in/email', 200, {
    method: 'POST',
    body: { email, password: demoPassword },
  })
}

async function signOut(client) {
  const previousSession = new SessionClient()
  previousSession.cookies = new Map(client.cookies)
  await expectStatus(client, '/api/auth/sign-out', 200, { method: 'POST', body: {} })
  assert.equal(await session(client), null)
  await expectStatus(previousSession, '/api/secret', 401)
}

async function expectLoginRedirect(client, path) {
  const response = await expectStatus(client, path, 302)
  const location = new URL(response.headers.get('location'), baseURL)
  assert.equal(location.origin, baseURL)
  assert.equal(location.pathname, '/')
  assert.equal(location.searchParams.get('redirect'), path)
}

async function expectSessionPage(client, currentSession, otherEmail) {
  const response = await expectStatus(client, '/user', 200)
  const html = await response.text()
  assert.ok(html.includes(currentSession.user.email), 'SSR must render the current user')
  assert.ok(!html.includes(otherEmail), 'SSR must not render another user')
  assert.ok(!html.includes(currentSession.session.token), 'SSR must not expose the session token')
}

async function expectProtectedData(client, path, userId) {
  const response = await expectStatus(client, path, 200)
  const data = await response.json()
  assert.equal(data.userId, userId)
}

await waitForReady()

const loggedOut = new SessionClient()
await expectStatus(loggedOut, '/', 200)
await expectStatus(loggedOut, '/api/secret', 401)
await expectStatus(loggedOut, '/api/admin', 401)
await expectStatus(loggedOut, '/api/auth/list-accounts', 401)
for (const path of ['/user', '/secret', '/admin']) {
  await expectLoginRedirect(loggedOut, path)
}
await expectStatus(loggedOut, '/api/auth/sign-in/email', 401, {
  method: 'POST',
  body: { email: 'user@nuxthub.demo', password: 'incorrect-password' },
})
assert.equal(await session(loggedOut), null)

const anonymous = new SessionClient()
await expectStatus(anonymous, '/api/auth/sign-in/anonymous', 200, { method: 'POST', body: {} })
const anonymousSession = await session(anonymous)
assert.equal(anonymousSession.user.isAnonymous, true)
await expectProtectedData(anonymous, '/api/secret', anonymousSession.user.id)
await expectStatus(anonymous, '/api/admin', 403)
await expectStatus(anonymous, '/api/auth/delete-anonymous-user', 200, { method: 'POST', body: {} })
assert.equal(await session(anonymous), null)

if (!withDemoAccounts) {
  for (const email of ['user@nuxthub.demo', 'admin@nuxthub.demo']) {
    await expectStatus(loggedOut, '/api/auth/sign-in/email', 401, {
      method: 'POST',
      body: { email, password: demoPassword },
    })
  }
  assert.equal(await session(loggedOut), null)
  console.log(`Default auth smoke passed, without demo accounts: ${baseURL}`)
  process.exit(0)
}

const user = new SessionClient()
await signIn(user, 'user@nuxthub.demo')
const userSession = await session(user)
assert.equal(userSession.user.role, 'user')
await expectProtectedData(user, '/api/secret', userSession.user.id)
await expectStatus(user, '/api/admin', 403)
await expectStatus(user, '/admin', 403)

const admin = new SessionClient()
await signIn(admin, 'admin@nuxthub.demo')
const adminSession = await session(admin)
assert.equal(adminSession.user.role, 'admin')
await expectProtectedData(admin, '/api/secret', adminSession.user.id)
await expectProtectedData(admin, '/api/admin', adminSession.user.id)
await expectStatus(admin, '/api/auth/admin/list-users', 403)
await Promise.all([
  expectSessionPage(user, userSession, adminSession.user.email),
  expectSessionPage(admin, adminSession, userSession.user.email),
])
for (const [client, path, expectedMessage] of [
  [user, '/secret', 'Authenticated access confirmed.'],
  [admin, '/admin', 'Restricted admin access confirmed.'],
]) {
  const response = await expectStatus(client, path, 200)
  assert.ok((await response.text()).includes(expectedMessage), `${path} must forward session cookies during SSR`)
}
await signOut(user)
await signOut(admin)

console.log(`Auth smoke passed: ${baseURL}`)
