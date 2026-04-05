import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Menu from './pages/Menu';
import { useAuth } from './context/AuthContext';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#091020]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // Agar user yo'q bo'lsa, ShoxPayFrontend ga login uchun yuboramiz
  if (!user) {
    window.location.href = `${import.meta.env.VITE_SHOXPAY_APP_URL}/login`;
    return null;
  }

  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Menu />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;