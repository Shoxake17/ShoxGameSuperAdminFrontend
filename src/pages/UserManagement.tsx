import React, { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';

// Request Cache (outside component)
const usersCache = { time: 0, data: null };
const CACHE_TIME = 2000;
import { IoShieldCheckmarkOutline, IoPersonOutline, IoSettingsOutline, IoClose, IoAddCircleOutline, IoLocationOutline, IoCallOutline, IoDesktopOutline } from 'react-icons/io5';

const API_URL = `${import.meta.env.VITE_BACKEND_URL}/api/admin`;
const CLUB_API_URL = `${import.meta.env.VITE_BACKEND_URL}/api/clubs`;

interface UserItem {
  _id: string;
  firstName: string;
  lastName?: string;
  email: string;
  role: 'user' | 'admin' | 'super-admin';
  isActive: boolean;
}

const UserManagement: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [filter, setFilter] = useState<'all' | 'user' | 'admin' | 'super-admin'>('all');
  const hasFetched = useRef(false);

  // Modal holati
  const [showClubModal, setShowClubModal] = useState(false);
  const [isEditingClub, setIsEditingClub] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<UserItem | null>(null);
  const [clubData, setClubData] = useState({
    name: '',
    address: '',
    pcCount: '',
    phone: ''
  });

  const fetchUsers = async () => {
    // 🛡️ DEDUPLICATION GUARD
    const now = Date.now();
    if (usersCache.data && (now - usersCache.time) < CACHE_TIME) {
      console.log('🛡️  USERS keshdan olindi');
      setUsers(usersCache.data);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/users`, {
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
      const data = await res.json();
      if (data.success) {
        usersCache.time = Date.now();
        usersCache.data = data.data;
        setUsers(data.data);
      }
    } catch (err) {
      setError('Foydalanuvchilarni yuklashda xatolik');
    } finally {
      setLoading(false);
    }
  };

  const fetchAdminClub = async (adminId: string) => {
    try {
      const res = await fetch(`${CLUB_API_URL}/admin/${adminId}`, {
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
      const data = await res.json();
      if (data.success && data.data) {
        setClubData({
          name: data.data.name || '',
          address: data.data.address || '',
          pcCount: String(data.data.pcCount || ''),
          phone: data.data.phone || ''
        });
        setIsEditingClub(true);
      } else {
        setClubData({ name: '', address: '', pcCount: '', phone: '' });
        setIsEditingClub(false);
      }
    } catch (err) {
      setClubData({ name: '', address: '', pcCount: '', phone: '' });
      setIsEditingClub(false);
    }
  };

  const handleAdminClick = (admin: UserItem) => {
    setSelectedAdmin(admin);
    fetchAdminClub(admin._id);
    setShowClubModal(true);
  };

  useEffect(() => {
    if (currentUser?.role === 'super-admin' || currentUser?.role === 'admin') {
      fetchUsers();
    }

    // Socket ulanishi
    const socket = io(import.meta.env.VITE_BACKEND_URL);
    
    socket.on('user-role-updated', ({ userId, newRole }: { userId: string, newRole: any }) => {
      console.log('👤 Foydalanuvchi roli yangilandi (Real-time)');
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, role: newRole } : u));
    });

    return () => {
      socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.role]);

  const handleAddClub = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAdmin) return;

    const url = isEditingClub ? `${CLUB_API_URL}/admin/${selectedAdmin._id}` : `${CLUB_API_URL}/create`;
    const method = isEditingClub ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method: method,
        headers: { 
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          ...clubData,
          pcCount: Number(clubData.pcCount),
          adminId: selectedAdmin._id
        })
      });
      const data = await res.json();
      if (data.success) {
        alert(isEditingClub ? 'Computer Club muvaffaqiyatli yangilandi' : 'Computer Club muvaffaqiyatli qo\'shildi');
        setShowClubModal(false);
        setClubData({ name: '', address: '', pcCount: '', phone: '' });
      } else {
        alert(data.message);
      }
    } catch {
      alert('Xatolik yuz berdi');
    }
  };

  const changeRole = async (userId: string, newRole: string) => {
    if (isUpdating) return;
    setIsUpdating(true);

    try {
      const res = await fetch(`${API_URL}/update-role`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ userId, newRole })
      });
      const data = await res.json();
      if (data.success) {
        setUsers(prev => prev.map(u => u._id === userId ? { ...u, role: newRole as any } : u));
      } else {
        alert(data.message);
      }
    } catch {
      alert('Xatolik yuz berdi');
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredUsers = users.filter(u => filter === 'all' ? true : u.role === filter);

  if (currentUser?.role !== 'super-admin' && currentUser?.role !== 'admin') {
    return <div className="text-white p-10 text-center">Ruxsat yo'q</div>;
  }

  return (
    <div className="p-10 animate-fadeIn">
      <div className="max-w-[1200px] mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-6">
          <div>
            <h2 className="text-3xl font-black text-white tracking-tight">Foydalanuvchilar</h2>
            <p className="text-blue-400/60 text-xs font-bold uppercase tracking-widest mt-1">Tizim a'zolarini boshqarish</p>
          </div>
          
          {/* Filter UI */}
          <div className="flex items-center gap-2 bg-white/5 p-1.5 rounded-2xl border border-white/5">
            {(['all', 'user', 'admin', 'super-admin'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  filter === f 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                    : 'text-white/40 hover:text-white/60'
                }`}
              >
                {f === 'all' ? 'Hammasi' : 
                 f === 'user' ? 'Foydalanuvchi' : 
                 f === 'admin' ? 'Admin' : 'Super Admin'}
              </button>
            ))}
          </div>

          <div className="bg-white/5 px-6 py-3 rounded-2xl border border-white/5 text-white font-bold text-sm">
            Jami: {filteredUsers.length} ta
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center p-20">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-[2rem] text-red-400 text-center">
            {error}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUsers.map((user) => (
              <div 
                key={user._id} 
                onClick={() => {
                  if (user.role === 'admin') {
                    handleAdminClick(user);
                  }
                }}
                className={`bg-[#12192c] p-6 rounded-[2.5rem] border border-white/5 shadow-xl transition-all group relative overflow-hidden ${
                  user.role === 'admin' ? 'cursor-pointer hover:bg-[#1a233c] hover:border-blue-500/30' : ''
                }`}
              >
                <div className="absolute -right-4 -top-4 w-20 h-20 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-all"></div>
                
                <div className="flex justify-between items-start mb-6 relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-500/20">
                      {user.firstName[0].toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-white font-black text-lg tracking-tight leading-none">{user.firstName} {user.lastName || ''}</h4>
                      <p className="text-white/40 text-[10px] font-bold mt-1 uppercase tracking-tighter">{user.email}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5 relative z-10">
                  <div className={`text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest ${
                    user.role === 'super-admin' ? 'bg-purple-500/20 text-purple-400' : 
                    user.role === 'admin' ? 'bg-blue-500/20 text-blue-400' : 'bg-white/5 text-white/40'
                  }`}>
                    {user.role}
                  </div>

                  <div className="flex items-center gap-3">
                    {user.role === 'admin' && (
                      <div className="flex items-center gap-2 text-blue-400/60 text-[9px] font-bold uppercase tracking-widest">
                        <IoAddCircleOutline size={14} />
                        Club boshqaruvi
                      </div>
                    )}

                    {currentUser.role === 'super-admin' && user.role !== 'super-admin' && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          changeRole(user._id, user.role === 'admin' ? 'user' : 'admin');
                        }}
                        disabled={isUpdating}
                        className="text-[10px] font-black uppercase tracking-widest text-blue-400 hover:text-white transition-colors disabled:opacity-50 px-2 py-1 bg-white/5 rounded-lg border border-white/5 hover:bg-white/10"
                      >
                        {user.role === 'admin' ? 'User qilish' : 'Admin qilish'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Club Modal */}
        {showClubModal && selectedAdmin && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-md bg-black/40 animate-fadeIn">
            <div className="bg-[#12192c] w-full max-w-md rounded-[3rem] border border-white/10 shadow-2xl overflow-hidden relative">
              <button 
                onClick={() => setShowClubModal(false)}
                className="absolute right-8 top-8 text-white/40 hover:text-white transition-colors"
              >
                <IoClose size={24} />
              </button>

              <div className="p-10">
                <div className="mb-8">
                  <h3 className="text-2xl font-black text-white tracking-tight italic">
                    CLUB <span className="text-blue-400">{isEditingClub ? 'TAHRIRLASH' : 'QO\'SHISH'}</span>
                  </h3>
                  <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mt-1">
                    Admin: {selectedAdmin.firstName} {selectedAdmin.lastName}
                  </p>
                </div>

                <form onSubmit={handleAddClub} className="space-y-4">
                  <div className="relative group">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-blue-400 transition-colors">
                      <IoSettingsOutline size={20} />
                    </div>
                    <input 
                      type="text" 
                      placeholder="Klub nomi"
                      value={clubData.name}
                      onChange={e => setClubData({...clubData, name: e.target.value})}
                      className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-14 pr-6 text-white text-sm font-bold focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all"
                      required
                    />
                  </div>

                  <div className="relative group">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-blue-400 transition-colors">
                      <IoLocationOutline size={20} />
                    </div>
                    <input 
                      type="text" 
                      placeholder="Manzil"
                      value={clubData.address}
                      onChange={e => setClubData({...clubData, address: e.target.value})}
                      className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-14 pr-6 text-white text-sm font-bold focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative group">
                      <div className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-blue-400 transition-colors">
                        <IoDesktopOutline size={20} />
                      </div>
                      <input 
                        type="number" 
                        placeholder="PC Soni"
                        value={clubData.pcCount}
                        onChange={e => setClubData({...clubData, pcCount: e.target.value})}
                        className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-14 pr-6 text-white text-sm font-bold focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all"
                        required
                      />
                    </div>
                    <div className="relative group">
                      <div className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-blue-400 transition-colors">
                        <IoCallOutline size={20} />
                      </div>
                      <input 
                        type="tel" 
                        placeholder="Telefon"
                        value={clubData.phone}
                        onChange={e => setClubData({...clubData, phone: e.target.value})}
                        className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-14 pr-6 text-white text-sm font-bold focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all"
                        required
                      />
                    </div>
                  </div>

                  <button 
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-900/20 transition-all active:scale-[0.98] mt-4"
                  >
                    {isEditingClub ? 'Klubni Yangilash' : 'Klubni Saqlash'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;
