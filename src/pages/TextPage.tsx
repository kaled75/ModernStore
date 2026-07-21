import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface TextPageProps {
  title: string;
  settingKey: string;
}

const TextPage: React.FC<TextPageProps> = ({ title, settingKey }) => {
  const [content, setContent] = useState<string>('جاري تحميل المحتوى...');

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const { data } = await supabase.from('store_settings').select('value').eq('key', settingKey).single();
        if (data) {
          setContent(data.value);
        } else {
          setContent('لا يوجد محتوى حالياً لهذه الصفحة.');
        }
      } catch (err) {
        console.error(err);
        setContent('حدث خطأ أثناء تحميل المحتوى.');
      }
    };
    fetchContent();
  }, [settingKey]);

  return (
    <div className="pt-20 pb-16 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 pb-4 border-b border-gray-100">{title}</h1>
          <div className="space-y-6 text-gray-600 leading-relaxed text-lg text-justify whitespace-pre-line">
            {content}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TextPage;
