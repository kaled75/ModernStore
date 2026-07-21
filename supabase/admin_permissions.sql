-- السماح للمستخدمين المجهولين بالإضافة والتعديل والحذف (لغرض التجربة فقط بدون تسجيل دخول)
GRANT INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO anon;

-- سياسات المنتجات
DROP POLICY IF EXISTS "Products can be inserted by everyone" ON products;
CREATE POLICY "Products can be inserted by everyone" ON products FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Products can be updated by everyone" ON products;
CREATE POLICY "Products can be updated by everyone" ON products FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Products can be deleted by everyone" ON products;
CREATE POLICY "Products can be deleted by everyone" ON products FOR DELETE USING (true);
