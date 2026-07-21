import React, { useEffect, useState } from 'react';
import { Store, ShieldCheck, Truck, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';

const About = () => {
  const [aboutText, setAboutText] = useState<string>('جاري تحميل القصة...');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await supabase.from('store_settings').select('value').eq('key', 'about_us_text').single();
        if (data) setAboutText(data.value);
      } catch (err) {
        console.error(err);
      }
    };
    fetchSettings();
  }, []);

  return (
    <div className="pt-20 pb-16 bg-gray-50">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-20">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
          نحن نصنع تجربة تسوق <span className="text-primary-600">لا تُنسى</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
          انطلق متجرنا برؤية بسيطة: تقديم منتجات عالية الجودة بأسعار تنافسية، مع ضمان تجربة تسوق إلكترونية سلسة وممتعة لجميع عملائنا في المملكة.
        </p>
      </div>

      {/* Stats/Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow">
            <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Store className="w-8 h-8 text-primary-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">منتجات متنوعة</h3>
            <p className="text-gray-600">نوفر تشكيلة واسعة من أحدث المنتجات التي تلبي كافة احتياجاتك اليومية.</p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow">
            <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <ShieldCheck className="w-8 h-8 text-primary-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">جودة مضمونة</h3>
            <p className="text-gray-600">نحرص على فحص كافة منتجاتنا لضمان مطابقتها لأعلى معايير الجودة.</p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow">
            <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Truck className="w-8 h-8 text-primary-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">توصيل سريع</h3>
            <p className="text-gray-600">نقدم خدمة التوصيل السريع والموثوق لكافة مناطق المملكة.</p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow">
            <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Clock className="w-8 h-8 text-primary-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">دعم فني 24/7</h3>
            <p className="text-gray-600">فريقنا متواجد على مدار الساعة للرد على استفساراتكم وحل أي مشكلة.</p>
          </div>
        </div>
      </div>

      {/* Story Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">قصتنا</h2>
          <div className="space-y-6 text-gray-600 leading-relaxed text-lg text-justify whitespace-pre-line">
            {aboutText}
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
