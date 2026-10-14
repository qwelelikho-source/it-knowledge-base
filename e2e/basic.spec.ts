import { test, expect } from '@playwright/test'

test('home page loads and displays content', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('h1')).toContainText('IT Knowledge Base')
  await expect(page.locator('text=Browse by Category')).toBeVisible()
  await expect(page.locator('text=Recently Updated Guides')).toBeVisible()
})

test('search functionality works', async ({ page }) => {
  await page.goto('/')
  await page.fill('input[name="q"]', 'wifi')
  await page.press('input[name="q"]', 'Enter')
  await expect(page).toHaveURL(/\/search/)
  await expect(page.locator('text=Search Guides')).toBeVisible()
})

test('guide detail page loads', async ({ page }) => {
  await page.goto('/')
  await page.click('a[href^="/guides/"]')
  await expect(page.locator('h1')).toBeVisible()
  await expect(page.locator('text=Was this guide helpful?')).toBeVisible()
})

test('feedback widget prevents multiple votes', async ({ page }) => {
  await page.goto('/guides/wifi-not-connecting')
  
  // Click Yes button
  await page.click('button:has-text("Yes")')
  await expect(page.locator('text=Thank you for your feedback!')).toBeVisible()
  
  // Reload page and check if vote is remembered
  await page.reload()
  await expect(page.locator('text=Thank you for your feedback!')).toBeVisible()
})

test('admin login redirects unauthenticated users', async ({ page }) => {
  await page.goto('/admin')
  await expect(page).toHaveURL('/admin/login')
})

test('admin login requires valid credentials', async ({ page }) => {
  await page.goto('/admin/login')
  await page.fill('input[type="email"]', 'admin@example.com')
  await page.fill('input[type="password"]', 'wrongpassword')
  await page.click('button:has-text("Sign In")')
  await expect(page.locator('text=Invalid email or password')).toBeVisible()
})
