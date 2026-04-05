import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

// ─── REQUEST DEDUPLICATION CACHE ───
// Modul darajasida (re-renderdan tashqarida) kesh yaratamiz
const requestCache: Record<string, { time: number, data: any }> = {};
const CACHE_TIME = 2000; // 2 soniya davomida bir xil so'rovni bloklaymiz

interface Transaction {
  _id?: string;
  type: string;
  amount: number;
  receipt_id?: string;
  store_name?: string;
  description?: string;
  created_at: string;
}

interface User {
  _id: string;
  firstName: string;
  lastName?: string;
  email: string;
  avatar?: string;
  picture?: string;
  cardNumber?: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  balance: number;
  transactions: Transaction[];
  loading: boolean;
  login: (userData: User, token: string) => void;
  logout: () => void;
  refreshData: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [balance, setBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState<Socket | null>(null);
  const isRefreshing = useRef(false);
  const hasInitialData = useRef(false);
  const isConsuming = useRef(false);
  const SHOXPAY_BACKEND = import.meta.env.VITE_BACKEND_URL;

  const refreshData = useCallback(async () => {
    const cacheKey = 'wallet_data'; 

    // Keshni tekshirish
    if (requestCache[cacheKey] && (Date.now() - requestCache[cacheKey].time < CACHE_TIME)) {
      const cachedData = requestCache[cacheKey].data;
      setBalance(cachedData.balance ?? 0);
      setTransactions(cachedData.transactions ?? []);
      return;
    }

    try {
      let res = await fetch(`${SHOXPAY_BACKEND}/api/cashback/wallet`, {
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Cookie yuborish uchun shart
      });
      let data = await res.json();

      // Token muddati tugagan bo'lsa, refresh qilib ko'ramiz
      if (!data.success && data.code === 'TOKEN_EXPIRED') {
        const refreshRes = await fetch(`${SHOXPAY_BACKEND}/api/auth/refresh`, {
          method: 'POST',
          credentials: 'include'
        });
        const refreshDataResult = await refreshRes.json();
        if (refreshDataResult.success) {
          // So'rovni qayta yuboramiz
          res = await fetch(`${SHOXPAY_BACKEND}/api/cashback/wallet`, {
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
          });
          data = await res.json();
        }
      }

      if (data.success) {
        // Keshga saqlash
        requestCache[cacheKey] = { time: Date.now(), data };
        
        setBalance(data.balance ?? 0);
        setTransactions(data.transactions ?? []);
        
        if (data.cardNumber) {
          setUser(prev => {
            if (!prev || prev.cardNumber === data.cardNumber) return prev;
            const updated = { ...prev, cardNumber: data.cardNumber };
            localStorage.setItem('user', JSON.stringify(updated));
            return updated;
          });
        }
      }
    } catch (e) {
      console.warn('[AuthContext Refresh Error]', e);
    } finally {
      setLoading(false);
    }
  }, [SHOXPAY_BACKEND]);

  useEffect(() => {
    // StrictMode'da 2 marta ulanishni oldini olish
    if (socket) return; 

    const newSocket = io(SHOXPAY_BACKEND);
    setSocket(newSocket);

    newSocket.on('balance-updated', ({ balance: newBalance }) => {
      setBalance(newBalance);
    });

    newSocket.on('role-changed', ({ newRole }) => {
      setUser(prev => prev ? { ...prev, role: newRole } : null);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (socket && user) {
      socket.emit('join-user', user._id);
    }
  }, [socket, user?._id]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlUser = params.get('user');

    // 1. URL dan ma'lumot kelsa (Eski usul yoki o'tish)
    if (urlUser) {
      try {
        const decodedUser = JSON.parse(decodeURIComponent(urlUser));
        setUser(decodedUser);
        window.history.replaceState({}, document.title, window.location.pathname);
        refreshData();
        return;
      } catch (e) {
        console.error('URL Data Error', e);
      }
    }

    // 2. Cookie orqali tekshirish
    if (!user && !hasInitialData.current) {
      const checkAuth = async () => {
        try {
          console.log('🔍 [SuperAdmin Auth] Cookie orqali tekshirilmoqda...');
          let res = await fetch(`${SHOXPAY_BACKEND}/api/auth/me`, {
            credentials: 'include'
          });
          let data = await res.json();

          // Token muddati tugagan bo'lsa, refresh qilib ko'ramiz
          if (!data.success && data.code === 'TOKEN_EXPIRED') {
            const refreshRes = await fetch(`${SHOXPAY_BACKEND}/api/auth/refresh`, {
              method: 'POST',
              credentials: 'include'
            });
            const refreshDataResult = await refreshRes.json();
            if (refreshDataResult.success) {
              // Me endpointini qayta chaqiramiz
              res = await fetch(`${SHOXPAY_BACKEND}/api/auth/me`, {
                credentials: 'include'
              });
              data = await res.json();
            }
          }

          if (data.success && data.data) {
            setUser(data.data);
            console.log('✅ [SuperAdmin Auth] Cookie orqali tanib olindi');
            refreshData();
          } else {
            setLoading(false);
          }
        } catch (e) {
          setLoading(false);
        }
      };
      checkAuth();
      return;
    }
  }, [refreshData, user]);

  const login = (userData: User) => {
    setUser(userData);
    refreshData();
  };

  const logout = () => {
    localStorage.clear();
    sessionStorage.clear();
    setUser(null);
    setBalance(0);
    setTransactions([]);
    // Logout bo'lganda asosiy kirish nuqtasiga yuboramiz
    window.location.href = `${import.meta.env.VITE_SHOXPAY_APP_URL}/login`;
  };

  return (
    <AuthContext.Provider value={{ user, balance, transactions, loading, login, logout, refreshData }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

