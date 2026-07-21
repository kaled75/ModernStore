import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { Category, Widget } from '../../types';
import { Save, Plus, Trash2, Edit, X, Power, GripVertical } from 'lucide-react';
import { useDialogStore } from '../../store/useDialogStore';

const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState<'categories' | 'general' | 'pages' | 'widgets' | 'account'>('categories');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Settings State
  const [settings, setSettings] = useState<Record<string, string>>({});
  
  // Categories State
  const [categories, setCategories] = useState<Category[]>([]);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryForm, setCategoryForm] = useState({ name: '', image_url: '' });

  // Widgets State
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [draggedWidgetId, setDraggedWidgetId] = useState<string | null>(null);
  const [isWidgetModalOpen, setIsWidgetModalOpen] = useState(false);
  const [editingWidget, setEditingWidget] = useState<Widget | null>(null);
  const [widgetForm, setWidgetForm] = useState({ title: '', content: '', type: 'custom_text' as 'custom_text' | 'price_filter' | 'banner' });

  // Account State
  const [passwordForm, setPasswordForm] = useState({ newPassword: '', confirmPassword: '' });
  const [newUserForm, setNewUserForm] = useState({ email: '', password: '' });

  const fetchData = async () => {
    try {
      const [settingsRes, categoriesRes, widgetsRes] = await Promise.all([
        supabase.from('store_settings').select('*'),
        supabase.from('categories').select('*').order('name'),
        supabase.from('store_widgets').select('*').order('order_index'),
      ]);

      if (settingsRes.error && settingsRes.error.code !== '42P01') {
        console.error('Error fetching settings:', settingsRes.error);
      } else if (settingsRes.data) {
        const settingsMap: Record<string, string> = {};
        settingsRes.data.forEach(item => {
          settingsMap[item.key] = item.value;
        });
        setSettings({
          store_name: settingsMap.store_name || '',
          contact_phone: settingsMap.contact_phone || '',
          whatsapp_number: settingsMap.whatsapp_number || '',
          contact_email: settingsMap.contact_email || '',
          contact_address: settingsMap.contact_address || '',
          about_us_text: settingsMap.about_us_text || '',
          faq_text: settingsMap.faq_text || '',
          shipping_text: settingsMap.shipping_text || '',
          returns_text: settingsMap.returns_text || '',
        });
      }

      if (categoriesRes.error) throw categoriesRes.error;
      if (categoriesRes.data) setCategories(categoriesRes.data);

      if (widgetsRes.error && widgetsRes.error.code !== '42P01') {
        console.error('Error fetching widgets:', widgetsRes.error);
      } else if (widgetsRes.data) {
        setWidgets(widgetsRes.data);
      }

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- Handlers for Settings & Pages ---
  const handleSettingChange = (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const saveSettings = async (keysToSave: string[]) => {
    setSaving(true);
    try {
      const updates = keysToSave.map(key => ({
        key,
        value: settings[key]
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from('store_settings')
          .upsert({ key: update.key, value: update.value }, { onConflict: 'key' });
        
        if (error) throw error;
      }
      
      useDialogStore.getState().showAlert('تم حفظ الإعدادات بنجاح!', 'success');
    } catch (error) {
      console.error('Error saving settings:', error);
      useDialogStore.getState().showAlert('حدث خطأ أثناء الحفظ. تأكد من تفعيل الصلاحيات.', 'error');
    } finally {
      setSaving(false);
    }
  };

  // --- Handlers for Categories ---
  const closeCategoryModal = () => {
    setIsCategoryModalOpen(false);
    setEditingCategory(null);
    setCategoryForm({ name: '', image_url: '' });
  };

  const handleEditCategory = (cat: Category) => {
    setEditingCategory(cat);
    setCategoryForm({ name: cat.name, image_url: cat.image_url || '' });
    setIsCategoryModalOpen(true);
  };

  const handleDeleteCategory = async (id: string) => {
    const confirmed = await useDialogStore.getState().showConfirm('هل أنت متأكد من حذف هذا القسم؟ قد تتأثر المنتجات المرتبطة به.');
    if (!confirmed) return;
    
    try {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) throw error;
      setCategories(categories.filter(c => c.id !== id));
    } catch (error) {
      console.error('Error deleting category:', error);
      useDialogStore.getState().showAlert('حدث خطأ أثناء الحذف.', 'error');
    }
  };

  const submitCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const slug = categoryForm.name.toLowerCase().replace(/\s+/g, '-');
      
      if (editingCategory) {
        const { data, error } = await supabase
          .from('categories')
          .update({ name: categoryForm.name, slug, image_url: categoryForm.image_url })
          .eq('id', editingCategory.id)
          .select()
          .single();

        if (error) throw error;
        if (data) {
          setCategories(categories.map(c => c.id === editingCategory.id ? data : c));
          closeCategoryModal();
        }
      } else {
        const { data, error } = await supabase
          .from('categories')
          .insert([{ name: categoryForm.name, slug, image_url: categoryForm.image_url }])
          .select()
          .single();

        if (error) throw error;
        if (data) {
          setCategories([...categories, data]);
          closeCategoryModal();
        }
      }
    } catch (error) {
      console.error('Error saving category:', error);
      useDialogStore.getState().showAlert('حدث خطأ. تأكد من الصلاحيات.', 'error');
    } finally {
      setSaving(false);
    }
  };

  // --- Handlers for Widgets ---
  const closeWidgetModal = () => {
    setIsWidgetModalOpen(false);
    setEditingWidget(null);
    setWidgetForm({ title: '', content: '', type: 'custom_text' });
  };

  const handleEditWidget = (w: Widget) => {
    setEditingWidget(w);
    setWidgetForm({ title: w.title, content: w.content || '', type: w.type });
    setIsWidgetModalOpen(true);
  };

  const handleDeleteWidget = async (id: string) => {
    const confirmed = await useDialogStore.getState().showConfirm('هل أنت متأكد من حذف هذا الودجت؟');
    if (!confirmed) return;
    try {
      await supabase.from('store_widgets').delete().eq('id', id);
      setWidgets(widgets.filter(w => w.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedWidgetId(id);
    e.dataTransfer.effectAllowed = 'move';
    setTimeout(() => {
      if (e.target instanceof HTMLElement) e.target.style.opacity = '0.5';
    }, 0);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    if (e.target instanceof HTMLElement) e.target.style.opacity = '1';
    setDraggedWidgetId(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedWidgetId || draggedWidgetId === targetId) return;

    const oldIndex = widgets.findIndex(w => w.id === draggedWidgetId);
    const newIndex = widgets.findIndex(w => w.id === targetId);

    const newWidgets = [...widgets];
    const [removed] = newWidgets.splice(oldIndex, 1);
    newWidgets.splice(newIndex, 0, removed);

    const updatedWidgets = newWidgets.map((w, i) => ({ ...w, order_index: i }));
    setWidgets(updatedWidgets);

    try {
      const updates = updatedWidgets.map(w => 
        supabase.from('store_widgets').update({ order_index: w.order_index }).eq('id', w.id)
      );
      await Promise.all(updates);
    } catch (error) {
      console.error('Error updating widget order:', error);
    }
  };

  const toggleWidgetActive = async (w: Widget) => {
    try {
      const { error } = await supabase.from('store_widgets').update({ is_active: !w.is_active }).eq('id', w.id);
      if (error) throw error;
      setWidgets(widgets.map(item => item.id === w.id ? { ...item, is_active: !w.is_active } : item));
    } catch (error) {
      console.error(error);
      useDialogStore.getState().showAlert('حدث خطأ أثناء تغيير الحالة.', 'error');
    }
  };

  const submitWidget = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingWidget) {
        const { data, error } = await supabase
          .from('store_widgets')
          .update({ title: widgetForm.title, content: widgetForm.content, type: widgetForm.type })
          .eq('id', editingWidget.id)
          .select()
          .single();
        if (error) throw error;
        if (data) setWidgets(widgets.map(w => w.id === editingWidget.id ? data : w));
      } else {
        const { data, error } = await supabase
          .from('store_widgets')
          .insert([{ ...widgetForm, order_index: widgets.length + 1 }])
          .select()
          .single();
        if (error) throw error;
        if (data) setWidgets([...widgets, data]);
      }
      closeWidgetModal();
    } catch (error) {
      console.error(error);
      useDialogStore.getState().showAlert('حدث خطأ أثناء الحفظ.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSocialChange = (platform: string, value: string) => {
    try {
      const current = widgetForm.content ? JSON.parse(widgetForm.content) : {};
      if (value) {
        current[platform] = value;
      } else {
        delete current[platform];
      }
      setWidgetForm({ ...widgetForm, content: JSON.stringify(current) });
    } catch {
      const current = { [platform]: value };
      setWidgetForm({ ...widgetForm, content: JSON.stringify(current) });
    }
  };

  const getSocialValue = (platform: string) => {
    try {
      if (!widgetForm.content) return '';
      const parsed = JSON.parse(widgetForm.content);
      return parsed[platform] || '';
    } catch {
      return '';
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      useDialogStore.getState().showAlert('كلمتا المرور غير متطابقتين', 'error');
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: passwordForm.newPassword });
      if (error) throw error;
      useDialogStore.getState().showAlert('تم تغيير كلمة المرور بنجاح', 'success');
      setPasswordForm({ newPassword: '', confirmPassword: '' });
    } catch (error) {
      console.error(error);
      useDialogStore.getState().showAlert('حدث خطأ أثناء تغيير كلمة المرور', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: newUserForm.email,
        password: newUserForm.password,
      });
      if (error) throw error;
      useDialogStore.getState().showAlert('تم إضافة الحساب بنجاح. يرجى الملاحظة: قد يتم تسجيل خروجك وعليك تسجيل الدخول بالحساب الجديد أو القديم.', 'success');
      setNewUserForm({ email: '', password: '' });
    } catch (error) {
      console.error(error);
      useDialogStore.getState().showAlert('حدث خطأ أثناء إنشاء الحساب', 'error');
    } finally {
      setSaving(false);
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
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">إعدادات المتجر</h1>
        <p className="text-gray-500 mt-1">إدارة الأقسام، المحتوى، والبيانات العامة للمتجر</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="flex gap-6">
          <button
            onClick={() => setActiveTab('categories')}
            className={`py-4 px-1 inline-flex items-center border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'categories'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            الأقسام
          </button>
          <button
            onClick={() => setActiveTab('general')}
            className={`py-4 px-1 inline-flex items-center border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'general'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            إعدادات عامة
          </button>
          <button
            onClick={() => setActiveTab('pages')}
            className={`py-4 px-1 inline-flex items-center border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'pages'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            الصفحات (المحتوى)
          </button>
          <button
            onClick={() => setActiveTab('widgets')}
            className={`py-4 px-1 inline-flex items-center border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'widgets'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            الودجات (Sidebar)
          </button>
          <button
            onClick={() => setActiveTab('account')}
            className={`py-4 px-1 inline-flex items-center border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'account'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            إدارة الحساب
          </button>
        </nav>
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        
        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <div>
            <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <h2 className="text-lg font-bold text-gray-900">إدارة الأقسام</h2>
              <button 
                onClick={() => setIsCategoryModalOpen(true)}
                className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                إضافة قسم
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-right">
                <thead className="bg-white border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-600">القسم</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-600">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {categories.map((cat) => (
                    <tr key={cat.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
                          {cat.image_url ? (
                            <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-xs text-gray-400">صورة</span>
                          )}
                        </div>
                        <span className="font-medium text-gray-900">{cat.name}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <button onClick={() => handleEditCategory(cat)} className="text-gray-400 hover:text-blue-600">
                            <Edit className="w-5 h-5" />
                          </button>
                          <button onClick={() => handleDeleteCategory(cat.id)} className="text-gray-400 hover:text-red-600">
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {categories.length === 0 && (
                    <tr>
                      <td colSpan={2} className="px-6 py-8 text-center text-gray-500">لا توجد أقسام.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* General Settings Tab */}
        {activeTab === 'general' && (
          <div className="p-6 md:p-8 max-w-3xl">
            <h2 className="text-lg font-bold text-gray-900 mb-6">بيانات التواصل والأساسيات</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">اسم المتجر</label>
                <input 
                  type="text" 
                  value={settings.store_name || ''} 
                  onChange={(e) => handleSettingChange('store_name', e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 outline-none" 
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">رقم الهاتف للعملاء</label>
                  <input 
                    type="text" 
                    value={settings.contact_phone || ''} 
                    onChange={(e) => handleSettingChange('contact_phone', e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 outline-none" dir="ltr"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">رقم الواتساب (اختياري، للطلبات)</label>
                  <input 
                    type="text" 
                    value={settings.whatsapp_number || ''} 
                    onChange={(e) => handleSettingChange('whatsapp_number', e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 outline-none" dir="ltr"
                    placeholder="مثال: +218xxxxxxx"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">البريد الإلكتروني للعملاء</label>
                  <input 
                    type="email" 
                    value={settings.contact_email || ''} 
                    onChange={(e) => handleSettingChange('contact_email', e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 outline-none" dir="ltr"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">العنوان الفعلي (المقر)</label>
                <input 
                  type="text" 
                  value={settings.contact_address || ''} 
                  onChange={(e) => handleSettingChange('contact_address', e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 outline-none" 
                />
              </div>
              <div className="pt-4 border-t border-gray-100 flex justify-end">
                <button 
                  onClick={() => saveSettings(['store_name', 'contact_phone', 'whatsapp_number', 'contact_email', 'contact_address'])}
                  disabled={saving}
                  className="bg-primary-600 text-white px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 hover:bg-primary-700 disabled:opacity-70"
                >
                  <Save className="w-5 h-5" />
                  {saving ? 'جاري الحفظ...' : 'حفظ الإعدادات العامة'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Pages Tab */}
        {activeTab === 'pages' && (
          <div className="p-6 md:p-8 max-w-4xl">
            <h2 className="text-lg font-bold text-gray-900 mb-6">محتوى الصفحات</h2>
            <div className="space-y-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">نص صفحة "قصتنا" (من نحن)</label>
                <textarea 
                  rows={6}
                  value={settings.about_us_text || ''} 
                  onChange={(e) => handleSettingChange('about_us_text', e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 outline-none resize-none leading-relaxed" 
                ></textarea>
              </div>
              
              <div className="pt-6 border-t border-gray-100">
                <label className="block text-sm font-medium text-gray-700 mb-2">الأسئلة الشائعة</label>
                <textarea 
                  rows={6}
                  value={settings.faq_text || ''} 
                  onChange={(e) => handleSettingChange('faq_text', e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 outline-none resize-none leading-relaxed" 
                ></textarea>
              </div>

              <div className="pt-6 border-t border-gray-100">
                <label className="block text-sm font-medium text-gray-700 mb-2">سياسة الشحن</label>
                <textarea 
                  rows={6}
                  value={settings.shipping_text || ''} 
                  onChange={(e) => handleSettingChange('shipping_text', e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 outline-none resize-none leading-relaxed" 
                ></textarea>
              </div>

              <div className="pt-6 border-t border-gray-100">
                <label className="block text-sm font-medium text-gray-700 mb-2">سياسة الاسترجاع</label>
                <textarea 
                  rows={6}
                  value={settings.returns_text || ''} 
                  onChange={(e) => handleSettingChange('returns_text', e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 outline-none resize-none leading-relaxed" 
                ></textarea>
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end">
                <button 
                  onClick={() => saveSettings(['about_us_text', 'faq_text', 'shipping_text', 'returns_text'])}
                  disabled={saving}
                  className="bg-primary-600 text-white px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 hover:bg-primary-700 disabled:opacity-70"
                >
                  <Save className="w-5 h-5" />
                  {saving ? 'جاري الحفظ...' : 'حفظ محتوى الصفحات'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Widgets Tab */}
        {activeTab === 'widgets' && (
          <div>
            <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <h2 className="text-lg font-bold text-gray-900">إدارة ودجات الشريط الجانبي</h2>
              <button 
                onClick={() => setIsWidgetModalOpen(true)}
                className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                إضافة ودجت
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {widgets.map((widget) => (
                  <div 
                    key={widget.id} 
                    draggable
                    onDragStart={(e) => handleDragStart(e, widget.id)}
                    onDragEnd={handleDragEnd}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, widget.id)}
                    className={`flex items-center justify-between p-4 border rounded-xl transition-all ${widget.is_active ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-200 opacity-75'} ${draggedWidgetId === widget.id ? 'opacity-50 border-primary-500 scale-[0.98]' : ''}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-gray-400 cursor-move hover:text-primary-600 transition-colors">
                        <GripVertical className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">{widget.title}</h3>
                        <p className="text-sm text-gray-500">
                          {widget.type === 'price_filter' ? 'فلتر أسعار' : widget.type === 'banner' ? 'صورة/بانر' : widget.type === 'social_media' ? 'تواصل اجتماعي' : 'نص مخصص'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => toggleWidgetActive(widget)} 
                        className={`p-2 rounded-lg ${widget.is_active ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-200'}`}
                        title={widget.is_active ? 'إيقاف الودجت' : 'تفعيل الودجت'}
                      >
                        <Power className="w-5 h-5" />
                      </button>
                      <button onClick={() => handleEditWidget(widget)} className="text-gray-400 hover:text-blue-600 p-2">
                        <Edit className="w-5 h-5" />
                      </button>
                      <button onClick={() => handleDeleteWidget(widget.id)} className="text-gray-400 hover:text-red-600 p-2">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
                {widgets.length === 0 && (
                  <div className="text-center py-8 text-gray-500">لا توجد ودجات.</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Account Management Tab */}
        {activeTab === 'account' && (
          <div>
            <div className="p-6 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-bold text-gray-900">إدارة الحسابات (المدير)</h2>
              <p className="text-sm text-gray-500 mt-1">تغيير كلمة المرور الخاصة بك أو إضافة مدير جديد</p>
            </div>
            
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-12">
              {/* Update Password */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-6">تغيير كلمة المرور الحالية</h3>
                <form onSubmit={handleUpdatePassword} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">كلمة المرور الجديدة</label>
                    <input 
                      required
                      type="password" 
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 outline-none" 
                      dir="ltr"
                      placeholder="••••••••"
                      minLength={6}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">تأكيد كلمة المرور</label>
                    <input 
                      required
                      type="password" 
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 outline-none" 
                      dir="ltr"
                      placeholder="••••••••"
                      minLength={6}
                    />
                  </div>
                  <button 
                    type="submit"
                    disabled={saving}
                    className="w-full bg-primary-600 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-primary-700 disabled:opacity-70 mt-4"
                  >
                    تحديث كلمة المرور
                  </button>
                </form>
              </div>

              {/* Add New Admin */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-6">إضافة مدير جديد</h3>
                <form onSubmit={handleAddUser} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">البريد الإلكتروني (اسم المستخدم)</label>
                    <input 
                      required
                      type="email" 
                      value={newUserForm.email}
                      onChange={(e) => setNewUserForm({...newUserForm, email: e.target.value})}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 outline-none" 
                      dir="ltr"
                      placeholder="admin2@store.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">كلمة المرور</label>
                    <input 
                      required
                      type="password" 
                      value={newUserForm.password}
                      onChange={(e) => setNewUserForm({...newUserForm, password: e.target.value})}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 outline-none" 
                      dir="ltr"
                      placeholder="••••••••"
                      minLength={6}
                    />
                  </div>
                  <button 
                    type="submit"
                    disabled={saving}
                    className="w-full bg-gray-900 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-black disabled:opacity-70 mt-4 flex items-center justify-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    إنشاء الحساب
                  </button>
                </form>

                <div className="mt-8 bg-yellow-50 p-4 rounded-xl border border-yellow-100">
                  <p className="text-sm text-yellow-800 font-medium">ملاحظة أمنية هامة:</p>
                  <p className="text-xs text-yellow-700 mt-1 leading-relaxed">
                    لحذف مستخدمين أو تعديل صلاحياتهم بشكل كامل، يرجى التوجه إلى لوحة تحكم <strong>Supabase</strong> (قسم Authentication &gt; Users). لأسباب أمنية لا يمكن إتاحة الحذف للمستخدمين من داخل المتجر مباشرة.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Add/Edit Category Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-900">
                {editingCategory ? 'تعديل القسم' : 'إضافة قسم جديد'}
              </h3>
              <button 
                onClick={closeCategoryModal}
                className="text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 p-2 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={submitCategory} className="p-6">
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">اسم القسم *</label>
                  <input 
                    required
                    type="text" 
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm({...categoryForm, name: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">رابط الصورة (URL)</label>
                  <input 
                    type="url" 
                    value={categoryForm.image_url}
                    onChange={(e) => setCategoryForm({...categoryForm, image_url: e.target.value})}
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 outline-none text-left" dir="ltr"
                  />
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={closeCategoryModal}
                  className="px-6 py-2.5 rounded-lg font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  إلغاء
                </button>
                <button 
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-lg font-medium text-white bg-primary-600 hover:bg-primary-700 transition-colors disabled:opacity-70"
                >
                  {saving ? 'جاري الحفظ...' : (editingCategory ? 'تحديث' : 'حفظ')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add/Edit Widget Modal */}
      {isWidgetModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-900">
                {editingWidget ? 'تعديل ودجت' : 'إضافة ودجت جديد'}
              </h3>
              <button 
                onClick={closeWidgetModal}
                className="text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 p-2 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={submitWidget} className="p-6">
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">النوع *</label>
                  <select 
                    value={widgetForm.type}
                    onChange={(e) => setWidgetForm({...widgetForm, type: e.target.value as any})}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 outline-none" 
                  >
                    <option value="custom_text">نص مخصص / HTML</option>
                    <option value="price_filter">فلتر أسعار (تلقائي)</option>
                    <option value="banner">رابط صورة (بانر)</option>
                    <option value="social_media">روابط تواصل اجتماعي</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">العنوان *</label>
                  <input 
                    required
                    type="text" 
                    value={widgetForm.title}
                    onChange={(e) => setWidgetForm({...widgetForm, title: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 outline-none" 
                  />
                </div>
                {widgetForm.type !== 'price_filter' && widgetForm.type !== 'social_media' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">المحتوى / الرابط *</label>
                    <textarea 
                      required
                      rows={4}
                      value={widgetForm.content}
                      onChange={(e) => setWidgetForm({...widgetForm, content: e.target.value})}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 outline-none resize-none" 
                    ></textarea>
                  </div>
                )}
                {widgetForm.type === 'social_media' && (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-500">أدخل روابط الحسابات التي تريد إظهارها (اترك الحقل فارغاً للإخفاء):</p>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">فيسبوك (Facebook)</label>
                      <input 
                        type="url" 
                        value={getSocialValue('facebook')}
                        onChange={(e) => handleSocialChange('facebook', e.target.value)}
                        placeholder="https://facebook.com/..."
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 outline-none text-left" 
                        dir="ltr"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">تويتر (Twitter / X)</label>
                      <input 
                        type="url" 
                        value={getSocialValue('twitter')}
                        onChange={(e) => handleSocialChange('twitter', e.target.value)}
                        placeholder="https://twitter.com/..."
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 outline-none text-left" 
                        dir="ltr"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">إنستغرام (Instagram)</label>
                      <input 
                        type="url" 
                        value={getSocialValue('instagram')}
                        onChange={(e) => handleSocialChange('instagram', e.target.value)}
                        placeholder="https://instagram.com/..."
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 outline-none text-left" 
                        dir="ltr"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">يوتيوب (YouTube)</label>
                      <input 
                        type="url" 
                        value={getSocialValue('youtube')}
                        onChange={(e) => handleSocialChange('youtube', e.target.value)}
                        placeholder="https://youtube.com/..."
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 outline-none text-left" 
                        dir="ltr"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-8 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={closeWidgetModal}
                  className="px-6 py-2.5 rounded-lg font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  إلغاء
                </button>
                <button 
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-lg font-medium text-white bg-primary-600 hover:bg-primary-700 transition-colors disabled:opacity-70"
                >
                  {saving ? 'جاري الحفظ...' : (editingWidget ? 'تحديث' : 'إضافة')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminSettings;
