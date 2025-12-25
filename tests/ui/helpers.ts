import { fileURLToPath } from 'node:url'
import { expect, type Page } from '@playwright/test'

const fixtures = {
  min: fileURLToPath(new URL('../fixtures/backup-min.json', import.meta.url)),
  dense: fileURLToPath(new URL('../fixtures/backup-dense.json', import.meta.url))
}

export async function disableAnimations(page: Page) {
  await page.addInitScript(() => {
    const style = document.createElement('style')
    style.setAttribute('data-testid', 'disable-animations')
    style.textContent = `
      *, *::before, *::after {
        animation: none !important;
        transition: none !important;
        scroll-behavior: auto !important;
        caret-color: transparent !important;
      }
    `
    document.head.appendChild(style)
  })
}

export async function importFixture(page: Page, fixture: keyof typeof fixtures = 'min') {
  await page.goto('/settings')
  const fileInput = page.locator('input[type="file"]')
  await fileInput.setInputFiles(fixtures[fixture])

  await expect(page.getByText('Готов к импорту')).toBeVisible()
  await page.getByRole('button', { name: 'Импортировать' }).click()
  await expect(page.getByRole('button', { name: 'Импорт завершён' })).toBeVisible()
}

export async function waitForDashboard(page: Page) {
  await page.getByRole('heading', { name: 'Браузерное MVP: контроль балансов' }).waitFor()
}

export async function waitForTransactions(page: Page) {
  await page.getByRole('heading', { name: 'Лента, формы и фильтры' }).waitFor()
}
