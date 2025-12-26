import { test, expect } from '@playwright/test'
import { navigateToPage } from './fixtures'
import { disableAnimations } from './helpers'

test.describe('Empty States - Snapshots', () => {
  test.beforeEach(async ({ page }) => {
    await disableAnimations(page)
  })

  test('dashboard empty state - mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    // Navigate to dashboard (should be empty initially)
    await navigateToPage(page, '')
    
    // Wait for page to load
    await page.waitForLoadState('networkidle')
    
    // Take snapshot
    await expect(page).toHaveScreenshot('dashboard-empty-mobile.png')
  })

  test('dashboard empty state - desktop viewport', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1280, height: 800 })
    
    // Navigate to dashboard (should be empty initially)
    await navigateToPage(page, '')
    
    // Wait for page to load
    await page.waitForLoadState('networkidle')
    
    // Take snapshot
    await expect(page).toHaveScreenshot('dashboard-empty-desktop.png')
  })

  test('transactions empty state - mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    // Navigate to transactions (should be empty initially)
    await navigateToPage(page, 'transactions')
    
    // Wait for page to load
    await page.waitForLoadState('networkidle')
    
    // Take snapshot
    await expect(page).toHaveScreenshot('transactions-empty-mobile.png')
  })

  test('transactions empty state - desktop viewport', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1280, height: 800 })
    
    // Navigate to transactions (should be empty initially)
    await navigateToPage(page, 'transactions')
    
    // Wait for page to load
    await page.waitForLoadState('networkidle')
    
    // Take snapshot
    await expect(page).toHaveScreenshot('transactions-empty-desktop.png')
  })

  test('accounts empty state - mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    // Navigate to accounts (should be empty initially)
    await navigateToPage(page, 'accounts')
    
    // Wait for page to load
    await page.waitForLoadState('networkidle')
    
    // Take snapshot
    await expect(page).toHaveScreenshot('accounts-empty-mobile.png')
  })

  test('accounts empty state - desktop viewport', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1280, height: 800 })
    
    // Navigate to accounts (should be empty initially)
    await navigateToPage(page, 'accounts')
    
    // Wait for page to load
    await page.waitForLoadState('networkidle')
    
    // Take snapshot
    await expect(page).toHaveScreenshot('accounts-empty-desktop.png')
  })
})
