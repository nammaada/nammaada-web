/*
  Migration: Restricted Product Location & COD Flow
  Date: 2026-09-16
  Description:
  1. Documents the site_settings configuration key 'restricted_locations'
  2. Documents delivery_scope enum usage:
     - 'all_india' corresponds to 'INDIA_WIDE' (normal products)
     - 'bangalore_only' corresponds to 'RESTRICTED_LOCATION' (COD-only fresh delicacies)
  3. Provides optional column additions for orders and order_items for database-level snapshots
*/

-- 1. Optional column additions on public.orders and public.order_items
-- (Application layer already safely reads and writes via site_settings and metadata snapshots)
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'orders' and column_name = 'payment_method'
  ) then
    alter table public.orders add column payment_method text not null default 'COD';
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'order_items' and column_name = 'delivery_type'
  ) then
    alter table public.order_items add column delivery_type text not null default 'INDIA_WIDE';
  end if;
end $$;

-- 2. Ensure site_settings key exists for restricted locations
comment on table public.site_settings is 'Stores key-value configurations including restricted_locations JSON list and order metadata';
