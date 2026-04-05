import React, { useEffect, useState } from 'react';
import { IoArchiveOutline, IoDesktopOutline, IoPlayOutline, IoStopOutline, IoChevronBackOutline, IoLocationOutline, IoCallOutline } from 'react-icons/io5';

interface Computer {
  number: number;
  type: string;
  pricePerHour: number;
  isAvailable: boolean;
}

interface Club {
  _id: string;
  name: string;
  address: string;
  pcCount: number;
  phone: string;
  admin: {
    firstName: string;
    lastName: string;
    email: string;
  };
  computers: Computer[];
  isOpen: boolean;
}

const ClubManagement: React.FC = () => {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [selectedClub, setSelectedClub] = useState<Club | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [commandLoading, setCommandLoading] = useState<string | null>(null);

  const fetchClubs = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/clubs`, {
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
      const data = await res.json();
      if (data.success) {
        setClubs(data.data);
      }
    } catch (err) {
      setError('Klublarni yuklashda xatolik');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClubs();
  }, []);

  const handleRemoteCommand = async (pcNumber: number, command: 'unlock' | 'lock') => {
    if (!selectedClub) return;
    
    const pcId = `${selectedClub._id}_${pcNumber}`;
    setCommandLoading(pcId);
    
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/remote-command`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          clubId: selectedClub._id,
          pcNumber,
          command,
          duration: 60 // Test uchun 1 daqiqa
        })
      });
      
      const data = await res.json();
      if (data.success) {
        alert(`Buyruq yuborildi: PC-${pcNumber}`);
      } else {
        alert(`Xato: ${data.message}`);
      }
    } catch (err) {
      alert('Server bilan bog\'lanishda xato');
    } finally {
      setCommandLoading(null);
    }
  };

  if (loading) return <div className="p-10 text-white">Yuklanmoqda...</div>;
  if (error) return <div className="p-10 text-red-500">{error}</div>;

  return (
    <div className="p-10 animate-fadeIn">
      {selectedClub ? (
        <div className="space-y-8">
          {/* Back Button and Header */}
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSelectedClub(null)}
              className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-white transition-all"
            >
              <IoChevronBackOutline size={24} />
            </button>
            <div>
              <h2 className="text-3xl font-black text-white">{selectedClub.name}</h2>
              <p className="text-white/40 font-medium">Kompyuterlar ro'yxati va boshqaruv</p>
            </div>
          </div>

          {/* Club Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/5 p-6 rounded-[2rem] border border-white/5 flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center text-blue-400">
                <IoLocationOutline size={24} />
              </div>
              <div>
                <p className="text-white/40 text-xs font-bold uppercase">Manzil</p>
                <p className="text-white font-bold">{selectedClub.address}</p>
              </div>
            </div>
            <div className="bg-white/5 p-6 rounded-[2rem] border border-white/5 flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-500/20 rounded-2xl flex items-center justify-center text-purple-400">
                <IoCallOutline size={24} />
              </div>
              <div>
                <p className="text-white/40 text-xs font-bold uppercase">Telefon</p>
                <p className="text-white font-bold">{selectedClub.phone}</p>
              </div>
            </div>
            <div className="bg-white/5 p-6 rounded-[2rem] border border-white/5 flex items-center gap-4">
              <div className="w-12 h-12 bg-green-500/20 rounded-2xl flex items-center justify-center text-green-400">
                <IoDesktopOutline size={24} />
              </div>
              <div>
                <p className="text-white/40 text-xs font-bold uppercase">Admin</p>
                <p className="text-white font-bold">{selectedClub.admin?.firstName} {selectedClub.admin?.lastName}</p>
              </div>
            </div>
          </div>

          {/* PC Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {selectedClub.computers.map((pc) => (
              <div key={pc.number} className="bg-[#12192c] p-6 rounded-[2.5rem] border border-white/5 flex flex-col items-center gap-4 transition-transform hover:scale-105">
                <div className={`w-16 h-16 rounded-3xl flex items-center justify-center shadow-lg ${pc.isAvailable ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                  <IoDesktopOutline size={32} />
                </div>
                <div className="text-center">
                  <p className="text-white font-black text-xl">PC-{pc.number}</p>
                  <p className="text-white/40 text-[10px] font-bold uppercase">{pc.type}</p>
                </div>
                
                <div className="flex gap-2 w-full">
                  <button 
                    onClick={() => handleRemoteCommand(pc.number, 'unlock')}
                    disabled={commandLoading === `${selectedClub._id}_${pc.number}`}
                    className="flex-1 p-3 bg-blue-500 hover:bg-blue-600 text-white rounded-2xl transition-all flex items-center justify-center disabled:opacity-50"
                    title="Unlock (Agentni ishga tushirish/test)"
                  >
                    {commandLoading === `${selectedClub._id}_${pc.number}` ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : <IoPlayOutline size={20} />}
                  </button>
                  <button 
                    onClick={() => handleRemoteCommand(pc.number, 'lock')}
                    disabled={commandLoading === `${selectedClub._id}_${pc.number}`}
                    className="flex-1 p-3 bg-red-500/20 hover:bg-red-500/40 text-red-400 rounded-2xl transition-all flex items-center justify-center disabled:opacity-50"
                    title="Lock (Qulflash)"
                  >
                    <IoStopOutline size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          <div>
            <h2 className="text-4xl font-black text-white tracking-tight">Computer Klublar</h2>
            <p className="text-white/40 font-medium">Barcha ro'yxatdan o'tgan klublar boshqaruvi</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {clubs.map((club) => (
              <div 
                key={club._id}
                onClick={() => setSelectedClub(club)}
                className="group relative bg-[#12192c] p-8 rounded-[3rem] border border-white/5 hover:border-blue-500/30 transition-all cursor-pointer shadow-xl overflow-hidden"
              >
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl group-hover:scale-150 transition-transform"></div>
                
                <div className="relative z-10 space-y-6">
                  <div className="flex justify-between items-start">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-[1.5rem] flex items-center justify-center text-white shadow-lg">
                      <IoDesktopOutline size={32} />
                    </div>
                    <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${club.isOpen ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                      {club.isOpen ? 'OCHIQ' : 'Yopiq'}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-2xl font-black text-white group-hover:text-blue-400 transition-colors">{club.name}</h3>
                    <p className="text-white/40 text-sm font-medium flex items-center gap-1 mt-1">
                      <IoLocationOutline /> {club.address}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <div className="flex flex-col">
                      <span className="text-white/30 text-[10px] font-bold uppercase">Kompyuterlar</span>
                      <span className="text-white font-black text-xl">{club.pcCount} ta</span>
                    </div>
                    <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-white/40 group-hover:bg-blue-500 group-hover:text-white transition-all">
                      <IoChevronBackOutline className="rotate-180" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ClubManagement;