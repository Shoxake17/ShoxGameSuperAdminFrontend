import React from 'react';
import { 
  IoGridOutline, 
  IoPeopleOutline, 
  IoAddOutline, 
  IoCubeOutline, 
  IoCartOutline, 
  IoWalletOutline, 
  IoStatsChartOutline, 
  IoArchiveOutline, 
  IoCardOutline, 
  IoChatbubbleEllipsesOutline, 
  IoSettingsOutline,
  IoLogOutOutline,
  IoMenuOutline
} from 'react-icons/io5';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  activeTab: 'stats' | 'users' | 'clubs';
  setActiveTab: (tab: 'stats' | 'users' | 'clubs') => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { logout } = useAuth();

  const menuItems = [
    { id: 'stats', label: 'Boshqaruv Paneli', icon: <IoGridOutline />, role: 'super-admin' },
    { id: 'users', label: 'Foydalanuvchilar', icon: <IoPeopleOutline />, role: 'super-admin' },
    { id: 'clubs', label: 'Computer Klublar', icon: <IoArchiveOutline />, role: 'super-admin' },
    { id: 'ai', label: 'AI Yordamchi', icon: <IoChatbubbleEllipsesOutline />, role: 'super-admin' },
    { id: 'settings', label: 'Sozlamalar', icon: <IoSettingsOutline />, role: 'all' },
  ];

  return (
    <div className="w-64 h-screen bg-[#091020] border-r border-white/5 flex flex-col fixed left-0 top-0 z-[100]">
      {/* Logo */}
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
            <IoStatsChartOutline className="text-white text-lg" />
          </div>
          <h1 className="text-white font-bold text-lg tracking-tight italic">
            Shox<span className="text-blue-400">Super</span>Admin
          </h1>
        </div>
        <button className="text-gray-500 hover:text-white transition-colors">
          <IoMenuOutline size={20} />
        </button>
      </div>

      {/* Menu */}
      <nav className="flex-1 px-4 mt-4 space-y-1 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => (item.id === 'stats' || item.id === 'users' || item.id === 'clubs') && setActiveTab(item.id as any)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
              activeTab === item.id 
                ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-white border border-white/5 shadow-lg' 
                : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
            } ${item.role === 'pos' ? 'opacity-40 cursor-not-allowed' : ''}`}
          >
            <span className={`text-xl ${activeTab === item.id ? 'text-blue-400' : 'group-hover:text-gray-300'}`}>
              {item.icon}
            </span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/5">
        <button 
          onClick={() => { logout(); window.location.href = '/'; }}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all duration-200"
        >
          <IoLogOutOutline size={20} />
          <span>Chiqish</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
