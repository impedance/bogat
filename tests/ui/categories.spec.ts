import { test, expect } from '@playwright/test'
import { loadFixture, navigateToPage } from './fixtures'
import { disableAnimations } from './helpers'

test.describe('Categories Page - Snapshots', () => {
  test.beforeEach(async ({ page }) => {
    await disableAnimations(page)
    // Navigate to settings to upload fixture
    await navigateToPage(page, 'settings')
    // Load minimal fixture
    await loadFixture(page, 'min')
  })

  test('categories page - mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    // Navigate to categories page
    await navigateToPage(page, 'categories')
    
    // Wait for content to load
    await page.waitForSelector('[data-testid="categories-list"]', { timeout: 5000 }).catch(() => {})
    await page.waitForLoadState('networkidle')
    
    // Take snapshot
    await expect(page).toHaveScreenshot('categories-mobile.png')
  })

  test('categories page - desktop viewport', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1280, height: 800 })
    
    // Navigate to categories page
    await navigateToPage(page, 'categories')
    
    // Wait for content to load
    await page.waitForSelector('[data-testid="categories-list"]', { timeout: 5000 }).catch(() => {})
    await page.waitForLoadState('networkidle')
    
    // Take snapshot
    await expect(page).toHaveScreenshot('categories-desktop.png')
  })

  test('categories page with dense data - mobile viewport', async ({ page }) => {
    // Load dense fixture
    await navigateToPage(page, 'settings')
    await loadFixture(page, 'dense')
    
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    // Navigate to categories page
    await navigateToPage(page, 'categories')
    
    // Wait for content to load
    await page.waitForSelector('[data-testid="categories-list"]', { timeout: 5000 }).catch(() => {})
    await page.waitForLoadState('networkidle')
    
    // Take snapshot
    await expect(page).toHaveScreenshot('categories-dense-mobile.png')
  })

  test('categories page with dense data - desktop viewport', async ({ page }) => {
    // Load dense fixture
    await navigateToPage(page, 'settings')
    await loadFixture(page, 'dense')
    
    // Set desktop viewport
    await page.setViewportSize({ width: 1280, height: 800 })
    
    // Navigate to categories page
    await navigateToPage(page, 'categories')
    
    // Wait for content to load
    await page.waitForSelector('[data-testid="categories-list"]', { timeout: 5000 }).catch(() => {})
    await page.waitForLoadState('networkidle')
    
    // Take snapshot
    await expect(page).toHaveScreenshot('categories-dense-desktop.png')
  })
})
