import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, Settings, LogOut, Store, Package } from 'lucide-react';
import { supabase } from '../lib/supabase';

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const navigation = [
    { name: 'المنتجات', href: '/admin/products', icon: ShoppingBag },
    { name: 'الطلبات', href: '/admin/orders', icon: Package },
    { name: 'الإعدادات', href: '/admin/settings', icon: Settings },
  ];

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex" dir="rtl">
      {/* Sidebar - Desktop */}
      <div className="w-64 bg-white border-l border-gray-200 flex flex-col hidden md:flex flex-shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <Store className="w-6 h-6 text-primary-600 ml-2" />
          <span className="text-xl font-bold text-gray-900">إدارة المتجر</span>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className={`w-5 h-5 ml-3 ${isActive ? 'text-primary-600' : 'text-gray-400'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <Link
            to="/"
            className="flex w-full items-center px-4 py-3 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-50 transition-colors mb-1"
          >
            <LayoutDashboard className="w-5 h-5 ml-3 text-gray-400" />
            عرض المتجر
          </Link>
          <button
            onClick={handleLogout}
            className="flex w-full items-center px-4 py-3 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer outline-none"
          >
            <LogOut className="w-5 h-5 ml-3 text-red-500" />
            تسجيل الخروج
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Mobile Header */}
        <div className="md:hidden h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 flex-shrink-0">
          <div className="flex items-center">
            <Store className="w-5 h-5 text-primary-600 ml-2" />
            <span className="text-base font-bold text-gray-900">إدارة المتجر</span>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/" className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
              <LayoutDashboard className="w-5 h-5" />
            </Link>
            <button onClick={handleLogout} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors outline-none">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile Bottom Navigation */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 flex">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex-1 flex flex-col items-center py-3 text-xs font-medium transition-colors ${
                  isActive ? 'text-primary-600' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className={`w-5 h-5 mb-1 ${isActive ? 'text-primary-600' : 'text-gray-400'}`} />
                {item.name}
              </Link>
            );
          })}
        </div>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-20 md:pb-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
