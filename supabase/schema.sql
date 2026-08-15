-- VOLTERRA e-commerce schema
-- Run this in the Supabase SQL editor (or via `supabase db push`).

-- ============================================================
-- CATEGORIES
-- ============================================================
create table if not exists public.categories (
  id text primary key,
  name text not null,
  slug text not null unique,
  description text,
  image text,
  sort_order int default 0,
  created_at timestamptz default now()
);

-- ============================================================
-- COLLECTIONS
-- ============================================================
create table if not exists public.collections (
  id text primary key,
  name text not null,
  slug text not null unique,
  tagline text,
  description text,
  image text,
  dark boolean default false,
  category_slugs text[] default '{}',
  product_slugs text[] default '{}',
  created_at timestamptz default now()
);

-- ============================================================
-- PRODUCTS
-- ============================================================
create table if not exists public.products (
  id text primary key,
  slug text not null unique,
  name text not null,
  category_id text references public.categories(id),
  category_name text,
  gender text check (gender in ('men','women','unisex','kids')),
  price numeric(10,2) not null,
  compare_at_price numeric(10,2),
  rating numeric(2,1) default 0,
  review_count int default 0,
  description text,
  images text[] default '{}',
  colors jsonb default '[]',
  sizes jsonb default '[]',
  sku text,
  technology text[] default '{}',
  materials text,
  fit text,
  care text[] default '{}',
  featured boolean default false,
  trending boolean default false,
  is_new boolean default false,
  collection_ids text[] default '{}',
  tags text[] default '{}',
  created_at timestamptz default now()
);

-- ============================================================
-- REVIEWS
-- ============================================================
create table if not exists public.reviews (
  id text primary key,
  product_id text references public.products(id) on delete cascade,
  user_name text not null,
  rating int not null check (rating between 1 and 5),
  title text,
  body text,
  date date default current_date,
  verified boolean default false
);

-- ============================================================
-- ORDERS / ORDER ITEMS
-- ============================================================
create table if not exists public.orders (
  id text primary key,
  user_id uuid references auth.users(id) on delete set null,
  email text not null,
  subtotal numeric(10,2) not null,
  discount numeric(10,2) default 0,
  shipping numeric(10,2) default 0,
  tax numeric(10,2) default 0,
  total numeric(10,2) not null,
  payment_method text check (payment_method in ('card','upi','cod')),
  status text default 'pending' check (status in ('pending','processing','shipped','delivered','cancelled')),
  shipping_address jsonb not null,
  created_at timestamptz default now()
);

create table if not exists public.order_items (
  id text primary key,
  order_id text references public.orders(id) on delete cascade,
  product_id text,
  name text not null,
  image text,
  price numeric(10,2) not null,
  size text,
  color text,
  quantity int not null
);

-- ============================================================
-- WISHLIST / CART
-- ============================================================
create table if not exists public.wishlist (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade,
  product_id text references public.products(id) on delete cascade,
  created_at timestamptz default now(),
  unique (user_id, product_id)
);

create table if not exists public.cart_items (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade,
  product_id text references public.products(id) on delete cascade,
  size text,
  color text,
  quantity int default 1,
  saved_for_later boolean default false,
  created_at timestamptz default now(),
  unique (user_id, product_id, size, color)
);

-- ============================================================
-- ADDRESSES
-- ============================================================
create table if not exists public.addresses (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade,
  full_name text not null,
  line1 text not null,
  line2 text,
  city text not null,
  state text not null,
  zip text not null,
  country text not null,
  phone text,
  is_default boolean default false
);

-- ============================================================
-- PROFILES (mirrors auth.users)
-- ============================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  name text,
  phone text,
  is_admin boolean default false,
  created_at timestamptz default now()
);

-- ============================================================
-- Row Level Security (open reads for the storefront)
-- ============================================================
alter table public.products enable row level security;
alter table public.categories enable row level security;
alter table public.collections enable row level security;
alter table public.reviews enable row level security;

create policy "Public read products" on public.products for select using (true);
create policy "Public read categories" on public.categories for select using (true);
create policy "Public read collections" on public.collections for select using (true);
create policy "Public read reviews" on public.reviews for select using (true);

-- Users manage their own cart/wishlist/orders/profiles
alter table public.wishlist enable row level security;
alter table public.cart_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.addresses enable row level security;
alter table public.profiles enable row level security;

create policy "Own wishlist" on public.wishlist for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Own cart" on public.cart_items for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Own orders" on public.orders for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Own order items" on public.order_items for all using (exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()));
create policy "Own addresses" on public.addresses for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Own profile" on public.profiles for all using (auth.uid() = id) with check (auth.uid() = id);

-- Admin access to products/categories/collections (admins identified in profiles)
create policy "Admin write products" on public.products for all using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin)
);
create policy "Admin write categories" on public.categories for all using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin)
);
create policy "Admin write collections" on public.collections for all using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin)
);
create policy "Admin read all orders" on public.orders for select using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin)
);
create policy "Admin update orders" on public.orders for update using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin)
);

-- ============================================================
-- Helpers
-- ============================================================
-- Stock lookup used by the inventory view
create or replace function public.product_stock(p_id text)
returns int language sql stable as $$
  select coalesce(sum((s->>'stock')::int), 0)
  from jsonb_array_elements((select sizes from public.products where id = p_id)) s
$$;
