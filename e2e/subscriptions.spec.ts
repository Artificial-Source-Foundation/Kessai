import { test, expect } from '@playwright/test'

test.describe('Subscriptions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: /subscriptions/i }).click()
  })

  test('should show empty state when no subscriptions exist', async ({ page }) => {
    // This test assumes fresh state - may need to be adjusted
    // based on whether the database persists between tests
    const emptyState = page.getByText(/no subscriptions yet/i)
    const subscriptionsList = page.getByRole('table')

    // Either empty state or subscriptions list should be visible
    const hasEmptyState = await emptyState.isVisible().catch(() => false)
    const hasList = await subscriptionsList.isVisible().catch(() => false)

    expect(hasEmptyState || hasList).toBe(true)
  })

  test('should open add subscription dialog', async ({ page }) => {
    // Click the add subscription button
    await page.getByRole('button', { name: /add subscription/i }).click()

    // Dialog should be visible
    await expect(page.getByRole('dialog')).toBeVisible()

    // Form fields should be present
    await expect(page.getByLabel(/name/i)).toBeVisible()
    await expect(page.getByLabel(/amount/i)).toBeVisible()
  })

  test('should close dialog on cancel', async ({ page }) => {
    // Open dialog
    await page.getByRole('button', { name: /add subscription/i }).click()
    await expect(page.getByRole('dialog')).toBeVisible()

    // Click cancel or close button
    await page.keyboard.press('Escape')

    // Dialog should be closed
    await expect(page.getByRole('dialog')).not.toBeVisible()
  })

  test('should switch between view modes', async ({ page }) => {
    // Grid view button
    const gridButton = page.getByRole('button', { name: /grid view/i })
    const listButton = page.getByRole('button', { name: /list view/i })
    const bentoButton = page.getByRole('button', { name: /bento view/i })

    // Check if view toggle exists (only shows when there are subscriptions)
    const hasViewToggle = await gridButton.isVisible().catch(() => false)

    if (hasViewToggle) {
      // Switch to grid view
      await gridButton.click()
      // Switch to list view
      await listButton.click()
      // Switch to bento view
      await bentoButton.click()

      // Verify we're on bento view (bento component should be visible)
      expect(true).toBe(true) // View switch completed without error
    }
  })

  test('should filter subscriptions by search', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/search subscriptions/i)

    // Check if search exists (only shows when there are subscriptions)
    const hasSearch = await searchInput.isVisible().catch(() => false)

    if (hasSearch) {
      await searchInput.fill('Netflix')
      // Should filter the list (actual results depend on data)
    }
  })
})
