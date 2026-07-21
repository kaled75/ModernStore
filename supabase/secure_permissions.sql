-- إزالة صلاحيات التعديل من المستخدمين المجهولين (الزوار)
REVOKE INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public FROM anon;

-- إعطاء الصلاحيات للمستخدمين المسجلين فقط (المديرين)
GRANT INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;

-- حذف السياسات القديمة المفتوحة للجميع
DROP POLICY IF EXISTS "Products can be inserted by everyone" ON products;
DROP POLICY IF EXISTS "Products can be updated by everyone" ON products;
DROP POLICY IF EXISTS "Products can be deleted by everyone" ON products;

-- إضافة السياسات الجديدة المخصصة للمسجلين فقط
CREATE POLICY "Products can be inserted by authenticated users" ON products FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Products can be updated by authenticated users" ON products FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Products can be deleted by authenticated users" ON products FOR DELETE TO authenticated USING (true);
