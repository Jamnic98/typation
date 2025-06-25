import { test, expect } from '@playwright/test'

const baseUrl = 'http://localhost:5173'

let testEmail: string
const testPassword = 'TestPassword123!'

test.describe('Auth flow', () => {
  test.beforeAll(() => {
    testEmail = `testuser+${Date.now()}@example.com`
  })

  test('User can register and is logged in automatically', async ({ page }) => {
    await page.goto(`${baseUrl}/auth/register`)

    await page.fill('input[name="user_name"]', 'testuser')
    await page.fill('input[name="first_name"]', 'Test')
    await page.fill('input[name="last_name"]', 'User')
    await page.fill('input[name="email"]', testEmail)
    await page.fill('input[name="password"]', testPassword)
    await page.click('button[type="submit"]')

    // Wait for expected URL change (SPA-style)
    await expect(page).toHaveURL(`${baseUrl}/`)

    // Then check for visible content
    await expect(page.locator('[data-testid="home-user-name"]')).toBeVisible({ timeout: 5000 })

    const token = await page.evaluate(() => localStorage.getItem('token'))
    expect(token).not.toBeNull()

    const user = await page.evaluate(() => localStorage.getItem('user'))
    expect(user).toContain(testEmail)
  })

  test.skip('User can log in with existing credentials', async ({ page }) => {
    await page.goto(`${baseUrl}/auth/login`)

    await page.fill('input[type="email"]', testEmail)
    await page.fill('input[type="password"]', testPassword)

    await Promise.all([
      page.waitForURL(`${baseUrl}/`, { waitUntil: 'networkidle', timeout: 5000}),
      page.click('button[type="submit"]'),
    ])

    await expect(page.locator('[data-testid="home-user-name"]')).toBeVisible({ timeout: 5000 })

    const token = await page.evaluate(() => localStorage.getItem('token'))
    expect(token).not.toBeNull()

    const user = await page.evaluate(() => localStorage.getItem('user'))
    expect(user).toContain(testEmail)
  })
})


// TODO: Uncomment the following test when logout functionality is implemented
// test('User can log out successfully', async ({ page }) => {
//   const baseUrl = 'http://localhost:5173'

//   // Assume user is already logged in and on the home page
//   await page.goto(baseUrl)

//   // Find logout button with case-insensitive regex for "log out", "Log Out", etc.
//   const logoutBtn = page.locator('button', { hasText: /log\s*out/i })
//   await expect(logoutBtn).toBeVisible()

//   // Click the logout button
//   await logoutBtn.click()

//   // Check that logout button no longer exists
//   await expect(page.locator('button', { hasText: /log\s*out/i })).toHaveCount(0)

//   // Check that a login button is visible now (adjust selector to your login button)
//   const loginBtn = page.locator('button', { hasText: /log\s*in/i })
//   await expect(loginBtn).toBeVisible()

//   // Check that username display is no longer present (assuming data-testid="home-user-name")
//   await expect(page.locator('[data-testid="home-user-name"]')).toHaveCount(0)
// })
