import React, { useEffect, useState } from 'react';
import { ArrowLeft, ShoppingBag, Truck, Shield, Headphones } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { Category, Product } from '../types';
import { useCartStore } from '../store/useCartStore';
import { useDialogStore } from '../store/useDialogStore';

const Home = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const addItem = useCartStore((state) => state.addItem);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, productsRes] = await Promise.all([
          supabase.from('categories').select('*').order('name'),
          supabase.from('products').select('*').order('created_at', { ascending: false }).limit(8),
        ]);

        if (categoriesRes.data) setCategories(categoriesRes.data);
        if (productsRes.data) setFeaturedProducts(productsRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 text-sm font-medium mb-8">
              <ShoppingBag className="w-4 h-4" />
              <span>أفضل المنتجات بأفضل الأسعار</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              اكتشف أحدث
              <span className="block text-yellow-300">المنتجات العصرية</span>
            </h1>
            <p className="text-lg md:text-xl text-primary-100 mb-10 max-w-xl mx-auto">
              تسوق تشكيلتنا الواسعة من المنتجات عالية الجودة. التوصيل سريع ومجاني لجميع المناطق!
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                to="/products"
                className="bg-white text-primary-700 px-8 py-4 rounded-full font-bold hover:bg-primary-50 transition-colors flex items-center justify-center gap-2 shadow-lg"
              >
                تسوق الآن
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <Link
                to="/contact"
                className="bg-white/10 border border-white/30 backdrop-blur-sm text-white px-8 py-4 rounded-full font-medium hover:bg-white/20 transition-colors flex items-center justify-center gap-2"
              >
                تواصل معنا
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Strip */}
      <section className="bg-gray-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center flex-shrink-0">
                <Truck className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">توصيل مجاني</h3>
                <p className="text-sm text-gray-500">لجميع المناطق</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">منتجات أصلية</h3>
                <p className="text-sm text-gray-500">جودة مضمونة 100%</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                <Headphones className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">دعم على مدار الساعة</h3>
                <p className="text-sm text-gray-500">فريق خدمة عملاء متميز</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      {categories.length > 0 && (
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-10">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">تسوق حسب القسم</h2>
                <p className="text-gray-500 mt-2">اختر القسم المناسب لك</p>
              </div>
              <Link to="/products" className="text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
                عرض الكل <ArrowLeft className="w-4 h-4" />
              </Link>
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
                {categories.map((category) => (
                  <Link
                    key={category.id}
                    to={`/products?category=${category.id}`}
                    className="group block h-44 rounded-2xl overflow-hidden relative shadow-sm hover:shadow-lg transition-all duration-300"
                  >
                    {category.image_url ? (
                      <img
                        src={category.image_url}
                        alt={category.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                        <ShoppingBag className="w-10 h-10 text-primary-400" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                      <h3 className="text-lg font-bold text-white">{category.name}</h3>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">أحدث المنتجات</h2>
              <p className="text-gray-500 mt-2">اكتشف آخر ما وصل إلينا</p>
            </div>
            <Link to="/products" className="text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
              عرض الكل <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : featuredProducts.length === 0 ? (
            <div className="text-center text-gray-500 py-10 bg-white rounded-xl border border-gray-100">
              لا توجد منتجات حالياً. يمكنك إضافتها من لوحة التحكم.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
              {featuredProducts.map((product) => (
                <Link
                  key={product.id}
                  to={`/products/${product.id}`}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300 flex flex-col group"
                >
                  <div className="h-44 bg-gray-100 flex items-center justify-center text-gray-400 overflow-hidden relative">
                    {product.images && product.images.length > 0 ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <ShoppingBag className="w-12 h-12 text-gray-300" />
                    )}
                    {product.discount_price && (
                      <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                        تخفيض
                      </span>
                    )}
                  </div>
                  <div className="p-4 flex flex-col flex-grow">
                    <h3 className="font-bold text-gray-900 mb-1 line-clamp-1 text-sm group-hover:text-primary-600 transition-colors">
                      {product.name}
                    </h3>
                    <div className="flex justify-between items-center mt-auto pt-3">
                      <div>
                        {product.discount_price ? (
                          <div>
                            <span className="font-bold text-primary-600">{product.discount_price} د.ل</span>
                            <span className="text-xs text-gray-400 line-through mr-1">{product.price} د.ل</span>
                          </div>
                        ) : (
                          <span className="font-bold text-primary-600">{product.price} د.ل</span>
                        )}
                      </div>
                      <button
                        onClick={(e) => handleAddToCartClick(e, product)}
                        className="bg-primary-50 text-primary-700 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-primary-100 transition-colors"
                      >
                        أضف
                      </button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
