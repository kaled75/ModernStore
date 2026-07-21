-- ========================================================
-- MODERN STORE FULL SUPABASE SCHEMA
-- Run this script in your Supabase SQL Editor to initialize
-- all tables, columns, RLS policies, and default settings.
-- ========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    discount_price DECIMAL(10,2),
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    brand TEXT,
    sku TEXT UNIQUE,
    images TEXT[] DEFAULT '{}',
    sizes TEXT[] DEFAULT '{}',
    colors TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_city TEXT NOT NULL,
    customer_address TEXT NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    status TEXT DEFAULT 'جديد' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4. ORDER ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    quantity INTEGER NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    selected_size TEXT,
    selected_color TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 5. STORE SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.store_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    key VARCHAR(255) UNIQUE NOT NULL,
    value TEXT NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 6. STORE WIDGETS TABLE
CREATE TABLE IF NOT EXISTS public.store_widgets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    type VARCHAR(50) NOT NULL DEFAULT 'custom_text',
    is_active BOOLEAN DEFAULT true,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ========================================================
-- ROW LEVEL SECURITY (RLS) & POLICIES
-- ========================================================

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_widgets ENABLE ROW LEVEL SECURITY;

-- Public READ access
DROP POLICY IF EXISTS "Public categories read" ON categories;
CREATE POLICY "Public categories read" ON categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public products read" ON products;
CREATE POLICY "Public products read" ON products FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public settings read" ON store_settings;
CREATE POLICY "Public settings read" ON store_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public widgets read" ON store_widgets;
CREATE POLICY "Public widgets read" ON store_widgets FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public orders read" ON orders;
CREATE POLICY "Public orders read" ON orders FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public order items read" ON order_items;
CREATE POLICY "Public order items read" ON order_items FOR SELECT USING (true);

-- Public Order Placement
DROP POLICY IF EXISTS "Public orders insert" ON orders;
CREATE POLICY "Public orders insert" ON orders FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public order items insert" ON order_items;
CREATE POLICY "Public order items insert" ON order_items FOR INSERT WITH CHECK (true);

-- Authenticated Users (Admins) Full Access
DROP POLICY IF EXISTS "Auth categories manage" ON categories;
CREATE POLICY "Auth categories manage" ON categories FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Auth products manage" ON products;
CREATE POLICY "Auth products manage" ON products FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Auth settings manage" ON store_settings;
CREATE POLICY "Auth settings manage" ON store_settings FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Auth widgets manage" ON store_widgets;
CREATE POLICY "Auth widgets manage" ON store_widgets FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Auth orders manage" ON orders;
CREATE POLICY "Auth orders manage" ON orders FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Auth order items manage" ON order_items;
CREATE POLICY "Auth order items manage" ON order_items FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Anonymous Fallback Policies (for admin testing before login is enforced)
DROP POLICY IF EXISTS "Anon products write" ON products;
CREATE POLICY "Anon products write" ON products FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Anon categories write" ON categories;
CREATE POLICY "Anon categories write" ON categories FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Anon settings write" ON store_settings;
CREATE POLICY "Anon settings write" ON store_settings FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Anon widgets write" ON store_widgets;
CREATE POLICY "Anon widgets write" ON store_widgets FOR ALL TO anon USING (true) WITH CHECK (true);

-- ========================================================
-- INITIAL SEED DATA
-- ========================================================

INSERT INTO public.store_settings (key, value)
VALUES 
    ('store_name', 'متجرنا العصري'),
    ('contact_phone', '+218 91 123 4567'),
    ('whatsapp_number', '+218 91 123 4567'),
    ('contact_email', 'info@modernstore.com'),
    ('contact_address', 'طرابلس، ليبيا'),
    ('about_us_text', 'متجرنا العصري يوفر لك أحدث المنتجات بأعلى جودة وأفضل سعر.'),
    ('faq_text', 'أسئلة شائعة حول الشحن والطلب والدفع عند الاستلام.'),
    ('shipping_text', 'التوصيل سريع لكافة المدن والتسليم يد بيد.'),
    ('returns_text', 'يمكنك استبدال أو إرجاع المنتج خلال 14 يوماً وفق الشروط.')
ON CONFLICT (key) DO NOTHING;
