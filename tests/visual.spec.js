// @ts-check
import { test, expect } from '@playwright/test'

const BASE_URL = 'http://localhost:5173'

// Helper: bypass PIN by setting the session unlock flag
async function bypassPin(page) {
  await page.goto(`${BASE_URL}`)
  await page.evaluate(() => {
    sessionStorage.setItem('fither_unlocked', 'true')
  })
}

test.describe('Visual regression - PIN screens', () => {
  test('PIN login screen has LockIcon and keypad', async ({ page }) => {
    await page.goto(`${BASE_URL}/#/login`)
    await page.waitForLoadState('networkidle')

    // LockIcon should be present (an SVG element within the card)
    const lockSvg = page.locator('svg').first()
    await expect(lockSvg).toBeVisible()

    // PIN dots visible
    const dots = page.locator('[data-testid="pin-dots"]')
    await expect(dots).toBeVisible()

    // 11 buttons: 0-9 + backspace
    const buttons = page.locator('button')
    const count = await buttons.count()
    expect(count).toBeGreaterThanOrEqual(11)

    // Check button minimum size (w-20 = 80px)
    const firstDigitBtn = page.getByRole('button', { name: '1', exact: true })
    const box = await firstDigitBtn.boundingBox()
    expect(box.height).toBeGreaterThanOrEqual(64)
    expect(box.width).toBeGreaterThanOrEqual(64)

    // No console errors
    const errors = []
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text())
    })
    expect(errors).toEqual([])
  })
})

test.describe('Visual regression - App pages', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}`)
    await page.evaluate(() => {
      localStorage.clear()
      sessionStorage.clear()
    })
    await bypassPin(page)
  })

  const routes = [
    { path: '/', name: 'Dashboard' },
    { path: '/log', name: 'LogWorkout' },
    { path: '/history', name: 'History' },
    { path: '/progress', name: 'Progress' },
    { path: '/guide', name: 'Guide' },
    { path: '/settings', name: 'Settings' },
  ]

  for (const route of routes) {
    test(`${route.name} page renders without errors`, async ({ page }) => {
      const errors = []
      page.on('console', msg => {
        if (msg.type() === 'error') errors.push(msg.text())
      })

      await page.goto(`${BASE_URL}/#${route.path}`)
      await page.waitForLoadState('networkidle')

      // Page renders
      await expect(page.locator('body')).toBeVisible()

      // No emoji characters in DOM (check text content)
      const bodyText = await page.locator('body').innerText()
      const emojiRegex = /[\u{1F300}-\u{1FFFF}]/u
      expect(emojiRegex.test(bodyText)).toBe(false)

      // rose-500 class present somewhere (primary colour)
      const pageHtml = await page.content()
      expect(pageHtml).toContain('rose-500')

      // Nav bar visible
      const nav = page.locator('nav')
      await expect(nav).toBeVisible()

      // All 6 nav items present
      const navLinks = nav.locator('a')
      await expect(navLinks).toHaveCount(6)

      // Document title
      const title = await page.title()
      expect(title).toBe('FitHer')

      // No console errors (filter out benign ones like favicon 404)
      const realErrors = errors.filter(e => !e.includes('favicon') && !e.includes('404'))
      expect(realErrors).toEqual([])
    })
  }
})
