import React, { useState } from 'react';
import { useCartStore } from '../store/useCartStore';
import { useDialogStore } from '../store/useDialogStore';
import { Trash2, Plus, Minus, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const Cart = () => {
  const { items, removeItem, updateQuantity, getCartTotal, clearCart } = useCartStore();
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    customer_city: '',
    customer_address: '',
  });

  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [orderSummary, setOrderSummary] = useState<{ id: string; total: number; itemsText: string } | null>(null);

  React.useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase.from('store_settings').select('*').in('key', ['whatsapp_number', 'contact_phone']);
      if (data) {
        const wp = data.find(d => d.key === 'whatsapp_number')?.value;
        const phone = data.find(d => d.key === 'contact_phone')?.value;
        setWhatsappNumber(wp || phone || '');
      }
    };
    fetchSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    
    setIsSubmitting(true);
    
    try {
      // 1. Insert Order
      const newOrder = {
        customer_name: formData.customer_name,
        customer_phone: formData.customer_phone,
        customer_city: formData.customer_city,
        customer_address: formData.customer_address,
        total_amount: getCartTotal(),
        status: 'جديد'
      };

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([newOrder])
        .select()
        .single();

      if (orderError) throw orderError;

      // 2. Insert Order Items
      if (order) {
        let itemsText = '';
        items.forEach((item, index) => {
          itemsText += `${index + 1}. ${item.name} (${item.quantity}x)\n`;
          if (item.selected_size) itemsText += `   المقاس: ${item.selected_size}\n`;
          if (item.selected_color) itemsText += `   اللون: ${item.selected_color}\n`;
          itemsText += `   السعر: ${item.discount_price || item.price} د.ل\n`;
        });
        setOrderSummary({ id: order.id, total: getCartTotal(), itemsText });

        const orderItems = items.map(item => ({
          order_id: order.id,
          product_id: item.id,
          quantity: item.quantity,
          price: item.discount_price || item.price,
          selected_size: item.selected_size || null,
          selected_color: item.selected_color || null
        }));

        const { error: itemsError } = await supabase
          .from('order_items')
          .insert(orderItems);

        if (itemsError) throw itemsError;
      }

      setIsSuccess(true);
      clearCart();
    } catch (error) {
      console.error('Error submitting order:', error);
      useDialogStore.getState().showAlert('حدث خطأ أثناء إتمام الطلب، يرجى المحاولة مرة أخرى.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="flex justify-center mb-6">
          <CheckCircle className="w-20 h-20 text-green-500" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">تم تأكيد طلبك بنجاح!</h2>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-8">
          <Link to="/products" className="inline-block bg-gray-100 text-gray-800 px-8 py-3 rounded-full font-medium hover:bg-gray-200 transition-colors w-full sm:w-auto">
            متابعة التسوق
          </Link>
          
          {whatsappNumber && orderSummary && (
            <button
              onClick={() => {
                const text = `مرحباً، أود تأكيد طلبي الجديد.\nرقم الطلب: #${orderSummary.id.slice(0, 8)}\nالاسم: ${formData.customer_name}\n\nالمنتجات:\n${orderSummary.itemsText}الإجمالي: ${orderSummary.total.toFixed(2)} د.ل`;
                const cleanNumber = whatsappNumber.replace(/[^\d+]/g, '');
                window.open(`https://wa.me/${cleanNumber}?text=${encodeURIComponent(text)}`, '_blank');
              }}
              className="inline-flex items-center justify-center gap-2 bg-[#25D366] text-white px-8 py-3 rounded-full font-medium hover:bg-[#128C7E] transition-colors w-full sm:w-auto"
            >
              إرسال الطلب عبر واتساب
            </button>
          )}
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">سلة المشتريات فارغة</h2>
        <p className="text-gray-600 mb-8">لم تقم بإضافة أي منتجات إلى سلتك بعد.</p>
        <Link to="/products" className="inline-block bg-primary-600 text-white px-8 py-3 rounded-full font-medium hover:bg-primary-700 transition-colors">
          تصفح المنتجات
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">سلة المشتريات وإتمام الطلب</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Checkout Form - Takes more space on desktop */}
        <div className="lg:col-span-7 order-2 lg:order-1">
          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">بيانات التوصيل</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">الاسم الكامل *</label>
                  <input required type="text" value={formData.customer_name} onChange={(e) => setFormData({...formData, customer_name: e.target.value})} className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all" placeholder="الاسم الثلاثي" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">رقم الهاتف *</label>
                  <input required type="tel" value={formData.customer_phone} onChange={(e) => setFormData({...formData, customer_phone: e.target.value})} className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all" placeholder="05x xxx xxxx" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">المدينة *</label>
                <input required type="text" value={formData.customer_city} onChange={(e) => setFormData({...formData, customer_city: e.target.value})} className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all" placeholder="مثال: الرياض" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">العنوان بالتفصيل *</label>
                <textarea required rows={3} value={formData.customer_address} onChange={(e) => setFormData({...formData, customer_address: e.target.value})} className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all resize-none" placeholder="اسم الحي، الشارع، رقم المبنى..."></textarea>
              </div>

              <div className="border-t border-gray-100 pt-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">طريقة الدفع</h3>
                <div className="flex items-center gap-3 p-4 border border-primary-200 bg-primary-50 rounded-xl">
                  <input type="radio" checked readOnly className="w-5 h-5 text-primary-600" />
                  <span className="font-medium text-primary-900">الدفع عند الاستلام (مجاني)</span>
                </div>
              </div>

              <button type="submit" disabled={isSubmitting} className="w-full bg-primary-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-primary-700 transition-colors shadow-lg shadow-primary-200 disabled:opacity-70 disabled:cursor-not-allowed">
                تأكيد الطلب ({getCartTotal().toFixed(2)} د.ل)
              </button>
            </form>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-5 order-1 lg:order-2">
          <div className="bg-gray-50 p-6 md:p-8 rounded-2xl border border-gray-100 sticky top-24">
            <h3 className="text-xl font-bold text-gray-900 mb-6">ملخص المنتجات</h3>
            
            <div className="space-y-4 mb-6 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
              {items.map((item) => (
                <div key={item.cartItemId} className="flex gap-4 bg-white p-3 rounded-xl shadow-sm">
                  <div className="w-20 h-20 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden">
                    {item.images && item.images.length > 0 ? (
                      <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs text-gray-400">صورة</span>
                    )}
                  </div>
                  <div className="flex-grow flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm line-clamp-1">{item.name}</h4>
                      {(item.selected_size || item.selected_color) && (
                        <p className="text-xs text-gray-500 mt-0.5">
                          {item.selected_size && <span>المقاس: {item.selected_size}</span>}
                          {item.selected_size && item.selected_color && <span className="mx-1">-</span>}
                          {item.selected_color && <span>اللون: {item.selected_color}</span>}
                        </p>
                      )}
                      <p className="text-primary-600 font-bold mt-1 text-sm">{item.discount_price || item.price} د.ل</p>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center bg-gray-50 rounded-lg border border-gray-200">
                        <button onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)} className="p-1 text-gray-600 hover:text-primary-600">
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)} className="p-1 text-gray-600 hover:text-primary-600">
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <button onClick={() => removeItem(item.cartItemId)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3 pt-6 border-t border-gray-200">
              <div className="flex justify-between text-gray-600">
                <span>المجموع الفرعي</span>
                <span>{getCartTotal().toFixed(2)} د.ل</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>الشحن</span>
                <span className="text-green-600 font-medium">مجاني</span>
              </div>
              <div className="flex justify-between font-bold text-xl text-gray-900 pt-3 border-t border-gray-200">
                <span>الإجمالي</span>
                <span>{getCartTotal().toFixed(2)} د.ل</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Cart;
