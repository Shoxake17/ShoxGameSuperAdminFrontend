import React, { useState, useEffect } from 'react';
import { 
  IoBatteryChargingOutline, 
  IoWifiOutline, 
  IoNotificationsOutline, 
  IoPersonCircleOutline 
} from 'react-icons/io5';
import { useAuth } from '../context/AuthContext';

const Header: React.FC = () => {
  const { user } = useAuth();
  const [time, setTime] = useState(new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }));

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }));
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="h-20 bg-[#091020]/40 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-10 sticky top-0 z-50">
      {/* Search / Title */}
      <div className="flex items-center gap-6">
        <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 tracking-tighter">
          Boshqaruv Panel
        </h2>
      </div>

      {/* Stats & User */}
      <div className="flex items-center gap-6">
       

        {/* Time */}
        <div className="text-white font-black text-lg tracking-widest bg-white/5 px-4 py-2 rounded-2xl border border-white/5">
          {time}
        </div>

        {/* Notifications */}
        <button className="w-12 h-12 bg-white/5 hover:bg-white/10 rounded-2xl flex items-center justify-center text-gray-400 transition-all border border-white/5 shadow-lg group">
          <IoNotificationsOutline size={22} className="group-active:scale-90 transition-transform" />
          <div className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 border-2 border-[#091020] rounded-full"></div>
        </button>

        {/* Profile */}
        <div className="flex items-center gap-3 pl-2 group cursor-pointer">
         
         
        </div>
      </div>
    </header>
  );
};

export default Header;
