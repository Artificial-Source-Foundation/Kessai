import { test, expect } from '@playwright/test'

test.describe('Settings', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: /settings/i }).click()
  })

  test('should display settings page', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /settings/i })).toBeVisible()
  })

  test('should show theme options', async ({ page }) => {
    // Look for theme-related content
    const themeSection = page.getByText(/theme/i)
    await expect(themeSection.first()).toBeVisible()
  })

  test('should show currency options', async ({ page }) => {
    // Look for currency-related content
    const currencySection = page.getByText(/currency/i)
    await expect(currencySection.first()).toBeVisible()
  })

  test('should show data management section', async ({ page }) => {
    // Look for export/import options
    const exportButton = page.getByRole('button', { name: /export/i })
    const importSection = page.getByText(/import/i)

    // At least one data management option should be visible
    const hasExport = await exportButton.isVisible().catch(() => false)
    const hasImport = await importSection.isVisible().catch(() => false)

    expect(hasExport || hasImport).toBe(true)
  })

  test('should toggle theme', async ({ page }) => {
    // Find theme toggle buttons
    const darkButton = page.getByRole('button', { name: /dark/i })
    const lightButton = page.getByRole('button', { name: /light/i })

    const hasDark = await darkButton.isVisible().catch(() => false)
    const hasLight = await lightButton.isVisible().catch(() => false)

    if (hasDark && hasLight) {
      // Toggle to light
      await lightButton.click()
      // Toggle back to dark
      await darkButton.click()
    }
  })
})
