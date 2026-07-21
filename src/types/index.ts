export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  discount_price: number | null;
  category_id: string | null;
  brand: string | null;
  sku: string | null;
  images: string[];
  sizes?: string[];
  colors?: string[];
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
}

export interface CartItem extends Product {
  cartItemId: string; // Unique ID for the cart item, combining product id + size + color
  quantity: number;
  selected_size?: string;
  selected_color?: string;
}

export interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_city: string;
  customer_address: string;
  total_amount: number;
  status: string;
  created_at: string;
  items?: OrderItem[];
}

export interface Widget {
  id: string;
  type: 'price_filter' | 'custom_text' | 'banner' | 'social_media';
  title: string;
  content: string | null;
  is_active: boolean;
  order_index: number;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
  selected_size?: string;
  selected_color?: string;
  product?: Product;
}
