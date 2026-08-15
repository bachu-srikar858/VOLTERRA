# VOLTERRA — Premium Sportswear E-Commerce

A premium, modern sportswear e-commerce experience built with React, Vite, TypeScript, Tailwind CSS, React Router, Lucide icons and [React Bits](https://reactbits.dev) animated components. Original brand — inspired by premium athletic retail, not a clone.

## Quick start

```bash
npm install
npm run dev        # dev server
npm run build      # production build
npm run preview    # preview the production build
```

## Demo mode (no backend needed)

Out of the box the app runs in **demo mode**: product catalog, cart, wishlist,
orders and auth are persisted in `localStorage`, so every feature works without
any configuration.

- **Admin access:** sign in with `admin@volterra.com` and any password (≥ 6 chars) to reach `/admin`.
- Any account you create on `/signup` works for `/login` (any password ≥ 6 chars).

## Supabase backend (optional)

The app automatically switches to Supabase when env vars are present. To enable:

1. **Copy `.env.example` to `.env`** and fill in your project values:

   ```bash
   cp .env.example .env
   ```

   ```
   VITE_SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-public-key
   ```

   Both values are in the Supabase dashboard under **Project Settings → API**
   (the anon/public key is safe to expose in the browser).

2. **Create the tables:** open the Supabase dashboard → **SQL Editor → New
   query**, paste the contents of `supabase/schema.sql`, and run it.

3. **Seed the catalog:** in a second query, paste `supabase/seed.sql` and run
   it. This inserts the 4 categories, 2 collections and 18 products so the
   storefront is populated. Regenerate it after changing demo data with
   `node scripts/generate-supabase-seed.mjs`.

4. **Restart the dev server** (`npm run dev`) so the env vars are picked up.

### Making yourself an admin

1. Open `/signup` in the app and create your account (a row is created in
   `profiles` automatically).
2. In the SQL Editor, run the last line of `seed.sql`, replacing the email:

   ```sql
   update public.profiles set is_admin = true where email = 'you@example.com';
   ```

3. Sign out and back in — `/admin` is now unlocked for your account.

### What moves to Supabase

Products, categories, collections, reviews, orders and auth (email + Google)
read/write Supabase. Cart, wishlist, addresses and payment methods stay in
`localStorage` for now (their tables exist in the schema for future use).

If any Supabase query fails at runtime (e.g. tables not created), the app falls
back to demo mode automatically and logs a warning.

## Features

- **Homepage** — full-screen hero, featured categories, trending products, editorial collections
- **Shop** (`/shop`) — search, category/gender/size/color/price/sale filters, sorting, grid & list views, load-more pagination, mobile filter drawer
- **Product detail** (`/product/:slug`) — image gallery, color/size selection, size guide, stock tracking, reviews with submission, related products
- **Cart** (`/cart`) — quantity controls, save-for-later, order summary with free-shipping progress
- **Checkout** (`/checkout`) — 5 steps (customer info, shipping, delivery, payment, confirmation) with mock card / UPI / COD payment
- **Auth** — login, signup, forgot password, Google (Supabase only), protected `/account` dashboard (profile, orders, addresses, payment methods, settings)
- **Search overlay** — animated full-screen search with suggestions, recent & trending searches
- **Wishlist** (`/wishlist`) — persists per user, move to cart
- **Collections** (`/collections`, `/collections/:slug`) — editorial sections linking to filtered shops
- **Admin** (`/admin`) — dashboard stats & charts, product/category/order/customer/review/inventory management
- **Extras** — 404 page, skeleton loaders, preloader, SEO titles/meta/OG tags, lazy-loaded routes, accessible semantics

## Tech notes

- Routes are lazy-loaded for code splitting (`React.lazy` + `Suspense`).
- React Bits components live in `src/components/ReactBits` and are imported only where used.
- Design system: black / white / electric-orange on a near-black (`#0a0a0a`) palette, sharp corners, editorial type.
"# VOLTERRA" 
