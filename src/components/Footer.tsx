import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const Footer = () => {
  const [storeName, setStoreName] = useState('متجرنا');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await supabase.from('store_settings').select('value').eq('key', 'store_name').single();
        if (data) setStoreName(data.value);
      } catch (err) {
        console.error(err);
      }
    };
    fetchSettings();
  }, []);

  return (
    <footer className="bg-gray-900 text-white pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-1 md:col-span-2">
            <h2 className="text-2xl font-bold mb-4">{storeName}</h2>
            <p className="text-gray-400 max-w-sm">
              وجهتك الأولى للتسوق الإلكتروني. نقدم لك أفضل المنتجات بأعلى جودة وأفضل الأسعار، مع خدمة عملاء متميزة.
            </p>
          </div>
          <div>
            <h3 className="font-bold text-gray-900 mb-4">روابط سريعة</h3>
            <ul className="space-y-3">
              <li><Link to="/about" className="text-gray-500 hover:text-primary-600 transition-colors">من نحن</Link></li>
              <li><Link to="/products" className="text-gray-500 hover:text-primary-600 transition-colors">أحدث المنتجات</Link></li>
              <li><Link to="/products" className="text-gray-500 hover:text-primary-600 transition-colors">العروض الخاصة</Link></li>
              <li><Link to="/contact" className="text-gray-500 hover:text-primary-600 transition-colors">تواصل معنا</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">خدمة العملاء</h3>
            <ul className="space-y-2 text-gray-400">
              <li><Link to="/faq" className="hover:text-white transition-colors">الأسئلة الشائعة</Link></li>
              <li><Link to="/shipping" className="hover:text-white transition-colors">سياسة الشحن</Link></li>
              <li><Link to="/returns" className="hover:text-white transition-colors">سياسة الاسترجاع</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-8 text-center text-gray-400 text-sm">
          <p>© {new Date().getFullYear()} {storeName}. جميع الحقوق محفوظة.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
