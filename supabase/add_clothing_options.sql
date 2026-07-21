-- إضافة حقول المقاسات والألوان لجدول المنتجات
ALTER TABLE products ADD COLUMN IF NOT EXISTS sizes text[] DEFAULT '{}';
ALTER TABLE products ADD COLUMN IF NOT EXISTS colors text[] DEFAULT '{}';

-- إضافة حقول الخيارات المختارة لجدول عناصر الطلب (order_items)
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS selected_size text;
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS selected_color text;
