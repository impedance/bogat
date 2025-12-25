import { test, expect } from '@playwright/test'
import { disableAnimations, importFixture, waitForDashboard, waitForTransactions } from './helpers'

test.beforeEach(async ({ page }) => {
  await disableAnimations(page)
})

test('smoke: import -> navigate -> filter -> export', async ({ page }) => {
  await importFixture(page, 'min')

  await page.goto('/')
  await waitForDashboard(page)

  await page.goto('/transactions')
  await waitForTransactions(page)

  const filterCard = page.locator('div', {
    has: page.getByRole('heading', { name: 'Фильтры и поиск' })
  })

  await filterCard.getByLabel('Счёт').selectOption({ label: 'Card' })
  await filterCard.getByLabel('Категория').selectOption({ label: 'Food' })
  await filterCard.getByLabel('Поиск по заметке').fill('coffee')
  await filterCard.getByRole('button', { name: 'Применить' }).click()

  await expect(page.getByText('coffee')).toBeVisible()

  await page.goto('/accounts')
  await page.getByRole('heading', { name: 'Настройка списков и балансов' }).waitFor()

  await page.goto('/categories')
  await page.getByRole('heading', { name: 'Доходы и расходы в одном месте' }).waitFor()

  await page.goto('/settings')
  await page.getByRole('heading', { name: 'Настройки и бэкапы' }).waitFor()

  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Скачать JSON' }).click()
  const download = await downloadPromise
  expect(download.suggestedFilename()).toMatch(/ynab-lite-backup/)
})
