import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Phone, Mail, MapPin } from 'lucide-react';

const Footer = () => {
  const [storeName, setStoreName] = useState('متجرنا');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactAddress, setContactAddress] = useState('');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await supabase
          .from('store_settings')
          .select('key, value')
          .in('key', ['store_name', 'contact_phone', 'contact_email', 'contact_address']);
        
        if (data) {
          data.forEach(item => {
            if (item.key === 'store_name') setStoreName(item.value);
            if (item.key === 'contact_phone') setContactPhone(item.value);
            if (item.key === 'contact_email') setContactEmail(item.value);
            if (item.key === 'contact_address') setContactAddress(item.value);
          });
        }
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
          {/* Store Info */}
          <div className="col-span-1 md:col-span-2">
            <h2 className="text-2xl font-bold mb-4 text-white">{storeName}</h2>
            <p className="text-gray-400 max-w-sm mb-6">
              وجهتك الأولى للتسوق الإلكتروني. نقدم لك أفضل المنتجات بأعلى جودة وأفضل الأسعار، مع خدمة عملاء متميزة.
            </p>
            <div className="space-y-2">
              {contactPhone && (
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <Phone className="w-4 h-4 text-primary-400 flex-shrink-0" />
                  <span dir="ltr">{contactPhone}</span>
                </div>
              )}
              {contactEmail && (
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <Mail className="w-4 h-4 text-primary-400 flex-shrink-0" />
                  <span>{contactEmail}</span>
                </div>
              )}
              {contactAddress && (
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <MapPin className="w-4 h-4 text-primary-400 flex-shrink-0" />
                  <span>{contactAddress}</span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-white mb-4">روابط سريعة</h3>
            <ul className="space-y-3">
              <li><Link to="/about" className="text-gray-400 hover:text-primary-400 transition-colors">من نحن</Link></li>
              <li><Link to="/products" className="text-gray-400 hover:text-primary-400 transition-colors">أحدث المنتجات</Link></li>
              <li><Link to="/products" className="text-gray-400 hover:text-primary-400 transition-colors">العروض الخاصة</Link></li>
              <li><Link to="/contact" className="text-gray-400 hover:text-primary-400 transition-colors">تواصل معنا</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">خدمة العملاء</h3>
            <ul className="space-y-3">
              <li><Link to="/faq" className="text-gray-400 hover:text-primary-400 transition-colors">الأسئلة الشائعة</Link></li>
              <li><Link to="/shipping" className="text-gray-400 hover:text-primary-400 transition-colors">سياسة الشحن</Link></li>
              <li><Link to="/returns" className="text-gray-400 hover:text-primary-400 transition-colors">سياسة الاسترجاع</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 text-center text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} {storeName}. جميع الحقوق محفوظة.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
