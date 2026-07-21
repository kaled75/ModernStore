import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { Product, Category } from '../../types';
import { Plus, Trash2, Edit, X, Package, ShoppingBag, Tag, TrendingUp } from 'lucide-react';
import { useDialogStore } from '../../store/useDialogStore';

const AdminDashboard = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [ordersCount, setOrdersCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    discount_price: '',
    category_id: '',
    images: '',
    sizes: '',
    colors: '',
  });

  const fetchData = async () => {
    try {
      const [productsRes, categoriesRes, ordersRes] = await Promise.all([
        supabase.from('products').select('*, category:categories(name)').order('created_at', { ascending: false }),
        supabase.from('categories').select('*').order('name'),
        supabase.from('orders').select('id', { count: 'exact', head: true }),
      ]);

      if (productsRes.error) throw productsRes.error;
      if (categoriesRes.error) throw categoriesRes.error;

      if (productsRes.data) setProducts(productsRes.data);
      if (categoriesRes.data) setCategories(categoriesRes.data);
      if (ordersRes.count !== null) setOrdersCount(ordersRes.count);
    } catch (error) {
      console.error('Error fetching data:', error);
      useDialogStore.getState().showAlert('حدث خطأ أثناء جلب البيانات', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id: string) => {
    const confirmed = await useDialogStore.getState().showConfirm('هل أنت متأكد من حذف هذا المنتج؟');
    if (!confirmed) return;
    
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      setProducts(products.filter(p => p.id !== id));
    } catch (error) {
      console.error('Error deleting product:', error);
      useDialogStore.getState().showAlert('حدث خطأ أثناء حذف المنتج', 'error');
    }
  };

  const emptyForm = { name: '', description: '', price: '', discount_price: '', category_id: '', images: '', sizes: '', colors: '' };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData(emptyForm);
  };

  const handleEdit = (product: Product) => {
    setEditingId(product.id);
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      discount_price: product.discount_price ? product.discount_price.toString() : '',
      category_id: product.category_id || '',
      images: product.images ? product.images.join('\n') : '',
      sizes: product.sizes ? product.sizes.join('، ') : '',
      colors: product.colors ? product.colors.join('، ') : '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const slug = formData.name.toLowerCase().replace(/\s+/g, '-') + '-' + Math.random().toString(36).substring(7);
      
      const productPayload = {
        name: formData.name,
        slug: editingId ? undefined : slug,
        description: formData.description,
        price: parseFloat(formData.price),
        discount_price: formData.discount_price ? parseFloat(formData.discount_price) : null,
        category_id: formData.category_id || null,
        images: formData.images ? formData.images.split('\n').map(s => s.trim()).filter(Boolean) : [],
        sizes: formData.sizes ? formData.sizes.split(/[,،]/).map(s => s.trim()).filter(Boolean) : [],
        colors: formData.colors ? formData.colors.split(/[,،]/).map(s => s.trim()).filter(Boolean) : [],
      };

      if (editingId) {
        const { slug: _slug, ...updatePayload } = productPayload;
        const { data, error } = await supabase
          .from('products')
          .update(updatePayload)
          .eq('id', editingId)
          .select('*, category:categories(name)')
          .single();

        if (error) throw error;
        if (data) {
          setProducts(products.map(p => p.id === editingId ? data : p));
          closeModal();
        }
      } else {
        const { data, error } = await supabase
          .from('products')
          .insert([productPayload])
          .select('*, category:categories(name)')
          .single();

        if (error) throw error;
        if (data) {
          setProducts([data, ...products]);
          closeModal();
        }
      }
    } catch (error) {
      console.error('Error saving product:', error);
      useDialogStore.getState().showAlert('حدث خطأ أثناء حفظ المنتج. تأكد من إعطاء الصلاحيات.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const discountedCount = products.filter(p => p.discount_price).length;
  const totalValue = products.reduce((sum, p) => sum + p.price, 0);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-gray-500">إجمالي المنتجات</p>
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{products.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-gray-500">الأقسام</p>
            <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
              <Tag className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{categories.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-gray-500">الطلبات الكلية</p>
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{ordersCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-gray-500">منتجات بتخفيض</p>
            <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-red-500" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{discountedCount}</p>
        </div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">إدارة المنتجات</h1>
          <p className="text-gray-500 mt-1">إضافة، تعديل، وحذف المنتجات من متجرك</p>
        </div>
        <button
          onClick={() => {
            setEditingId(null);
            setFormData(emptyForm);
            setIsModalOpen(true);
          }}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          إضافة منتج
        </button>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">المنتج</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">السعر</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">القسم</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">تاريخ الإضافة</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <Package className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                    <p className="text-gray-500">لا توجد منتجات حالياً.</p>
                    <button
                      onClick={() => { setEditingId(null); setFormData(emptyForm); setIsModalOpen(true); }}
                      className="mt-3 text-primary-600 hover:text-primary-700 font-medium text-sm"
                    >
                      أضف أول منتج الآن
                    </button>
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                          {product.images && product.images.length > 0 ? (
                            <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">صورة</div>
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{product.name}</div>
                          <div className="text-xs text-gray-500 line-clamp-1 w-48">{product.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {product.discount_price ? (
                        <div>
                          <span className="font-bold text-primary-600">{product.discount_price} د.ل</span>
                          <span className="text-xs text-gray-400 line-through mr-1">{product.price} د.ل</span>
                        </div>
                      ) : (
                        <span className="font-medium text-gray-900">{product.price} د.ل</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {/* @ts-ignore */}
                      {product.category?.name || <span className="text-gray-400">بدون قسم</span>}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(product.created_at || '').toLocaleDateString('ar-SA')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => handleEdit(product)}
                          className="text-gray-400 hover:text-blue-600 transition-colors"
                          title="تعديل"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => handleDelete(product.id)}
                          className="text-gray-400 hover:text-red-600 transition-colors"
                          title="حذف"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden my-8">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-900">
                {editingId ? 'تعديل المنتج' : 'إضافة منتج جديد'}
              </h3>
              <button 
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 p-2 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">اسم المنتج *</label>
                  <input 
                    required
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none" 
                    placeholder="اسم المنتج"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">السعر الأصلي (د.ل) *</label>
                    <input 
                      required
                      type="number" 
                      step="0.01"
                      min="0"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none" 
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      سعر التخفيض (د.ل)
                      <span className="text-gray-400 font-normal mr-1">- اختياري</span>
                    </label>
                    <input 
                      type="number" 
                      step="0.01"
                      min="0"
                      value={formData.discount_price}
                      onChange={(e) => setFormData({...formData, discount_price: e.target.value})}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none" 
                      placeholder="0.00"
                    />
                    <p className="text-xs text-gray-400 mt-1">اتركه فارغاً إن لا يوجد تخفيض</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">القسم *</label>
                  <select 
                    required
                    value={formData.category_id}
                    onChange={(e) => setFormData({...formData, category_id: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  >
                    <option value="">اختر القسم...</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">وصف المنتج</label>
                  <textarea 
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none" 
                    placeholder="وصف تفصيلي للمنتج..."
                  ></textarea>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">روابط الصور (صورة في كل سطر)</label>
                  <textarea 
                    rows={3}
                    value={formData.images}
                    onChange={(e) => setFormData({...formData, images: e.target.value})}
                    placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-left resize-none" dir="ltr"
                  ></textarea>
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">المقاسات المتاحة</label>
                    <input 
                      type="text" 
                      value={formData.sizes}
                      onChange={(e) => setFormData({...formData, sizes: e.target.value})}
                      placeholder="S, M, L, XL"
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-left" dir="ltr"
                    />
                    <p className="text-xs text-gray-500 mt-1">افصل بفاصلة (,)</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">الألوان المتاحة</label>
                    <input 
                      type="text" 
                      value={formData.colors}
                      onChange={(e) => setFormData({...formData, colors: e.target.value})}
                      placeholder="أحمر، أزرق، أسود"
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none" 
                    />
                    <p className="text-xs text-gray-500 mt-1">افصل بفاصلة (،)</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-2.5 rounded-lg font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  إلغاء
                </button>
                <button 
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-lg font-medium text-white bg-primary-600 hover:bg-primary-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      جاري الحفظ...
                    </>
                  ) : (
                    editingId ? 'تحديث المنتج' : 'حفظ المنتج'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
