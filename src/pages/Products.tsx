import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { Product, Widget } from '../types';
import { useCartStore } from '../store/useCartStore';
import { useDialogStore } from '../store/useDialogStore';
import { Facebook, Twitter, Instagram, Youtube, Linkedin } from 'lucide-react';

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

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [loading, setLoading] = useState(true);
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
        const [productsRes, widgetsRes] = await Promise.all([
          supabase.from('products').select('*').order('created_at', { ascending: false }),
          supabase.from('store_widgets').select('*').eq('is_active', true).order('order_index')
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
      } catch (error) {
        console.error('Unexpected error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">جميع المنتجات</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Sidebar Filters - Order 2 (Left in RTL) */}
        <div className="col-span-1 hidden md:block order-2">
          <div className="space-y-6">
            {widgets.map((widget) => (
              <div key={widget.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold mb-4">{widget.title}</h3>
                
                {widget.type === 'price_filter' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="flex items-center gap-2">
                        <input type="checkbox" className="rounded text-primary-600 focus:ring-primary-500" />
                        <span className="text-gray-600">أقل من 50 د.ل</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="checkbox" className="rounded text-primary-600 focus:ring-primary-500" />
                        <span className="text-gray-600">50 د.ل - 100 د.ل</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="checkbox" className="rounded text-primary-600 focus:ring-primary-500" />
                        <span className="text-gray-600">أكثر من 100 د.ل</span>
                      </label>
                    </div>
                  </div>
                )}

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
            
            {widgets.length === 0 && (
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center text-gray-500 text-sm">
                يمكنك إضافة ودجات هنا من لوحة التحكم
              </div>
            )}
          </div>
        </div>

        {/* Product Grid - Order 1 (Right in RTL) */}
        <div className="col-span-1 md:col-span-3 order-1">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 bg-gray-50 rounded-xl border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-2">لا توجد منتجات حالياً</h3>
              <p className="text-gray-500">لم يتم إضافة أي منتجات إلى قاعدة البيانات بعد.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
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
