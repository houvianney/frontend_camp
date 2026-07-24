import { createContext, useContext, useState, ReactNode, useEffect, useRef } from 'react';
import { api } from '../lib/api';

type Role = 'ADMIN' | 'ADMIN_SECONDARY' | 'RESPONSABLE' | 'CONTROLEUR';

interface AuthUser {
  id: string;
  nom: string;
  prenom: string;
  role: Role;
  localiteId?: string;
  controleType?: 'PRESENCE' | 'TSHIRT' | 'NOURRITURE';
  passwordMustChange?: boolean;
}

interface AuthContextValue {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<{ requiresPasswordChange: boolean }>;
  logout: () => void;
  updateUser: (user: AuthUser | null) => void;
  // whether a visible warning should be shown before auto logout
  showIdleWarning: boolean;
  // keep the session alive (user answered the warning)
  keepAlive: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });

  const idleTimerRef = useRef<number | null>(null);
  const warningTimerRef = useRef<number | null>(null);
  const IDLE_TIMEOUT = 15 * 60 * 1000; // 15 minutes
  const WARNING_BEFORE = 2 * 60 * 1000; // show warning 2 minutes before logout
  const [showIdleWarning, setShowIdleWarning] = useState(false);

  function clearIdleTimer() {
    if (idleTimerRef.current) {
      window.clearTimeout(idleTimerRef.current);
      idleTimerRef.current = null;
    }
  }

  function startIdleTimer() {
    clearIdleTimer();
    // schedule warning
    clearWarningTimer();
    const warnAt = Math.max(0, IDLE_TIMEOUT - WARNING_BEFORE);
    warningTimerRef.current = window.setTimeout(() => {
      setShowIdleWarning(true);
    }, warnAt) as unknown as number;

    idleTimerRef.current = window.setTimeout(() => {
      // propagate logout to other tabs
      try {
        localStorage.setItem('logout', Date.now().toString());
      } catch (e) {
        // ignore
      }
      setShowIdleWarning(false);
      logout();
    }, IDLE_TIMEOUT) as unknown as number;
  }

  function clearWarningTimer() {
    if (warningTimerRef.current) {
      window.clearTimeout(warningTimerRef.current);
      warningTimerRef.current = null;
    }
    setShowIdleWarning(false);
  }

  function resetIdleTimer() {
    // update last activity timestamp for other tabs
    try {
      localStorage.setItem('lastActivity', Date.now().toString());
    } catch (e) {
      // ignore
    }
    if (user) {
      clearWarningTimer();
      startIdleTimer();
    }
  }

  useEffect(() => {
    // attach activity listeners when logged in
    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click'];
    function handleActivity() {
      resetIdleTimer();
    }

    if (user) {
      startIdleTimer();
      for (const ev of events) window.addEventListener(ev, handleActivity, { passive: true });
    }

    // listen for logout from other tabs
    function handleStorage(e: StorageEvent) {
      if (!e.key) return;
      if (e.key === 'logout') {
        // another tab logged out
        setUser(null);
      }
      if (e.key === 'lastActivity') {
        // reset timer when activity in another tab
        if (user) startIdleTimer();
      }
    }

    window.addEventListener('storage', handleStorage);

    return () => {
      clearIdleTimer();
      clearWarningTimer();
      for (const ev of events) window.removeEventListener(ev, handleActivity);
      window.removeEventListener('storage', handleStorage);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function login(email: string, password: string) {
    console.log('[AUTH] Login attempt', { email });
    try {
      const { data } = await api.post('/auth/login', { email, password });
      const authUser = {
        ...data.user,
        passwordMustChange: data.requiresPasswordChange || data.user?.passwordMustChange || false,
      };
      console.log('[AUTH] Login success', { user: authUser, role: authUser?.role });
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('user', JSON.stringify(authUser));
      try { localStorage.setItem('lastActivity', Date.now().toString()); } catch (e) {}
      setUser(authUser);
      return { requiresPasswordChange: Boolean(data.requiresPasswordChange) };
    } catch (err) {
      console.error('[AUTH] Login failed', err);
      throw err;
    }
  }

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    try { localStorage.setItem('logout', Date.now().toString()); } catch (e) {}
    setUser(null);
  }

  function updateUser(nextUser: AuthUser | null) {
    setUser(nextUser);
    if (nextUser) {
      localStorage.setItem('user', JSON.stringify(nextUser));
    } else {
      localStorage.removeItem('user');
    }
  }

  function keepAlive() {
    try { localStorage.setItem('lastActivity', Date.now().toString()); } catch (e) {}
    setShowIdleWarning(false);
    if (user) {
      clearWarningTimer();
      startIdleTimer();
    }
  }

  return <AuthContext.Provider value={{ user, login, logout, updateUser, showIdleWarning, keepAlive }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth doit être utilisé dans un AuthProvider');
  return ctx;
}
