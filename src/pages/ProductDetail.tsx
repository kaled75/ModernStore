import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { Product } from '../types';
import { useCartStore } from '../store/useCartStore';
import { useDialogStore } from '../store/useDialogStore';
import { ArrowRight, ShoppingCart } from 'lucide-react';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const addItem = useCartStore((state) => state.addItem);

  const [selectedImage, setSelectedImage] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        if (data) {
          setProduct(data);
          if (data.images && data.images.length > 0) {
            setSelectedImage(data.images[0]);
          }
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      setError('يرجى اختيار المقاس قبل الإضافة للسلة');
      return;
    }
    if (product.colors && product.colors.length > 0 && !selectedColor) {
      setError('يرجى اختيار اللون قبل الإضافة للسلة');
      return;
    }
    
    setError('');
    addItem(product, 1, selectedSize, selectedColor);
    useDialogStore.getState().showAlert('تم إضافة المنتج للسلة بنجاح!', 'success');
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex justify-center items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[60vh] flex flex-col justify-center items-center text-center px-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">المنتج غير متوفر</h2>
        <p className="text-gray-600 mb-8">عذراً، لم نتمكن من العثور على المنتج المطلوب.</p>
        <Link to="/products" className="bg-primary-600 text-white px-6 py-3 rounded-full font-medium hover:bg-primary-700 transition-colors">
          العودة للتسوق
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link to="/products" className="inline-flex items-center text-gray-500 hover:text-primary-600 mb-8 transition-colors">
        <ArrowRight className="w-4 h-4 ml-2" />
        العودة للمنتجات
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="bg-gray-100 rounded-2xl overflow-hidden aspect-square flex items-center justify-center border border-gray-100">
            {selectedImage ? (
              <img src={selectedImage} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-gray-400">لا توجد صورة</span>
            )}
          </div>
          
          {product.images && product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-4">
              {product.images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(img)}
                  className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${selectedImage === img ? 'border-primary-600 opacity-100' : 'border-transparent opacity-70 hover:opacity-100'}`}
                >
                  <img src={img} alt={`${product.name} ${index + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="flex flex-col">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">{product.name}</h1>
          
          <div className="flex items-center mb-6">
            {product.discount_price ? (
              <div className="flex items-center gap-4">
                <span className="text-3xl font-bold text-primary-600">{product.discount_price} د.ل</span>
                <span className="text-xl text-gray-400 line-through">{product.price} د.ل</span>
                <span className="bg-red-100 text-red-700 text-sm font-bold px-3 py-1 rounded-full">تخفيض!</span>
              </div>
            ) : (
              <span className="text-3xl font-bold text-primary-600">{product.price} د.ل</span>
            )}
          </div>

          <div className="prose prose-blue text-gray-600 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">وصف المنتج:</h3>
            <p className="whitespace-pre-line">{product.description || 'لا يوجد وصف متاح لهذا المنتج.'}</p>
          </div>

          {/* Options: Sizes */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">اختر المقاس:</h3>
              <div className="flex flex-wrap gap-3">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => { setSelectedSize(size); setError(''); }}
                    className={`min-w-[3rem] px-4 py-2 rounded-lg font-medium border-2 transition-all ${selectedSize === size ? 'border-primary-600 bg-primary-50 text-primary-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Options: Colors */}
          {product.colors && product.colors.length > 0 && (
            <div className="mb-8">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">اختر اللون:</h3>
              <div className="flex flex-wrap gap-3">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => { setSelectedColor(color); setError(''); }}
                    className={`px-5 py-2 rounded-lg font-medium border-2 transition-all ${selectedColor === color ? 'border-primary-600 bg-primary-50 text-primary-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div className="mb-4 text-red-600 font-medium bg-red-50 p-3 rounded-lg border border-red-100">
              {error}
            </div>
          )}

          <div className="border-t border-gray-100 pt-8 mt-auto">
            <button
              onClick={handleAddToCart}
              className="w-full bg-primary-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-primary-700 transition-colors flex items-center justify-center gap-3"
            >
              <ShoppingCart className="w-6 h-6" />
              إضافة إلى السلة
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
