import { test, expect } from '@playwright/test'

test('homepage loads correctly', async ({ page }) => {
  await page.goto('/')

  // Check that the main heading is visible
  await expect(
    page.getByRole('heading', { name: 'Discover Professional Stock Pitches' })
  ).toBeVisible()

  // Check that navigation is present
  await expect(page.getByRole('navigation')).toBeVisible()
  await expect(page.getByText('PitchBase')).toBeVisible()
})

test('navigation works', async ({ page }) => {
  await page.goto('/')

  // Check sign in button is visible for unauthenticated users
  await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible()

  // Check search input is present
  await expect(page.getByPlaceholder('Search pitches...')).toBeVisible()
})

test('pitch detail page loads', async ({ page }) => {
  // This test assumes we have seeded data
  await page.goto('/p/tesla-the-future-of-transportation')

  // Check that pitch content is loaded
  await expect(
    page.getByText('Tesla: The Future of Transportation')
  ).toBeVisible()
  await expect(page.getByText('TSLA')).toBeVisible()

  // Check back button
  await expect(
    page.getByRole('link', { name: 'Back to pitches' })
  ).toBeVisible()
})



