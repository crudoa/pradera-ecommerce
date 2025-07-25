import { test, expect } from "@playwright/test"

test("homepage loads correctly", async ({ page }) => {
  await page.goto("/")

  // Verificar que el título de la página sea correcto
  await expect(page).toHaveTitle(/AgroPeru/)

  // Verificar que el header esté presente
  await expect(page.locator("header")).toBeVisible()

  // Verificar que haya productos en la página
  await expect(page.locator('[data-testid="product-card"]').first()).toBeVisible()
})

test("search functionality works", async ({ page }) => {
  await page.goto("/")

  // Buscar un producto
  await page.fill('[data-testid="search-input"]', "fertilizante")
  await page.press('[data-testid="search-input"]', "Enter")

  // Verificar que se muestren resultados
  await expect(page.locator('[data-testid="search-results"]')).toBeVisible()
})

test("cart functionality works", async ({ page }) => {
  await page.goto("/")

  // Agregar producto al carrito
  await page.click('[data-testid="add-to-cart-button"]')

  // Verificar que el contador del carrito se actualice
  await expect(page.locator('[data-testid="cart-count"]')).toContainText("1")

  // Ir al carrito
  await page.click('[data-testid="cart-button"]')

  // Verificar que el producto esté en el carrito
  await expect(page.locator('[data-testid="cart-item"]')).toBeVisible()
})
