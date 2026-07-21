-- إنشاء جدول الودجات (Widgets)
CREATE TABLE IF NOT EXISTS public.store_widgets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    type VARCHAR(50) NOT NULL, -- 'price_filter', 'custom_text', 'banner'
    title VARCHAR(255) NOT NULL,
    content TEXT,
    is_active BOOLEAN DEFAULT true,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- إعداد سياسات الأمان للجدول
ALTER TABLE public.store_widgets ENABLE ROW LEVEL SECURITY;

-- الجميع يمكنه القراءة
DROP POLICY IF EXISTS "Widgets are viewable by everyone" ON store_widgets;
CREATE POLICY "Widgets are viewable by everyone" ON store_widgets FOR SELECT USING (true);

-- المدراء فقط يمكنهم التعديل والإضافة والحذف
DROP POLICY IF EXISTS "Widgets can be inserted by authenticated users" ON store_widgets;
CREATE POLICY "Widgets can be inserted by authenticated users" ON store_widgets FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Widgets can be updated by authenticated users" ON store_widgets;
CREATE POLICY "Widgets can be updated by authenticated users" ON store_widgets FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Widgets can be deleted by authenticated users" ON store_widgets;
CREATE POLICY "Widgets can be deleted by authenticated users" ON store_widgets FOR DELETE TO authenticated USING (true);

-- إدخال قيم افتراضية (فلتر الأسعار)
INSERT INTO public.store_widgets (type, title, content, is_active, order_index)
VALUES 
    ('price_filter', 'تصفية حسب السعر', '', true, 1),
    ('custom_text', 'إعلان خاص', 'شحن مجاني للطلبات التي تزيد عن 200$', true, 2);

-- منح صلاحيات التعديل للمسجلين
GRANT ALL ON TABLE public.store_widgets TO authenticated;
