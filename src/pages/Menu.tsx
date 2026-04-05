import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import Dashboard from '../pages/Dashboard';
import UserManagement from '../pages/UserManagement';
import ClubManagement from '../pages/ClubManagement';
import { useAuth } from '../context/AuthContext';

const Menu = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'stats' | 'users' | 'clubs'>('stats');

  if (user?.role !== 'super-admin') {
    return (
      <div className="min-h-screen bg-[#06060f] text-white flex items-center justify-center p-10 text-center font-sans">
        <div className="bg-red-500/10 border border-red-500/20 p-10 rounded-[3rem] shadow-2xl">
          <h2 className="text-3xl font-black mb-4 tracking-tight">RUXSAT YO'Q</h2>
          <p className="text-gray-500 font-medium">Sizda Super Admin huquqi mavjud emas.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#06060f] font-sans selection:bg-blue-500 selection:text-white flex overflow-hidden">
      
      {/* ShoxPosPro Style Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <div className="flex-1 ml-64 flex flex-col h-screen overflow-hidden">
        
        {/* ShoxPosPro Style Header */}
        <Header />

        {/* Dynamic Content Scroll Area */}
        <main className="flex-1 overflow-y-auto custom-scrollbar bg-[#06060f]">
          {activeTab === 'stats' ? (
            <Dashboard />
          ) : activeTab === 'users' ? (
            <UserManagement />
          ) : (
            <ClubManagement />
          )}
        </main>
      </div>

      {/* Global CSS for custom scrollbar and animations */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.1);
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default Menu;
