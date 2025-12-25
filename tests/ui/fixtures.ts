import { Page } from '@playwright/test'
import * as fs from 'fs'
import * as path from 'path'

export async function loadFixture(page: Page, fixtureName: 'min' | 'dense'): Promise<void> {
  const fixtureFile = path.join(__dirname, `../fixtures/backup-${fixtureName}.json`)
  const fixtureData = JSON.parse(fs.readFileSync(fixtureFile, 'utf-8'))

  // Import fixture by simulating the import process
  // Get the file input element and upload
  const input = page.locator('input[type="file"]').first()
  await input.setInputFiles({
    name: `backup-${fixtureName}.json`,
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify(fixtureData))
  })

  // Wait for the import to complete
  await page.waitForTimeout(500)
}

export async function navigateToPage(page: Page, route: string): Promise<void> {
  await page.goto(`http://127.0.0.1:4173/${route}`)
  await page.waitForLoadState('networkidle')
}

export const VIEWPORTS = {
  mobile: { width: 375, height: 667 },
  desktop: { width: 1280, height: 800 }
}
