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

  const listCard = page.locator('div', {
    has: page.getByRole('heading', { name: 'Лента операций' })
  })

  await expect(listCard).toHaveScreenshot('transactions-list.png')
})

test('snapshot: transaction form', async ({ page }) => {
  await importFixture(page, 'min')
  await page.goto('/transactions')
  await waitForTransactions(page)

  const formCard = page.locator('div', {
    has: page.getByRole('heading', { name: 'Новая транзакция' })
  })

  await expect(formCard).toHaveScreenshot('transaction-form.png')
})
