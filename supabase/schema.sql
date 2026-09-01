/*
  Namma Ada — authoritative Supabase schema

  This is the single database definition source of truth for the application.
  The application uses Next.js App Router, Supabase Auth, Cloudinary media,
  Razorpay payments, and secure server-side guest checkout. Customers do not
  have accounts; one manually-created Supabase Auth user is the intended admin.

  Public storefront reads are deliberately narrow. Sensitive data is protected
  by RLS and is expected to be written by trusted server-side operations after
  authoritative validation. No secrets or production business data belong here.

  Unresolved business decisions intentionally left configurable for later phases:
  - the exact Bangalore boundary (pincodes, district, or configured zone)
  - tax/GST presentation and invoicing
  - free-shipping behavior when a cart mixes products
  - stock reservation timing and checkout expiration
  - whether Cash on Delivery will be supported

  Integrity decisions:
  - A product without variants uses products.price_paise and products.stock_quantity.
    When variants are used, the selected product_variants row is authoritative for
    price and stock; the server must not mix the two models for one line item.
  - A deferred constraint trigger checks order subtotal against order items at
    transaction commit. Orders and their items must therefore be finalized in one
    trusted transaction.
  - Payment amount is tied to orders.total_amount_paise by a composite foreign key.
    Razorpay amount and signature verification still happen server-side.
  - Stock is intended to be decremented by the private atomic helper below in the
    future trusted finalization transaction; this schema does not deduct stock now.
*/

-- ---------------------------------------------------------------------------
-- Extensions and private helpers
-- ---------------------------------------------------------------------------

create extension if not exists pgcrypto;

create schema if not exists private;

-- ---------------------------------------------------------------------------
-- Controlled values
-- ---------------------------------------------------------------------------

create type public.delivery_scope as enum (
  'all_india',
  'bangalore_only'
);

create type public.order_status as enum (
  'pending',
  'paid',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
  'refunded'
);

create type public.payment_status as enum (
  'pending',
  'failed',
  'paid',
  'refunded'
);

create type public.enquiry_status as enum (
  'new',
  'in_progress',
  'resolved',
  'closed'
);

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table public.admin_users (
  user_id uuid primary key references auth.users (id) on delete restrict,
  created_at timestamptz not null default now()
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) > 0),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  description text,
  is_active boolean not null default true,
  display_order integer not null default 0 check (display_order >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.categories (id) on delete set null,
  name text not null check (length(trim(name)) > 0),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  short_description text,
  description text,
  price_paise bigint not null check (price_paise >= 0),
  stock_quantity integer not null default 0 check (stock_quantity >= 0),
  delivery_scope public.delivery_scope not null default 'all_india',
  is_free_shipping boolean not null default false,
  is_active boolean not null default false,
  is_featured boolean not null default false,
  display_order integer not null default 0 check (display_order >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Variants are optional. Products without variants use the product price and
-- stock; products with variants may use these rows as their purchasable units.
create table public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete restrict,
  name text not null check (length(trim(name)) > 0),
  sku text unique,
  price_paise bigint not null check (price_paise >= 0),
  stock_quantity integer not null default 0 check (stock_quantity >= 0),
  is_active boolean not null default true,
  display_order integer not null default 0 check (display_order >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (product_id, name),
  unique (id, product_id)
);

create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete restrict,
  cloudinary_public_id text not null,
  secure_url text not null check (secure_url ~ '^https://'),
  alt_text text not null check (length(trim(alt_text)) > 0),
  display_order integer not null default 0 check (display_order >= 0),
  is_primary boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.shipping_rules (
  id uuid primary key default gen_random_uuid(),
  state_code text not null check (state_code ~ '^[A-Z]{2,3}$'),
  state_name text not null check (length(trim(state_name)) > 0),
  charge_paise bigint not null check (charge_paise >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (state_code)
);

create table public.customers (
  id uuid primary key default gen_random_uuid(),
  full_name text not null check (length(trim(full_name)) > 0),
  phone text not null check (length(trim(phone)) between 7 and 20),
  email text,
  address text not null check (length(trim(address)) > 0),
  district_city text not null check (length(trim(district_city)) > 0),
  state text not null check (length(trim(state)) > 0),
  pincode text not null check (pincode ~ '^[1-9][0-9]{5}$'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.courier_partners (
  id uuid primary key default gen_random_uuid(),
  name text not null unique check (length(trim(name)) > 0),
  tracking_url_template text check (
    tracking_url_template is null or tracking_url_template ~ '^https://'
  ),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique default ('NA-' || to_char(now(), 'YYYYMMDD') || '-' || upper(encode(gen_random_bytes(4), 'hex'))),
  customer_id uuid references public.customers (id) on delete set null,
  subtotal_paise bigint not null check (subtotal_paise >= 0),
  shipping_fee_paise bigint not null default 0 check (shipping_fee_paise >= 0),
  total_amount_paise bigint not null check (total_amount_paise >= 0),
  order_status public.order_status not null default 'pending',
  payment_status public.payment_status not null default 'pending',
  customer_name_snapshot text not null check (length(trim(customer_name_snapshot)) > 0),
  customer_phone_snapshot text not null check (length(trim(customer_phone_snapshot)) between 7 and 20),
  customer_email_snapshot text,
  delivery_address_snapshot text not null check (length(trim(delivery_address_snapshot)) > 0),
  delivery_district_city text not null check (length(trim(delivery_district_city)) > 0),
  delivery_state text not null check (length(trim(delivery_state)) > 0),
  delivery_pincode text not null check (delivery_pincode ~ '^[1-9][0-9]{5}$'),
  courier_partner_id uuid references public.courier_partners (id) on delete set null,
  courier_name_snapshot text,
  tracking_id text,
  tracking_url_snapshot text check (tracking_url_snapshot is null or tracking_url_snapshot ~ '^https://'),
  shipped_at timestamptz,
  delivered_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (total_amount_paise = subtotal_paise + shipping_fee_paise),
  check (tracking_id is null or courier_partner_id is not null)
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id uuid references public.products (id) on delete set null,
  product_variant_id uuid,
  product_name_snapshot text not null check (length(trim(product_name_snapshot)) > 0),
  variant_name_snapshot text,
  sku_snapshot text,
  unit_price_paise bigint not null check (unit_price_paise >= 0),
  quantity integer not null check (quantity > 0),
  line_total_paise bigint generated always as (unit_price_paise * quantity) stored,
  created_at timestamptz not null default now(),
  constraint order_items_variant_product_fkey
    foreign key (product_variant_id, product_id)
    references public.product_variants (id, product_id)
    on delete restrict,
  check (product_variant_id is null or product_id is not null),
  check (
    (product_variant_id is null and variant_name_snapshot is null)
    or (product_variant_id is not null and variant_name_snapshot is not null)
  )
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete restrict,
  idempotency_key text not null unique,
  razorpay_order_id text,
  razorpay_payment_id text,
  signature_verified boolean not null default false,
  status public.payment_status not null default 'pending',
  amount_paise bigint not null check (amount_paise >= 0),
  currency text not null default 'INR' check (currency = 'INR'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- A payment amount must match the immutable authoritative order total. The
-- application still independently verifies the Razorpay response amount,
-- Razorpay order ID, payment ID, and signature before marking it paid.
alter table public.orders
  add constraint orders_id_total_unique unique (id, total_amount_paise);

alter table public.payments
  add constraint payments_order_amount_fkey
  foreign key (order_id, amount_paise)
  references public.orders (id, total_amount_paise)
  on delete restrict;

create table public.testimonials (
  id uuid primary key default gen_random_uuid(),
  display_name text not null check (length(trim(display_name)) > 0),
  location text,
  content text not null check (length(trim(content)) > 0),
  is_active boolean not null default false,
  display_order integer not null default 0 check (display_order >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.bulk_enquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) > 0),
  phone text not null check (length(trim(phone)) between 7 and 20),
  email text,
  product_requirement text not null check (length(trim(product_requirement)) > 0),
  quantity_details text not null check (length(trim(quantity_details)) > 0),
  status public.enquiry_status not null default 'new',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Indexes for storefront, admin, and operational queries
-- ---------------------------------------------------------------------------

create index products_active_order_idx on public.products (is_active, display_order, created_at);
create index products_category_idx on public.products (category_id, is_active, display_order);
create index product_variants_product_idx on public.product_variants (product_id, is_active, display_order);
create index product_images_product_idx on public.product_images (product_id, display_order);
create unique index product_images_one_primary_idx on public.product_images (product_id) where is_primary;
create index shipping_rules_active_state_idx on public.shipping_rules (is_active, state_code);
create index customers_phone_idx on public.customers (phone);
create index orders_status_created_idx on public.orders (order_status, created_at desc);
create index orders_customer_idx on public.orders (customer_id, created_at desc);
create index orders_courier_idx on public.orders (courier_partner_id);
create index order_items_order_idx on public.order_items (order_id);
create unique index payments_razorpay_order_idx on public.payments (razorpay_order_id) where razorpay_order_id is not null;
create unique index payments_razorpay_payment_idx on public.payments (razorpay_payment_id) where razorpay_payment_id is not null;
create index payments_order_status_idx on public.payments (order_id, status);
create index testimonials_active_order_idx on public.testimonials (is_active, display_order);
create index bulk_enquiries_status_created_idx on public.bulk_enquiries (status, created_at desc);

-- Public views expose only storefront fields. Exact stock counts and shipping
-- configuration remain server-side; the storefront only needs availability.
-- These views intentionally use PostgreSQL's default security-definer view
-- semantics because base-table SELECT is withheld from public roles. Their
-- explicit active-row and column projections are the security boundary, and
-- security_barrier prevents caller predicates from being pushed through them.
create view public.storefront_products
with (security_barrier = true)
as
select
  p.id,
  p.category_id,
  p.name,
  p.slug,
  p.short_description,
  p.description,
  p.price_paise,
  (p.stock_quantity > 0) as is_in_stock,
  p.delivery_scope,
  p.is_free_shipping,
  p.is_featured,
  p.display_order
from public.products p
where p.is_active;

create view public.storefront_product_variants
with (security_barrier = true)
as
select
  v.id,
  v.product_id,
  v.name,
  v.price_paise,
  (v.stock_quantity > 0) as is_in_stock,
  v.display_order
from public.product_variants v
join public.products p on p.id = v.product_id
where v.is_active and p.is_active;

-- ---------------------------------------------------------------------------
-- Functions and triggers
-- ---------------------------------------------------------------------------

create or replace function private.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = pg_catalog
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = pg_catalog
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = (select auth.uid())
  );
$$;

-- Admin-only views provide the operational fields needed by a future admin
-- server operation without granting direct product/variant/shipping SELECT to
-- every authenticated role. The view predicate calls private.is_admin(), which
-- reads auth.uid() from the actual request context even though the view itself
-- runs with its owner's table privileges. These views must be owned by a trusted
-- Supabase database owner (the SQL Editor's postgres role in deployment).
create view public.admin_products
with (security_barrier = true)
as
select p.*
from public.products p
where private.is_admin();

create view public.admin_product_variants
with (security_barrier = true)
as
select v.*
from public.product_variants v
where private.is_admin();

create view public.admin_shipping_rules
with (security_barrier = true)
as
select s.*
from public.shipping_rules s
where private.is_admin();

create view public.admin_product_images
with (security_barrier = true)
as
select i.*
from public.product_images i
where private.is_admin();

create view public.admin_customers
with (security_barrier = true)
as
select c.*
from public.customers c
where private.is_admin();

create view public.admin_orders
with (security_barrier = true)
as
select o.*
from public.orders o
where private.is_admin();

create view public.admin_order_items
with (security_barrier = true)
as
select oi.*
from public.order_items oi
where private.is_admin();

create view public.admin_payments
with (security_barrier = true)
as
select p.*
from public.payments p
where private.is_admin();

create view public.admin_courier_partners
with (security_barrier = true)
as
select c.*
from public.courier_partners c
where private.is_admin();

create view public.admin_testimonials
with (security_barrier = true)
as
select t.*
from public.testimonials t
where private.is_admin();

create view public.admin_bulk_enquiries
with (security_barrier = true)
as
select e.*
from public.bulk_enquiries e
where private.is_admin();

-- Do not allow an application role to own these security-definer views. The
-- authoritative file is deployed by Supabase's trusted postgres role.
alter view public.storefront_products owner to postgres;
alter view public.storefront_product_variants owner to postgres;
alter view public.admin_products owner to postgres;
alter view public.admin_product_variants owner to postgres;
alter view public.admin_shipping_rules owner to postgres;
alter view public.admin_product_images owner to postgres;
alter view public.admin_customers owner to postgres;
alter view public.admin_orders owner to postgres;
alter view public.admin_order_items owner to postgres;
alter view public.admin_payments owner to postgres;
alter view public.admin_courier_partners owner to postgres;
alter view public.admin_testimonials owner to postgres;
alter view public.admin_bulk_enquiries owner to postgres;

-- Security-definer helper for future trusted order finalization. The conditional
-- UPDATE takes the row lock and succeeds only when enough stock remains, making
-- concurrent requests safe against negative stock and overselling. A NULL
-- variant ID means the product-level stock is authoritative.
create or replace function private.decrement_stock(
  p_product_id uuid,
  p_product_variant_id uuid,
  p_quantity integer
)
returns boolean
language plpgsql
security definer
set search_path = pg_catalog
as $$
begin
  if p_quantity <= 0 or p_product_id is null then
    raise exception 'Stock decrement requires a positive quantity and product';
  end if;

  if p_product_variant_id is null then
    update public.products
    set stock_quantity = stock_quantity - p_quantity
    where id = p_product_id
      and stock_quantity >= p_quantity;
  else
    update public.product_variants
    set stock_quantity = stock_quantity - p_quantity
    where id = p_product_variant_id
      and product_id = p_product_id
      and stock_quantity >= p_quantity;
  end if;

  return found;
end;
$$;

-- SECURITY DEFINER functions must remain owned by a trusted, non-application
-- role. Supabase's SQL Editor executes this authoritative file as postgres.
alter function private.is_admin() owner to postgres;
alter function private.decrement_stock(uuid, uuid, integer) owner to postgres;

-- Cross-table checks cannot be represented by a normal CHECK constraint. This
-- deferred constraint trigger makes the trusted order transaction fail at
-- commit if its item line totals do not equal orders.subtotal_paise.
create or replace function private.assert_order_subtotal()
returns trigger
language plpgsql
security invoker
set search_path = pg_catalog
as $$
declare
  v_order_id uuid;
  v_expected bigint;
  v_actual bigint;
begin
  v_order_id := case when tg_op = 'DELETE' then old.order_id else new.order_id end;

  select o.subtotal_paise into v_expected
  from public.orders o
  where o.id = v_order_id;

  if v_expected is null then
    return null;
  end if;

  select coalesce(sum(oi.line_total_paise), 0) into v_actual
  from public.order_items oi
  where oi.order_id = v_order_id;

  if v_actual <> v_expected then
    raise exception 'Order % subtotal does not match order items', v_order_id;
  end if;

  return null;
end;
$$;

create constraint trigger orders_subtotal_integrity
after insert or update of subtotal_paise on public.orders
deferrable initially deferred
for each row execute function private.assert_order_subtotal();

create constraint trigger order_items_subtotal_integrity
after insert or update or delete on public.order_items
deferrable initially deferred
for each row execute function private.assert_order_subtotal();

-- The admin UUID is deliberately not seeded. After creating the intended user
-- manually in Supabase Auth, run this once as a trusted database administrator:
--   insert into public.admin_users (user_id) values ('AUTH_USER_UUID');
-- No authenticated user receives INSERT/UPDATE/DELETE access to this table.

create trigger categories_set_updated_at
before update on public.categories
for each row execute function private.set_updated_at();

create trigger products_set_updated_at
before update on public.products
for each row execute function private.set_updated_at();

create trigger product_variants_set_updated_at
before update on public.product_variants
for each row execute function private.set_updated_at();

create trigger shipping_rules_set_updated_at
before update on public.shipping_rules
for each row execute function private.set_updated_at();

create trigger customers_set_updated_at
before update on public.customers
for each row execute function private.set_updated_at();

create trigger courier_partners_set_updated_at
before update on public.courier_partners
for each row execute function private.set_updated_at();

create trigger orders_set_updated_at
before update on public.orders
for each row execute function private.set_updated_at();

create trigger payments_set_updated_at
before update on public.payments
for each row execute function private.set_updated_at();

create trigger testimonials_set_updated_at
before update on public.testimonials
for each row execute function private.set_updated_at();

create trigger bulk_enquiries_set_updated_at
before update on public.bulk_enquiries
for each row execute function private.set_updated_at();

-- ---------------------------------------------------------------------------
-- Privileges and row-level security
-- ---------------------------------------------------------------------------

revoke all on schema private from public, anon, authenticated;
grant usage on schema private to authenticated;
revoke all on table public.admin_users from anon, authenticated;
revoke all on function private.set_updated_at() from public, anon, authenticated;
revoke all on function private.decrement_stock(uuid, uuid, integer) from public, anon, authenticated;
revoke all on function private.assert_order_subtotal() from public, anon, authenticated;
revoke all on function private.is_admin() from public;
grant execute on function private.is_admin() to authenticated;

revoke all on all tables in schema public from anon, authenticated;

grant select on public.categories, public.product_images, public.testimonials,
  public.storefront_products, public.storefront_product_variants
  to anon, authenticated;

grant select on public.admin_products, public.admin_product_variants,
  public.admin_shipping_rules, public.admin_product_images,
  public.admin_customers, public.admin_orders, public.admin_order_items,
  public.admin_payments, public.admin_courier_partners,
  public.admin_testimonials, public.admin_bulk_enquiries to authenticated;

revoke all on public.storefront_products, public.storefront_product_variants,
  public.admin_products, public.admin_product_variants, public.admin_shipping_rules,
  public.admin_product_images, public.admin_customers, public.admin_orders,
  public.admin_order_items, public.admin_payments, public.admin_courier_partners,
  public.admin_testimonials, public.admin_bulk_enquiries
  from public;

grant insert, update, delete on public.categories, public.products,
  public.product_variants, public.product_images, public.shipping_rules,
  public.customers, public.orders, public.order_items, public.payments,
  public.courier_partners, public.testimonials, public.bulk_enquiries
  to authenticated;

alter table public.admin_users enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.product_images enable row level security;
alter table public.shipping_rules enable row level security;
alter table public.customers enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.payments enable row level security;
alter table public.courier_partners enable row level security;
alter table public.testimonials enable row level security;
alter table public.bulk_enquiries enable row level security;

-- Narrow public storefront reads.
create policy categories_public_read on public.categories
for select to anon, authenticated using (is_active);

create policy product_images_public_read on public.product_images
for select to anon, authenticated using (
  exists (
    select 1 from public.products p
    where p.id = product_images.product_id and p.is_active
  )
);

create policy testimonials_public_read on public.testimonials
for select to anon, authenticated using (is_active);

-- Admin policies intentionally check allowlist membership, never auth status alone.
create policy categories_admin_all on public.categories
for all to authenticated using (private.is_admin()) with check (private.is_admin());

create policy products_admin_all on public.products
for all to authenticated using (private.is_admin()) with check (private.is_admin());

create policy product_variants_admin_all on public.product_variants
for all to authenticated using (private.is_admin()) with check (private.is_admin());

create policy product_images_admin_all on public.product_images
for all to authenticated using (private.is_admin()) with check (private.is_admin());

create policy shipping_rules_admin_all on public.shipping_rules
for all to authenticated using (private.is_admin()) with check (private.is_admin());

create policy customers_admin_all on public.customers
for all to authenticated using (private.is_admin()) with check (private.is_admin());

create policy orders_admin_all on public.orders
for all to authenticated using (private.is_admin()) with check (private.is_admin());

create policy order_items_admin_all on public.order_items
for all to authenticated using (private.is_admin()) with check (private.is_admin());

create policy payments_admin_all on public.payments
for all to authenticated using (private.is_admin()) with check (private.is_admin());

create policy courier_partners_admin_all on public.courier_partners
for all to authenticated using (private.is_admin()) with check (private.is_admin());

create policy testimonials_admin_all on public.testimonials
for all to authenticated using (private.is_admin()) with check (private.is_admin());

create policy bulk_enquiries_admin_all on public.bulk_enquiries
for all to authenticated using (private.is_admin()) with check (private.is_admin());

-- No policies are defined for admin_users. It is intentionally inaccessible
-- through the Data API; only the trusted database administrator should seed it.

-- There is intentionally no anonymous shipping_rules policy. Guest checkout
-- obtains active rules through a trusted server operation, which calculates and
-- revalidates shipping without exposing the complete business configuration.

-- Order/payment finalization must be idempotent: lock or atomically update the
-- order/payment rows using the idempotency key, call decrement_stock once in the
-- same transaction, and treat an already-verified payment as a successful retry.
-- Fulfillment status transitions will be enforced in the later order-management
-- phase rather than by an oversized state-machine trigger here.
