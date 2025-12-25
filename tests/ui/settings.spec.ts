import { test, expect } from '@playwright/test'
import { navigateToPage } from './fixtures'

test.describe('Settings Page - Snapshots', () => {
  test('settings page - mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.deviceScaleFactor = 2
    
    // Navigate to settings page
    await navigateToPage(page, 'settings')
    
    // Wait for content to load
    await page.waitForSelector('[data-testid="settings-export"]', { timeout: 5000 }).catch(() => {})
    await page.waitForLoadState('networkidle')
    
    // Take snapshot
    await expect(page).toHaveScreenshot('settings-mobile.png')
  })

  test('settings page - desktop viewport', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.deviceScaleFactor = 1
    
    // Navigate to settings page
    await navigateToPage(page, 'settings')
    
    // Wait for content to load
    await page.waitForSelector('[data-testid="settings-export"]', { timeout: 5000 }).catch(() => {})
    await page.waitForLoadState('networkidle')
    
    // Take snapshot
    await expect(page).toHaveScreenshot('settings-desktop.png')
  })

  test('settings page - export block visible - mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.deviceScaleFactor = 2
    
    // Navigate to settings page
    await navigateToPage(page, 'settings')
    
    // Wait for export section
    await page.waitForSelector('[data-testid="settings-export"]', { timeout: 5000 }).catch(() => {})
    
    // Scroll to export section if needed
    await page.locator('[data-testid="settings-export"]').scrollIntoViewIfNeeded()
    await page.waitForTimeout(200)
    
    // Take snapshot
    await expect(page).toHaveScreenshot('settings-export-mobile.png')
  })

  test('settings page - export block visible - desktop viewport', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.deviceScaleFactor = 1
    
    // Navigate to settings page
    await navigateToPage(page, 'settings')
    
    // Wait for export section
    await page.waitForSelector('[data-testid="settings-export"]', { timeout: 5000 }).catch(() => {})
    
    // Scroll to export section if needed
    await page.locator('[data-testid="settings-export"]').scrollIntoViewIfNeeded()
    await page.waitForTimeout(200)
    
    // Take snapshot
    await expect(page).toHaveScreenshot('settings-export-desktop.png')
  })
})
