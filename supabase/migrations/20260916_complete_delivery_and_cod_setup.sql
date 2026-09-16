-- ====================================================================
-- NAMMA ADA: COMPLETE RESTRICTED LOCATION, CATEGORY & COD SYSTEM SETUP
-- Paste and run this script in Supabase SQL Editor
-- ====================================================================

-- 1. DROP BROKEN CONSTRAINTS & TRIGGERS
-- Fixes: record "old" has no field "order_id" (Error 42703)
DROP TRIGGER IF EXISTS orders_subtotal_integrity ON public.orders;
DROP TRIGGER IF EXISTS order_items_subtotal_integrity ON public.order_items;

-- 2. ADD COLUMNS FOR COD & DELIVERY SNAPSHOTS
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS payment_method text NOT NULL DEFAULT 'COD';

ALTER TABLE public.order_items 
ADD COLUMN IF NOT EXISTS delivery_type text NOT NULL DEFAULT 'INDIA_WIDE';

-- 3. ENSURE DELIVERY SCOPE COLUMN ON PRODUCTS
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'products' 
      AND column_name = 'delivery_scope'
  ) THEN
    ALTER TABLE public.products 
    ADD COLUMN delivery_scope text NOT NULL DEFAULT 'all_india';
  END IF;
END $$;

-- 4. ADD DELIVERY SCOPE COLUMN TO CATEGORIES
ALTER TABLE public.categories 
ADD COLUMN IF NOT EXISTS delivery_scope text NOT NULL DEFAULT 'all_india';

-- 5. UPDATE UNNIYAPPAM AND PAYASAM CATEGORIES TO RESTRICTED LOCATION
UPDATE public.categories 
SET delivery_scope = 'bangalore_only' 
WHERE UPPER(name) IN ('UNNIYAPPAM', 'PAYASAM');

-- 6. SYNC ALL EXISTING PRODUCTS IN RESTRICTED CATEGORIES
UPDATE public.products p
SET delivery_scope = 'bangalore_only'
FROM public.categories c
WHERE p.category_id = c.id
  AND (c.delivery_scope = 'bangalore_only' OR UPPER(c.name) IN ('UNNIYAPPAM', 'PAYASAM'));
