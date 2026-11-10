-- ====================================================================
-- NAMMA ADA: PRODUCT PAYMENT METHODS CONFIGURATION
-- Migration: 20261110_product_payment_methods.sql
-- Date: 2026-11-10
--
-- Description:
-- 1. Adds allow_cod and allow_reserve_pay boolean columns to public.products
--    with default true (backward-compatible defaults for existing products).
-- 2. Adds check constraint ensuring at least one payment method is enabled.
-- 3. Updates storefront_products view with allow_cod and allow_reserve_pay.
-- 4. Recreates admin_products view so new columns are reflected.
-- ====================================================================

-- 1. Add allow_cod and allow_reserve_pay to public.products
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'products'
      AND column_name = 'allow_cod'
  ) THEN
    ALTER TABLE public.products
    ADD COLUMN allow_cod boolean NOT NULL DEFAULT true;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'products'
      AND column_name = 'allow_reserve_pay'
  ) THEN
    ALTER TABLE public.products
    ADD COLUMN allow_reserve_pay boolean NOT NULL DEFAULT true;
  END IF;
END $$;

-- 2. Ensure at least one payment method is enabled per product
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'products_at_least_one_payment_method'
  ) THEN
    ALTER TABLE public.products
    ADD CONSTRAINT products_at_least_one_payment_method
    CHECK (allow_cod = true OR allow_reserve_pay = true);
  END IF;
END $$;

-- 3. Update storefront_products security-barrier view
CREATE OR REPLACE VIEW public.storefront_products
WITH (security_barrier = true)
AS
SELECT
  p.id,
  p.category_id,
  p.name,
  p.slug,
  p.short_description,
  p.description,
  p.price_paise,
  (p.stock_quantity > 0) AS is_in_stock,
  p.delivery_scope,
  p.is_free_shipping,
  p.is_featured,
  p.display_order,
  p.allow_cod,
  p.allow_reserve_pay
FROM public.products p
WHERE p.is_active;

-- 4. Recreate admin_products view
CREATE OR REPLACE VIEW public.admin_products
WITH (security_barrier = true)
AS
SELECT p.*
FROM public.products p
WHERE private.is_admin();

-- 5. Re-apply permissions & ownership
ALTER VIEW public.storefront_products OWNER TO postgres;
ALTER VIEW public.admin_products OWNER TO postgres;

GRANT SELECT ON public.storefront_products TO anon, authenticated;
GRANT SELECT ON public.admin_products TO authenticated;

