import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

// Request Cache (outside component)
const dashboardCache = { time: 0, data: null };
const CACHE_TIME = 2000;
import { 
  IoStatsChartOutline, 
  IoPeopleOutline, 
  IoWalletOutline, 
  IoReceiptOutline, 
  IoTrendingUpOutline,
  IoShieldCheckmarkOutline,
  IoArrowUpCircleOutline,
  IoDocumentTextOutline,
  IoFileTrayFullOutline
} from 'react-icons/io5';

const API_URL = `${import.meta.env.VITE_BACKEND_URL}/api/admin/stats`;

interface Stats {
  totalUsers: number;
  totalAdmins: number;
  totalBalance: number;
  totalTransactions: number;
  totalClubs: number;
  totalPcs: number;
  avgBalance: number;
}

const StatCard = ({ icon, title, value, subValue, gradient, iconColor }: any) => (
  <div className={`relative overflow-hidden bg-gradient-to-br ${gradient} p-8 rounded-[2.5rem] shadow-2xl border border-white/5 transition-transform hover:scale-[1.02] duration-300 group`}>
    <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform"></div>
    <div className="relative z-10 flex flex-col justify-between h-full min-h-[140px]">
      <div className={`w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center ${iconColor} shadow-lg backdrop-blur-md`}>
        {icon}
      </div>
      <div className="mt-6">
        <h4 className="text-white/60 text-xs font-bold uppercase tracking-widest mb-1">{title}</h4>
        <div className="flex items-end gap-3">
          <p className="text-white text-4xl font-black tracking-tighter">{value}</p>
          <span className="text-white/40 text-sm font-bold mb-1 italic">ta</span>
        </div>
        {subValue && <p className="text-white/60 text-[10px] font-bold mt-2 flex items-center gap-1">
          <IoArrowUpCircleOutline className="text-white" /> {subValue}
        </p>}
      </div>
    </div>
  </div>
);

const QuickAction = ({ icon, label }: { icon: React.ReactNode; label: string }) => (
  <div className="flex flex-col items-center gap-3 p-6 bg-[#12192c] hover:bg-[#1a233c] rounded-[2rem] border border-white/5 transition-all cursor-pointer shadow-lg active:scale-95 group">
    <div className="text-3xl text-blue-400 group-hover:scale-110 transition-transform">{icon}</div>
    <span className="text-white font-bold text-xs uppercase tracking-wider">{label}</span>
  </div>
);

const Dashboard: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const hasFetched = useRef(false);

  const fetchStats = async () => {
    // 🛡️ DEDUPLICATION GUARD
    const now = Date.now();
    if (dashboardCache.data && (now - dashboardCache.time) < CACHE_TIME) {
      console.log('🛡️  STATS keshdan olindi');
      setStats(dashboardCache.data);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(API_URL, {
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
      const data = await res.json();
      if (data.success) {
        dashboardCache.time = Date.now();
        dashboardCache.data = data.data;
        setStats(data.data);
      }
    } catch (err) {
      setError('Statistikalarni yuklashda xatolik');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser?.role === 'super-admin') {
      fetchStats();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.role]); // Faqat rol o'zgarganda yuklanadi (loopingni oldini oladi)

  if (currentUser?.role !== 'super-admin') {
    return <div className="text-white p-10 text-center font-black">RUXSAT YO'Q</div>;
  }

  return (
    <div className="p-10 animate-fadeIn">
      {loading ? (
        <div className="flex justify-center items-center h-[60vh]">
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 border-8 border-blue-500/20 rounded-full"></div>
            <div className="absolute inset-0 border-8 border-t-blue-500 rounded-full animate-spin shadow-lg"></div>
          </div>
        </div>
      ) : error ? (
        <div className="bg-red-500/10 border border-red-500/20 p-10 rounded-[3rem] text-red-400 text-center font-bold shadow-2xl">
          {error}
        </div>
      ) : stats ? (
        <div className="max-w-[1200px] mx-auto space-y-10">
          
          {/* Main Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <StatCard 
              icon={<IoDocumentTextOutline size={28} />} 
              title="Umumiy Computer Club" 
              value={stats.totalClubs} 
              subValue="Ro'yxatdan o'tgan klublar"
              gradient="from-orange-500 to-green-500"
              iconColor="text-white"
            />
            <StatCard 
              icon={<IoFileTrayFullOutline size={28} />} 
              title="Umumiy Computerlar soni" 
              value={stats.totalPcs} 
              subValue="Barcha klublardagi jami PC"
              gradient="from-indigo-600 to-purple-500"
              iconColor="text-white"
            />
          </div>

          {/* Quick Actions Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
            <QuickAction icon={<span className="font-black">$</span>} label="Sotuvlar" />
            <QuickAction icon={<IoStatsChartOutline />} label="QR Skaner" />
            <QuickAction icon={<IoWalletOutline />} label="To'lov" />
            <QuickAction icon={<IoTrendingUpOutline />} label="Hisobot" />
            <QuickAction icon={<IoPeopleOutline />} label="Chat" />
          </div>

         

        </div>
      ) : null}
    </div>
  );
};

export default Dashboard;
