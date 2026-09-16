-- Fix: Drop broken subtotal integrity triggers that prevent order creation
--
-- Root Cause:
-- 1. `orders_subtotal_integrity` was attached to `public.orders`.
-- 2. Its trigger function `private.assert_order_subtotal()` evaluated `old.order_id`.
-- 3. The `orders` table has `id`, not `order_id`, and on `INSERT` the `old` record is unassigned.
--    This resulted in: `record "old" has no field "order_id"` (Error 42703).
-- 4. Furthermore, Supabase REST API clients insert `orders` and `order_items` across separate
--    HTTP requests. Deferred constraint triggers check at transaction commit (the end of each HTTP request),
--    which makes cross-table row checks between orders and order_items impossible across separate requests.

DROP TRIGGER IF EXISTS orders_subtotal_integrity ON public.orders;
DROP TRIGGER IF EXISTS order_items_subtotal_integrity ON public.order_items;
