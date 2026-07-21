-- Insert mock categories
INSERT INTO categories (id, name, slug, description, image_url)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'الإلكترونيات', 'electronics', 'أحدث الأجهزة الإلكترونية والذكية', 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=500&q=80'),
  ('22222222-2222-2222-2222-222222222222', 'الملابس', 'clothing', 'أزياء عصرية تناسب جميع الأذواق', 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=500&q=80'),
  ('33333333-3333-3333-3333-333333333333', 'المنزل والديكور', 'home-decor', 'كل ما تحتاجه لجعل منزلك أجمل', 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=500&q=80')
ON CONFLICT (slug) DO NOTHING;

-- Insert mock products
INSERT INTO products (name, slug, description, price, discount_price, category_id, brand, sku, images)
VALUES 
  (
    'سماعات رأس لاسلكية متميزة', 
    'premium-wireless-headphones', 
    'سماعات رأس بخاصية إلغاء الضوضاء النشط، توفر صوتاً نقياً وبطارية تدوم لـ 30 ساعة.', 
    299.99, 
    249.99, 
    '11111111-1111-1111-1111-111111111111', 
    'SoundPro', 
    'SP-WH-001', 
    ARRAY['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80']
  ),
  (
    'ساعة ذكية رياضية', 
    'sport-smartwatch', 
    'ساعة ذكية تتبع نشاطك الرياضي ومعدل نبضات القلب ومقاومة للماء حتى 50 متراً.', 
    199.50, 
    NULL, 
    '11111111-1111-1111-1111-111111111111', 
    'TechFit', 
    'TF-SW-002', 
    ARRAY['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80']
  ),
  (
    'قميص قطني كلاسيكي', 
    'classic-cotton-shirt', 
    'قميص مريح مصنوع من القطن الصافي 100%، مثالي للإطلالات اليومية الكاجوال.', 
    45.00, 
    35.00, 
    '22222222-2222-2222-2222-222222222222', 
    'StyleWear', 
    'SW-CS-101', 
    ARRAY['https://images.unsplash.com/photo-1596755094514-f87e32f85e2c?w=500&q=80']
  ),
  (
    'نظارات شمسية عصرية', 
    'modern-sunglasses', 
    'نظارات شمسية بعدسات مستقطبة تحمي عينيك من الأشعة فوق البنفسجية بتصميم أنيق.', 
    85.00, 
    NULL, 
    '22222222-2222-2222-2222-222222222222', 
    'VisionX', 
    'VX-SG-202', 
    ARRAY['https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=500&q=80']
  ),
  (
    'مصباح مكتب ذكي', 
    'smart-desk-lamp', 
    'مصباح LED مكتبي مع إمكانية التحكم بدرجة الحرارة والسطوع عبر التطبيق.', 
    60.00, 
    49.99, 
    '33333333-3333-3333-3333-333333333333', 
    'LumiHome', 
    'LH-DL-301', 
    ARRAY['https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500&q=80']
  ),
  (
    'نبتة زينة داخلية', 
    'indoor-decorative-plant', 
    'نبتة مونستيرا طبيعية تأتي في حوض سيراميك أنيق لتزيين غرفتك أو مكتبك.', 
    35.00, 
    NULL, 
    '33333333-3333-3333-3333-333333333333', 
    'GreenLife', 
    'GL-IP-302', 
    ARRAY['https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=500&q=80']
  )
ON CONFLICT (slug) DO NOTHING;
