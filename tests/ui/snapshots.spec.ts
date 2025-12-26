import { test, expect } from '@playwright/test'
import { disableAnimations, importFixture, waitForDashboard, waitForTransactions } from './helpers'

test.beforeEach(async ({ page }) => {
  await disableAnimations(page)
})

test('snapshot: dashboard', async ({ page }) => {
  await importFixture(page, 'min')
  await page.goto('/')
  await waitForDashboard(page)
  await expect(page).toHaveScreenshot('dashboard.png', { fullPage: true })
})

test('snapshot: transactions list', async ({ page }) => {
  await importFixture(page, 'dense')
  await page.goto('/transactions')
  await waitForTransactions(page)
  await page.getByText('coffee').waitFor()

  await expect(page.getByTestId('transaction-list-card')).toHaveScreenshot(
    'transactions-list.png'
  )
})

test('snapshot: transaction form', async ({ page }) => {
  await importFixture(page, 'min')
  await page.goto('/transactions')
  await waitForTransactions(page)

  await expect(page.getByTestId('transaction-form-card')).toHaveScreenshot(
    'transaction-form.png'
  )
})
