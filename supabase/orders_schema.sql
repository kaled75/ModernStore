-- إنشاء جدول الطلبات
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_city TEXT NOT NULL,
    customer_address TEXT NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    status TEXT DEFAULT 'جديد' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- إنشاء جدول تفاصيل الطلبات (المنتجات داخل كل طلب)
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    quantity INTEGER NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- إعطاء الصلاحيات للعامة (بما أننا لا نستخدم تسجيل الدخول مؤقتاً)
GRANT ALL ON public.orders TO anon;
GRANT ALL ON public.order_items TO anon;
GRANT ALL ON public.orders TO authenticated;
GRANT ALL ON public.order_items TO authenticated;

-- تفعيل سياسات الأمان RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- سياسات الطلبات (للتجربة: السماح للجميع بالإضافة والقراءة)
DROP POLICY IF EXISTS "Orders can be inserted by everyone" ON orders;
CREATE POLICY "Orders can be inserted by everyone" ON orders FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Orders can be read by everyone" ON orders;
CREATE POLICY "Orders can be read by everyone" ON orders FOR SELECT USING (true);

DROP POLICY IF EXISTS "Orders can be updated by everyone" ON orders;
CREATE POLICY "Orders can be updated by everyone" ON orders FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Orders can be deleted by everyone" ON orders;
CREATE POLICY "Orders can be deleted by everyone" ON orders FOR DELETE USING (true);

-- سياسات عناصر الطلبات
DROP POLICY IF EXISTS "Order items can be inserted by everyone" ON order_items;
CREATE POLICY "Order items can be inserted by everyone" ON order_items FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Order items can be read by everyone" ON order_items;
CREATE POLICY "Order items can be read by everyone" ON order_items FOR SELECT USING (true);

DROP POLICY IF EXISTS "Order items can be deleted by everyone" ON order_items;
CREATE POLICY "Order items can be deleted by everyone" ON order_items FOR DELETE USING (true);
