import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { Product, Category, Widget } from '../types';
import { useCartStore } from '../store/useCartStore';
import { useDialogStore } from '../store/useDialogStore';
import { Facebook, Twitter, Instagram, Youtube, Linkedin, Search, X, SlidersHorizontal } from 'lucide-react';

const CustomHtmlWidget = ({ htmlContent }: { htmlContent: string }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    
    // Execute script tags inside the injected HTML
    const scripts = containerRef.current.querySelectorAll('script');
    scripts.forEach((oldScript) => {
      const newScript = document.createElement('script');
      Array.from(oldScript.attributes).forEach((attr) => {
        newScript.setAttribute(attr.name, attr.value);
      });
      newScript.appendChild(document.createTextNode(oldScript.innerHTML));
      oldScript.parentNode?.replaceChild(newScript, oldScript);
    });
  }, [htmlContent]);

  return (
    <div 
      ref={containerRef}
      className="text-gray-600 text-sm leading-relaxed overflow-hidden" 
      dangerouslySetInnerHTML={{ __html: htmlContent }} 
    />
  );
};

type PriceFilter = 'all' | 'under50' | '50to100' | 'over100';

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [priceFilter, setPriceFilter] = useState<PriceFilter>('all');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [searchParams] = useSearchParams();
  const addItem = useCartStore((state) => state.addItem);
  const navigate = useNavigate();

  const handleAddToCartClick = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    if ((product.sizes && product.sizes.length > 0) || (product.colors && product.colors.length > 0)) {
      useDialogStore.getState().showAlert('يرجى اختيار المقاس واللون من صفحة المنتج', 'info');
      navigate(`/products/${product.id}`);
      return;
    }
    addItem(product);
    useDialogStore.getState().showAlert('تم إضافة المنتج للسلة بنجاح!', 'success');
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, widgetsRes, categoriesRes] = await Promise.all([
          supabase.from('products').select('*').order('created_at', { ascending: false }),
          supabase.from('store_widgets').select('*').eq('is_active', true).order('order_index'),
          supabase.from('categories').select('*').order('name'),
        ]);

        if (productsRes.error) {
          console.error('Error fetching products:', productsRes.error);
        } else if (productsRes.data) {
          setProducts(productsRes.data);
        }

        if (widgetsRes.error && widgetsRes.error.code !== '42P01') {
          console.error('Error fetching widgets:', widgetsRes.error);
        } else if (widgetsRes.data) {
          setWidgets(widgetsRes.data);
        }

        if (categoriesRes.data) {
          setCategories(categoriesRes.data);
        }
      } catch (error) {
        console.error('Unexpected error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Apply category and search from URL query params
  useEffect(() => {
    const catParam = searchParams.get('category');
    const searchParam = searchParams.get('search');
    if (catParam) setSelectedCategory(catParam);
    if (searchParam) setSearchQuery(searchParam);
  }, [searchParams]);

  const filteredProducts = products.filter((product) => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (!product.name.toLowerCase().includes(query) && !(product.description?.toLowerCase().includes(query))) {
        return false;
      }
    }

    // Category filter
    if (selectedCategory !== 'all' && product.category_id !== selectedCategory) {
      return false;
    }

    // Price filter
    const price = product.discount_price || product.price;
    if (priceFilter === 'under50' && price >= 50) return false;
    if (priceFilter === '50to100' && (price < 50 || price > 100)) return false;
    if (priceFilter === 'over100' && price <= 100) return false;

    return true;
  });

  const renderSocialMedia = (jsonStr: string | null) => {
    if (!jsonStr) return null;
    try {
      const links = JSON.parse(jsonStr);
      return (
        <div className="flex gap-4 mt-2">
          {links.facebook && <a href={links.facebook} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-blue-600"><Facebook className="w-5 h-5" /></a>}
          {links.twitter && <a href={links.twitter} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-blue-400"><Twitter className="w-5 h-5" /></a>}
          {links.instagram && <a href={links.instagram} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-pink-600"><Instagram className="w-5 h-5" /></a>}
          {links.youtube && <a href={links.youtube} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-red-600"><Youtube className="w-5 h-5" /></a>}
          {links.linkedin && <a href={links.linkedin} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-blue-700"><Linkedin className="w-5 h-5" /></a>}
        </div>
      );
    } catch {
      return <div className="text-sm text-red-500">صيغة الروابط غير صحيحة</div>;
    }
  };

  const SidebarContent = () => (
    <div className="space-y-6">
      {/* Category Filter */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold mb-4">الأقسام</h3>
        <div className="space-y-2">
          <label
            className={`flex items-center gap-2 cursor-pointer py-1 px-2 rounded-lg transition-colors ${selectedCategory === 'all' ? 'bg-primary-50 text-primary-700' : 'hover:bg-gray-50 text-gray-600'}`}
            onClick={() => setSelectedCategory('all')}
          >
            <input type="radio" name="category" checked={selectedCategory === 'all'} onChange={() => {}} className="text-primary-600" />
            <span className="font-medium">الكل</span>
          </label>
          {categories.map((cat) => (
            <label
              key={cat.id}
              className={`flex items-center gap-2 cursor-pointer py-1 px-2 rounded-lg transition-colors ${selectedCategory === cat.id ? 'bg-primary-50 text-primary-700' : 'hover:bg-gray-50 text-gray-600'}`}
              onClick={() => setSelectedCategory(cat.id)}
            >
              <input type="radio" name="category" checked={selectedCategory === cat.id} onChange={() => {}} className="text-primary-600" />
              <span className="font-medium">{cat.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Filter */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold mb-4">فلتر السعر</h3>
        <div className="space-y-2">
          {[
            { value: 'all', label: 'جميع الأسعار' },
            { value: 'under50', label: 'أقل من 50 د.ل' },
            { value: '50to100', label: '50 - 100 د.ل' },
            { value: 'over100', label: 'أكثر من 100 د.ل' },
          ].map((option) => (
            <label
              key={option.value}
              className={`flex items-center gap-2 cursor-pointer py-1 px-2 rounded-lg transition-colors ${priceFilter === option.value ? 'bg-primary-50 text-primary-700' : 'hover:bg-gray-50 text-gray-600'}`}
              onClick={() => setPriceFilter(option.value as PriceFilter)}
            >
              <input type="radio" name="price" checked={priceFilter === option.value} onChange={() => {}} className="text-primary-600" />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Dynamic Widgets */}
      {widgets.map((widget) => (
        <div key={widget.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold mb-4">{widget.title}</h3>

          {widget.type === 'custom_text' && (
            <CustomHtmlWidget htmlContent={widget.content || ''} />
          )}

          {widget.type === 'banner' && widget.content && (
            <div className="rounded-lg overflow-hidden">
              <img src={widget.content} alt={widget.title} className="w-full h-auto" />
            </div>
          )}

          {widget.type === 'social_media' && renderSocialMedia(widget.content)}
        </div>
      ))}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">جميع المنتجات</h1>
        <p className="text-gray-500 mt-2">
          {!loading && `${filteredProducts.length} منتج`}
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative mb-8">
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="ابحث عن منتج..."
          className="w-full pl-10 pr-12 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all bg-white shadow-sm"
          dir="rtl"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Mobile Filter Button */}
      <div className="md:hidden mb-6">
        <button
          onClick={() => setIsMobileFilterOpen(true)}
          className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
        >
          <SlidersHorizontal className="w-4 h-4" />
          فلترة وتصنيف
          {(selectedCategory !== 'all' || priceFilter !== 'all') && (
            <span className="bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {(selectedCategory !== 'all' ? 1 : 0) + (priceFilter !== 'all' ? 1 : 0)}
            </span>
          )}
        </button>
      </div>

      {/* Mobile Filter Drawer */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setIsMobileFilterOpen(false)} />
          <div className="absolute bottom-0 left-0 right-0 bg-gray-50 rounded-t-2xl p-6 max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">الفلاتر</h2>
              <button onClick={() => setIsMobileFilterOpen(false)}>
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>
            <SidebarContent />
            <button
              onClick={() => setIsMobileFilterOpen(false)}
              className="mt-6 w-full bg-primary-600 text-white py-3 rounded-xl font-bold"
            >
              عرض {filteredProducts.length} نتيجة
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Sidebar - desktop only */}
        <div className="col-span-1 hidden md:block order-2">
          <SidebarContent />
        </div>

        {/* Product Grid */}
        <div className="col-span-1 md:col-span-3 order-1">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-20 bg-gray-50 rounded-xl border border-gray-100">
              <Search className="w-16 h-16 mx-auto mb-4 text-gray-200" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">لا توجد نتائج</h3>
              <p className="text-gray-500">
                {searchQuery ? `لا يوجد منتج يطابق "${searchQuery}"` : 'لا توجد منتجات في هذا القسم حالياً.'}
              </p>
              {(searchQuery || selectedCategory !== 'all' || priceFilter !== 'all') && (
                <button
                  onClick={() => { setSearchQuery(''); setSelectedCategory('all'); setPriceFilter('all'); }}
                  className="mt-4 text-primary-600 hover:text-primary-700 font-medium"
                >
                  مسح كل الفلاتر
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <Link key={product.id} to={`/products/${product.id}`} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col group">
                  <div className="h-48 bg-gray-100 flex items-center justify-center text-gray-400 overflow-hidden relative">
                    {product.images && product.images.length > 0 ? (
                      <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <span>بدون صورة</span>
                    )}
                    {product.discount_price && (
                      <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                        تخفيض
                      </span>
                    )}
                  </div>
                  <div className="p-4 flex flex-col flex-grow">
                    <h3 className="font-bold text-gray-900 mb-1 line-clamp-1 group-hover:text-primary-600 transition-colors">{product.name}</h3>
                    <p className="text-gray-500 text-sm mb-4 line-clamp-2 flex-grow">{product.description || 'لا يوجد وصف'}</p>
                    <div className="flex justify-between items-center mt-auto">
                      <div className="flex flex-col">
                        {product.discount_price ? (
                          <>
                            <span className="font-bold text-lg text-primary-600">{product.discount_price} د.ل</span>
                            <span className="text-sm text-gray-400 line-through">{product.price} د.ل</span>
                          </>
                        ) : (
                          <span className="font-bold text-lg text-primary-600">{product.price} د.ل</span>
                        )}
                      </div>
                      <button 
                        onClick={(e) => handleAddToCartClick(e, product)}
                        className="bg-primary-50 text-primary-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-100 transition-colors"
                      >
                        أضف للسلة
                      </button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Products;
