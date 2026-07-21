import React, { useEffect, useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

const Contact = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [settings, setSettings] = useState({
    phone: '+966 50 123 4567',
    email: 'support@modernstore.com',
    address: 'شارع العليا العام، الرياض، المملكة العربية السعودية'
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await supabase.from('store_settings').select('*');
        if (data) {
          const map: Record<string, string> = {};
          data.forEach(item => map[item.key] = item.value);
          setSettings(prev => ({
            phone: map.contact_phone || prev.phone,
            email: map.contact_email || prev.email,
            address: map.contact_address || prev.address
          }));
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchSettings();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // محاكاة الإرسال
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 1500);
  };

  return (
    <div className="pt-20 pb-16 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">تواصل معنا</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            نحن هنا دائماً لمساعدتك. لا تتردد في طرح أي استفسار أو اقتراح، وسيقوم فريقنا بالرد عليك في أقرب وقت ممكن.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Contact Information */}
          <div className="lg:col-span-5 space-y-8">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 h-full">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">معلومات الاتصال</h2>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">اتصل بنا</h3>
                    <p className="text-gray-600" dir="ltr">{settings.phone}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">البريد الإلكتروني</h3>
                    <p className="text-gray-600">{settings.email}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">المقر الرئيسي</h3>
                    <p className="text-gray-600">{settings.address}</p>
                  </div>
                </div>
              </div>

              <div className="mt-12 pt-8 border-t border-gray-100">
                <h3 className="font-bold text-gray-900 mb-4">ساعات العمل</h3>
                <div className="flex justify-between text-gray-600 mb-2">
                  <span>الأحد - الخميس:</span>
                  <span>9:00 ص - 10:00 م</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>الجمعة - السبت:</span>
                  <span>4:00 م - 11:00 م</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-7">
            <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-gray-100">
              {isSubmitted ? (
                <div className="text-center py-16">
                  <div className="flex justify-center mb-6">
                    <CheckCircle className="w-20 h-20 text-green-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">تم إرسال رسالتك بنجاح!</h3>
                  <p className="text-gray-600 mb-8">
                    شكراً لتواصلك معنا. سيقوم أحد ممثلي خدمة العملاء بالرد عليك قريباً.
                  </p>
                  <button 
                    onClick={() => setIsSubmitted(false)}
                    className="bg-primary-600 text-white px-8 py-3 rounded-xl font-medium hover:bg-primary-700 transition-colors"
                  >
                    إرسال رسالة أخرى
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-gray-900 mb-8">أرسل لنا رسالة</h2>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">الاسم الكامل *</label>
                        <input required type="text" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all bg-gray-50 focus:bg-white" placeholder="أدخل اسمك" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">رقم الجوال *</label>
                        <input required type="tel" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all bg-gray-50 focus:bg-white" placeholder="05x xxx xxxx" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">البريد الإلكتروني *</label>
                      <input required type="email" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all bg-gray-50 focus:bg-white" placeholder="example@mail.com" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">موضوع الرسالة *</label>
                      <select required className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all bg-gray-50 focus:bg-white">
                        <option value="">اختر الموضوع...</option>
                        <option value="استفسار عام">استفسار عام</option>
                        <option value="مشكلة في الطلب">مشكلة في الطلب</option>
                        <option value="اقتراح">اقتراح</option>
                        <option value="شراكة تجارية">شراكة تجارية</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">نص الرسالة *</label>
                      <textarea required rows={5} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all bg-gray-50 focus:bg-white resize-none" placeholder="اكتب رسالتك هنا..."></textarea>
                    </div>

                    <button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="w-full bg-primary-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-primary-700 transition-colors shadow-lg shadow-primary-200 flex items-center justify-center gap-2 disabled:opacity-70"
                    >
                      {isSubmitting ? (
                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          إرسال الرسالة
                        </>
                      )}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Contact;
