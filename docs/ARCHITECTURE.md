# Namma Ada server architecture

This document defines the trust boundaries for the application. Phase 04C establishes infrastructure only; business features remain deferred.

## Request boundaries

The browser handles presentation, local interaction, and temporary UI state. It is never authoritative for prices, stock, delivery eligibility, totals, payment state, or administrator status.

Server Components read server data for the current request. Server Actions are the convention for mutations initiated by the application UI, including future admin mutations, enquiries, and checkout initiation. Route Handlers are reserved for HTTP integrations and callbacks such as health checks, payment verification, and future webhooks. Internal server functions should not be wrapped in public API routes without a need.

## Supabase clients

- `lib/supabase/browser.ts` uses only the public URL and anon key.
- `lib/supabase/server.ts` is the cookie-aware SSR client for Server Components, Server Actions, and Route Handlers.
- `lib/supabase/admin.ts` is server-only and uses the service-role key only for explicitly privileged work. It is not a default data client and must never be imported by Client Components or exposed in responses.

The private schema remains an internal database boundary. Public storefront access must use the approved storefront views and narrow public tables. Sensitive base tables, customer data, orders, payments, exact stock, and shipping configuration are not browser data.

## Authentication and authorization

Supabase SSR cookies are refreshed in `proxy.ts`. The proxy performs an early unauthenticated redirect for `/admin`; `app/admin/layout.tsx` performs the authoritative server-side check. `lib/auth/admin.ts` obtains the current user with `auth.getUser()` and verifies that user ID against `public.admin_users` using the server-only privileged client. There is exactly one administrator and no roles framework.

`getSession()` is not an authorization source. The installed Supabase client version does not expose `getClaims()`, so the current flow uses `getUser()` where a fresh Auth user record and verified identity are required. If the client is upgraded to a version with `getClaims()`, protection paths should be reviewed against the then-current Supabase guidance.

## Validation and errors

`lib/validation/schemas.ts` contains reusable Zod primitives. Every future Server Action or Route Handler must validate untrusted input on the server, even if a matching client schema is used for UI feedback. `lib/server/errors.ts` provides stable error categories and safe public messages. Database, provider, SQL, stack-trace, and secret details must stay server-side.

## Future commerce trust model

The browser may submit product ID, variant ID, quantity, and delivery details. The server must fetch current product and variant data, verify active state and stock, resolve the authoritative price and delivery eligibility, calculate subtotal/shipping/total, and create the order/payment state. Client prices, subtotals, shipping, totals, and stock are never trusted.

Future finalization must use `private.decrement_stock()` atomically inside a reviewed trusted transaction boundary. Multiple Supabase HTTP requests are not automatically one PostgreSQL transaction; any transaction-wide invariant requiring an RPC/database function must be designed against the deployed schema and reviewed before a schema change. The existing deferred subtotal check remains authoritative.

Payment operations must use `payments.idempotency_key` and Razorpay identifiers to tolerate double clicks, retries, refreshes, verification retries, and webhook retries. Shipping rules and the unresolved Bangalore boundary remain server-side configuration; no pincode list or free-shipping rule is invented here.

## Future external services

Cloudinary signing and trusted media-record writes belong on the server. The browser may receive only the narrowly required upload authorization if direct upload is selected; API secrets and signing secrets never cross the boundary.

Razorpay order creation, amount calculation, signature verification, identifier checks, and finalization belong on the server. The browser may open Checkout and return the provider response, but never determines the payment amount. Future webhook endpoints must authenticate the webhook, be idempotent, tolerate retries, and expose no secrets.

## Environment, caching, and logging

Only `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are public. `SUPABASE_SERVICE_ROLE_KEY` and future Razorpay/Cloudinary secrets are server-only. Environment values, tokens, passwords, signatures, secrets, and unnecessary customer PII must never be logged. Future operational logs should use safe event names, internal IDs, statuses, and timestamps.

Authenticated/admin routes are dynamic and use `private, no-store` through the request boundary. Public storefront caching can be introduced deliberately later; personalized, order, payment, and admin data must not become public cache entries.

The current security headers protect against content sniffing, framing, referrer leakage, and unnecessary browser permissions. CSP is deferred until required external origins for Razorpay, Cloudinary, analytics, and future assets are known; adding a premature restrictive policy could break those integrations.

## Storefront shell

The `(storefront)` route group provides a Server Component-friendly shared shell: `StorefrontNavbar`, the route content, `StorefrontFooter`, and route-level loading/error boundaries. Only the Navbar is client-side because it owns the mobile menu state. The menu is keyboard operable, has visible focus states, supports Escape to close, and remains touch-friendly. The supplied `public/namma-ada-logo.png` is used without artwork changes.

Storefront product queries live in the server-only `lib/storefront/products.ts` module and read only the approved `storefront_products` and `storefront_product_variants` views. Empty database results remain empty; no catalog records or placeholder prices are created. Future image slots can accept approved Cloudinary URLs without moving media credentials into the browser. The supplied Instagram URL is retained as a single footer link; no feed, scraping, or media section is implemented.

## Deferred decisions

No database schema, migration, business data, product data, checkout, payment, media upload, customer account, admin CRUD, rate limiter, or generated Supabase database types were added in this phase. Rate limiting will be required for login, enquiry submission, checkout initiation, payment verification, webhooks, and sensitive admin mutations; distributed protection must be selected before those endpoints are exposed.
