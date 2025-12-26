import { test, expect } from '@playwright/test'
import { loadFixture, navigateToPage } from './fixtures'
import { disableAnimations } from './helpers'

test.describe('Accounts Page - Snapshots', () => {
  test.beforeEach(async ({ page }) => {
    await disableAnimations(page)
    // Navigate to settings to upload fixture
    await navigateToPage(page, 'settings')
    // Load minimal fixture
    await loadFixture(page, 'min')
  })

  test('accounts page - mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    // Navigate to accounts page
    await navigateToPage(page, 'accounts')
    
    // Wait for content to load
    await page.waitForSelector('[data-testid="accounts-list"]', { timeout: 5000 }).catch(() => {})
    await page.waitForLoadState('networkidle')
    
    // Take snapshot
    await expect(page).toHaveScreenshot('accounts-mobile.png')
  })

  test('accounts page - desktop viewport', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1280, height: 800 })
    
    // Navigate to accounts page
    await navigateToPage(page, 'accounts')
    
    // Wait for content to load
    await page.waitForSelector('[data-testid="accounts-list"]', { timeout: 5000 }).catch(() => {})
    await page.waitForLoadState('networkidle')
    
    // Take snapshot
    await expect(page).toHaveScreenshot('accounts-desktop.png')
  })

  test('accounts page with dense data - mobile viewport', async ({ page }) => {
    // Load dense fixture
    await navigateToPage(page, 'settings')
    await loadFixture(page, 'dense')
    
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    // Navigate to accounts page
    await navigateToPage(page, 'accounts')
    
    // Wait for content to load
    await page.waitForSelector('[data-testid="accounts-list"]', { timeout: 5000 }).catch(() => {})
    await page.waitForLoadState('networkidle')
    
    // Take snapshot
    await expect(page).toHaveScreenshot('accounts-dense-mobile.png')
  })

  test('accounts page with dense data - desktop viewport', async ({ page }) => {
    // Load dense fixture
    await navigateToPage(page, 'settings')
    await loadFixture(page, 'dense')
    
    // Set desktop viewport
    await page.setViewportSize({ width: 1280, height: 800 })
    
    // Navigate to accounts page
    await navigateToPage(page, 'accounts')
    
    // Wait for content to load
    await page.waitForSelector('[data-testid="accounts-list"]', { timeout: 5000 }).catch(() => {})
    await page.waitForLoadState('networkidle')
    
    // Take snapshot
    await expect(page).toHaveScreenshot('accounts-dense-desktop.png')
  })
})
