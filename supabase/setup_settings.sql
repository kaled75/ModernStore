-- إنشاء جدول الإعدادات
CREATE TABLE IF NOT EXISTS public.store_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    key VARCHAR(255) UNIQUE NOT NULL,
    value TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- إعداد سياسات الأمان للجدول
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

-- الجميع يمكنه القراءة
DROP POLICY IF EXISTS "Settings are viewable by everyone" ON store_settings;
CREATE POLICY "Settings are viewable by everyone" ON store_settings FOR SELECT USING (true);

-- المدراء فقط (المسجلين) يمكنهم التعديل والإضافة
DROP POLICY IF EXISTS "Settings can be inserted by authenticated users" ON store_settings;
CREATE POLICY "Settings can be inserted by authenticated users" ON store_settings FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Settings can be updated by authenticated users" ON store_settings;
CREATE POLICY "Settings can be updated by authenticated users" ON store_settings FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- إدخال القيم الافتراضية إذا لم تكن موجودة
INSERT INTO public.store_settings (key, value)
VALUES 
    ('store_name', 'متجرنا العصري'),
    ('contact_phone', '+966 50 123 4567'),
    ('contact_email', 'support@modernstore.com'),
    ('contact_address', 'شارع العليا العام، الرياض، المملكة العربية السعودية'),
    ('about_us_text', 'بدأت رحلتنا من شغفنا بالتكنولوجيا والتجارة الإلكترونية، حيث لاحظنا حاجة السوق لوجود متجر إلكتروني يجمع بين سهولة الاستخدام، جمال التصميم، وموثوقية المنتجات.

على مدار سنوات، قمنا ببناء شبكة قوية من الموردين الموثوقين، وطورنا نظاماً لوجستياً يضمن وصول طلباتكم في أسرع وقت وبأفضل حالة.

فريق العمل لدينا يتكون من نخبة من الشباب الطموح الذي يسعى دائماً للابتكار وتحسين تجربة العميل يوماً بعد يوم. نحن لا نبيع المنتجات فحسب، بل نبني علاقات ثقة طويلة الأمد مع عملائنا.')
ON CONFLICT (key) DO NOTHING;

-- التأكد من أن جدول الأقسام (categories) محمي بنفس الطريقة
-- الجميع يمكنه القراءة
DROP POLICY IF EXISTS "Categories are viewable by everyone" ON categories;
CREATE POLICY "Categories are viewable by everyone" ON categories FOR SELECT USING (true);

-- حذف السياسات القديمة إن وجدت
DROP POLICY IF EXISTS "Categories can be inserted by everyone" ON categories;
DROP POLICY IF EXISTS "Categories can be updated by everyone" ON categories;
DROP POLICY IF EXISTS "Categories can be deleted by everyone" ON categories;

-- المدراء فقط للإضافة والتعديل والحذف
CREATE POLICY "Categories can be inserted by authenticated users" ON categories FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Categories can be updated by authenticated users" ON categories FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Categories can be deleted by authenticated users" ON categories FOR DELETE TO authenticated USING (true);
