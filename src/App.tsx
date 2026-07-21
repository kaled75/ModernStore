import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import AdminLayout from './components/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';
import DialogContainer from './components/DialogContainer';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import About from './pages/About';
import Contact from './pages/Contact';
import TextPage from './pages/TextPage';
import AdminDashboard from './pages/admin/Dashboard';
import AdminOrders from './pages/admin/Orders';
import AdminSettings from './pages/admin/Settings';
import Login from './pages/admin/Login';

const App = () => {
  return (
    <Router>
      <DialogContainer />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="products" element={<Products />} />
          <Route path="products/:id" element={<ProductDetail />} />
          <Route path="cart" element={<Cart />} />
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
          <Route path="faq" element={<TextPage title="الأسئلة الشائعة" settingKey="faq_text" />} />
          <Route path="shipping" element={<TextPage title="سياسة الشحن" settingKey="shipping_text" />} />
          <Route path="returns" element={<TextPage title="سياسة الاسترجاع" settingKey="returns_text" />} />
        </Route>

        {/* Admin Login */}
        <Route path="/admin/login" element={<Login />} />

        {/* Protected Admin Routes */}
        <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/admin/products" replace />} />
          <Route path="products" element={<AdminDashboard />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="*" element={<div className="p-8 text-center text-gray-500">هذه الصفحة قيد التطوير</div>} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
