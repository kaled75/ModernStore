import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { Order } from '../../types';
import { Package, Trash2, ChevronDown, ChevronUp, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useDialogStore } from '../../store/useDialogStore';

const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          items:order_items(
            *,
            product:products(name, images)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      useDialogStore.getState().showAlert('حدث خطأ أثناء جلب الطلبات', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const toggleOrderDetails = (orderId: string) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'جديد': return 'bg-blue-100 text-blue-800';
      case 'قيد المعالجة': return 'bg-yellow-100 text-yellow-800';
      case 'مكتمل': return 'bg-green-100 text-green-800';
      case 'ملغي': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;
      
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
    } catch (error) {
      console.error('Error updating order status:', error);
      useDialogStore.getState().showAlert('حدث خطأ أثناء تحديث حالة الطلب', 'error');
    }
  };

  const deleteOrder = async (orderId: string) => {
    const confirmed = await useDialogStore.getState().showConfirm('هل أنت متأكد من حذف هذا الطلب نهائياً؟');
    if (!confirmed) return;
    try {
      const { error } = await supabase.from('orders').delete().eq('id', orderId);
      if (error) throw error;
      setOrders(orders.filter(order => order.id !== orderId));
    } catch (error) {
      console.error('Error deleting order:', error);
      useDialogStore.getState().showAlert('حدث خطأ أثناء حذف الطلب', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">إدارة الطلبات</h1>
          <p className="text-gray-500 mt-1">متابعة ومعالجة طلبات العملاء</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {orders.length === 0 ? (
          <div className="p-12 text-center text-gray-500 flex flex-col items-center">
            <Package className="w-12 h-12 mb-4 text-gray-300" />
            <p>لا توجد طلبات حتى الآن.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {orders.map((order) => (
              <div key={order.id} className="bg-white">
                {/* Order Summary Row */}
                <div 
                  className="px-6 py-4 flex flex-col sm:flex-row items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleOrderDetails(order.id)}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8 w-full">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">رقم الطلب</p>
                      <p className="font-mono text-gray-900 font-medium">#{order.id.slice(0, 8)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">العميل</p>
                      <p className="font-medium text-gray-900">{order.customer_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">التاريخ</p>
                      <p className="font-medium text-gray-900">
                        {new Date(order.created_at).toLocaleDateString('ar-SA')}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">الإجمالي</p>
                      <p className="font-bold text-primary-600">{order.total_amount} د.ل</p>
                    </div>
                    <div className="sm:ml-auto flex items-center gap-4">
                      <select 
                        value={order.status}
                        onChange={(e) => {
                          e.stopPropagation();
                          updateOrderStatus(order.id, e.target.value);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className={`text-sm font-medium px-3 py-1.5 rounded-full border-none cursor-pointer outline-none ${getStatusBadgeColor(order.status)}`}
                      >
                        <option value="جديد">جديد</option>
                        <option value="قيد المعالجة">قيد المعالجة</option>
                        <option value="مكتمل">مكتمل</option>
                        <option value="ملغي">ملغي</option>
                      </select>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteOrder(order.id);
                        }}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="حذف الطلب"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                      {expandedOrderId === order.id ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Order Details Expanded Area */}
                {expandedOrderId === order.id && (
                  <div className="px-6 py-6 bg-gray-50 border-t border-gray-100">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Customer Info */}
                      <div className="bg-white p-4 rounded-xl border border-gray-100">
                        <h4 className="font-bold text-gray-900 mb-4">بيانات التوصيل</h4>
                        <div className="space-y-3 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-500">الاسم:</span>
                            <span className="font-medium text-gray-900">{order.customer_name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">رقم الهاتف:</span>
                            <span className="font-medium text-gray-900" dir="ltr">{order.customer_phone}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">المدينة:</span>
                            <span className="font-medium text-gray-900">{order.customer_city}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">العنوان التفصيلي:</span>
                            <span className="font-medium text-gray-900 text-left w-1/2">{order.customer_address}</span>
                          </div>
                        </div>
                      </div>

                      {/* Ordered Items */}
                      <div className="bg-white p-4 rounded-xl border border-gray-100">
                        <h4 className="font-bold text-gray-900 mb-4">المنتجات المطلوبة</h4>
                        <div className="space-y-4 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                          {order.items?.map((item) => (
                            <div key={item.id} className="flex gap-4 items-center">
                              <div className="w-12 h-12 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
                                {item.product?.images?.[0] && (
                                  <img src={item.product.images[0]} alt="" className="w-full h-full object-cover" />
                                )}
                              </div>
                                <div className="flex-grow">
                                  <p className="font-medium text-gray-900 text-sm">{item.product?.name || 'منتج محذوف'}</p>
                                  {(item.selected_size || item.selected_color) && (
                                    <p className="text-xs text-gray-500 mt-0.5 mb-1">
                                      {item.selected_size && <span>المقاس: {item.selected_size}</span>}
                                      {item.selected_size && item.selected_color && <span className="mx-1">-</span>}
                                      {item.selected_color && <span>اللون: {item.selected_color}</span>}
                                    </p>
                                  )}
                                  <p className="text-xs text-gray-500">
                                    {item.price} د.ل × {item.quantity}
                                  </p>
                                </div>
                              <div className="font-bold text-gray-900">
                                {(item.price * item.quantity).toFixed(2)} د.ل
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;
