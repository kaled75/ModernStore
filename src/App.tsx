import React from 'react';

const App = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      <div className="max-w-2xl text-center space-y-6">
        <h1 className="text-5xl font-bold text-gray-900">ModernStore</h1>
        <p className="text-xl text-gray-600">
          Your scalable, modern e-commerce platform is ready! 🚀
        </p>
        <div className="flex gap-4 justify-center pt-8">
          <div className="p-6 bg-blue-50 rounded-xl">
            <h3 className="font-bold text-blue-900 mb-2">1. GitHub Pages Ready</h3>
            <p className="text-blue-800 text-sm">Configured with GitHub Actions for instant deployment.</p>
          </div>
          <div className="p-6 bg-green-50 rounded-xl">
            <h3 className="font-bold text-green-900 mb-2">2. Supabase Ready</h3>
            <p className="text-green-800 text-sm">Schema and RLS policies included in supabase folder.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
