import { test, expect } from '@playwright/test'

// These tests expect the seeded sample data (`npm run seed`).
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123'

test('home page loads and displays content', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Find the fix')
  await expect(page.getByRole('heading', { name: 'Browse by category' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Recently updated' })).toBeVisible()
})

test('search finds a guide even when the keyword is spelled without the hyphen', async ({ page }) => {
  await page.goto('/')
  await page.fill('input[name="q"]', 'wifi')
  await page.press('input[name="q"]', 'Enter')
  await expect(page).toHaveURL(/\/search\?q=wifi/)
  await expect(page.getByRole('heading', { name: 'All guides' })).toBeVisible()
  await expect(page.getByRole('link', { name: /Wi-Fi Not Connecting/ })).toBeVisible()
})

test('search shows an empty state when nothing matches', async ({ page }) => {
  await page.goto('/search?q=zzzzqq')
  await expect(page.getByText('No guides match your search')).toBeVisible()
})

test('category chips filter the results', async ({ page }) => {
  await page.goto('/search')
  await page.getByRole('link', { name: /^Hardware/ }).click()
  await expect(page).toHaveURL(/category=hardware/)
  await expect(page.getByRole('link', { name: /Printer Offline/ })).toBeVisible()
  await expect(page.getByRole('link', { name: /Wi-Fi Not Connecting/ })).toHaveCount(0)
})

test('guide detail page loads with numbered steps', async ({ page }) => {
  await page.goto('/')
  await page.click('a[href^="/guides/"]')
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await expect(page.locator('ol > li[id^="step-"]').first()).toBeVisible()
  await expect(page.getByText('Did this fix your problem?')).toBeVisible()
})

test('unknown guides return a 404 page', async ({ page }) => {
  const response = await page.goto('/guides/does-not-exist')
  expect(response?.status()).toBe(404)
  await expect(page.getByText("We can't find that page")).toBeVisible()
})

test('feedback widget remembers the vote after reload', async ({ page }) => {
  await page.goto('/guides/wifi-not-connecting')
  await page.getByRole('button', { name: 'Yes, it helped' }).click()
  await expect(page.getByText('Thanks for the feedback')).toBeVisible()

  await page.reload()
  await expect(page.getByText('Thanks for the feedback')).toBeVisible()
})

test('admin pages redirect unauthenticated users to the login page', async ({ page }) => {
  await page.goto('/admin')
  await expect(page).toHaveURL(/\/admin\/login/)
})

test('admin API rejects unauthenticated writes', async ({ request }) => {
  const res = await request.post('/api/guides', { data: {} })
  expect(res.status()).toBe(401)
})

test('admin login rejects wrong credentials', async ({ page }) => {
  await page.goto('/admin/login')
  await page.fill('#email', ADMIN_EMAIL)
  await page.fill('#password', 'wrongpassword')
  await page.getByRole('button', { name: 'Sign in' }).click()
  await expect(page.getByRole('alert')).toContainText('not correct')
})

test('admin can sign in and sees the guides dashboard', async ({ page }) => {
  await page.goto('/admin/login')
  await page.fill('#email', ADMIN_EMAIL)
  await page.fill('#password', ADMIN_PASSWORD)
  await page.getByRole('button', { name: 'Sign in' }).click()
  await expect(page).toHaveURL(/\/admin$/)
  await expect(page.getByRole('heading', { name: 'Guides' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'New guide' })).toBeVisible()
})

test('AI assistant opens, offers suggestions and closes with Escape', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Open IT assistant' }).click()
  const dialog = page.getByRole('dialog', { name: 'IT assistant' })
  await expect(dialog).toBeVisible()
  await expect(dialog.getByRole('button', { name: "I can't connect to Wi-Fi" })).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(dialog).toBeHidden()
})

test('AI assistant API validates its input', async ({ request }) => {
  const res = await request.post('/api/chat', { data: { messages: [] } })
  // 400 when a key is configured, 503 when it is not. Never a 500.
  expect([400, 503]).toContain(res.status())
})
