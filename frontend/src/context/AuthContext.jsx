import { createContext, useContext, useState, useEffect } from 'react';
import { auth, GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword } from '../config/firebase';
import api, { verifyFirebaseToken, sendOtp, verifyOtp } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const isFirebaseConfigured =
    import.meta.env.VITE_FIREBASE_API_KEY &&
    import.meta.env.VITE_FIREBASE_API_KEY !== 'your_firebase_api_key';

  useEffect(() => {
    // Intercept 401 to synchronize React State — only for auth-related failures
    const interceptor = api.interceptors.response.use(
      (res) => res,
      (err) => {
        if (err.response?.status === 401) {
          const msg = err.response?.data?.message || '';
          // Only log out if backend explicitly says the session/token is invalid
          if (msg.includes('token') || msg.includes('Token') || msg.includes('Authentication failed')) {
            setUser(null);
            localStorage.removeItem('eroturf_token');
            localStorage.removeItem('eroturf_user');
          }
        }
        return Promise.reject(err);
      }
    );
    return () => {
      api.interceptors.response.eject(interceptor);
    };
  }, []);

  useEffect(() => {
    // Restore from localStorage
    try {
      const currentProject = import.meta.env.VITE_FIREBASE_PROJECT_ID;
      const savedProject = localStorage.getItem('eroturf_firebase_project_id');
      
      if (savedProject && currentProject && savedProject !== currentProject) {
        localStorage.removeItem('eroturf_token');
        localStorage.removeItem('eroturf_user');
      }
      
      if (currentProject) {
        localStorage.setItem('eroturf_firebase_project_id', currentProject);
      }

      const saved = localStorage.getItem('eroturf_user');
      const token = localStorage.getItem('eroturf_token');
      if (saved && token) {
        setUser(JSON.parse(saved));
      }
    } catch {}
    setLoading(false);
  }, []);

  const checkRedirect = () => {
    const redirect = sessionStorage.getItem('redirect_after_login');
    if (redirect) {
      sessionStorage.removeItem('redirect_after_login');
      window.location.href = redirect;
    }
  };

  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();

      const { data } = await verifyFirebaseToken({
        idToken,
        name: result.user.displayName,
        email: result.user.email,
        avatar: result.user.photoURL,
      });

      localStorage.setItem('eroturf_token', data.token);
      localStorage.setItem('eroturf_user', JSON.stringify(data.user));
      setUser(data.user);
      setShowAuthModal(false);
      toast.success(`Welcome, ${data.user.name}! 🏏`);
      checkRedirect();
      return data.user;
    } catch (err) {
      console.error('Google Sign-In Error:', err);
      const code = err?.code || '';
      if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
        return; // User just closed the popup — no error toast needed
      }
      if (code === 'auth/operation-not-allowed') {
        toast.error('Google Sign-In is not enabled. Please contact support.');
      } else if (code === 'auth/popup-blocked') {
        toast.error('Popup was blocked. Please allow popups for this site.');
      } else if (code === 'auth/network-request-failed') {
        toast.error('Network error. Please check your internet connection.');
      } else {
        toast.error(err?.response?.data?.message || err?.message || 'Google sign-in failed');
      }
      throw err;
    }
  };


  const loginWithPhone = async (idToken, phone) => {
    try {
      const { data } = await verifyFirebaseToken({
        idToken,
        phone,
        name: `User ${phone.slice(-4)}`,
      });

      localStorage.setItem('eroturf_token', data.token);
      localStorage.setItem('eroturf_user', JSON.stringify(data.user));
      setUser(data.user);
      setShowAuthModal(false);
      toast.success('Logged in successfully! 🏏');
      checkRedirect();
      return data.user;
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Login failed');
      throw err;
    }
  };

  const requestTwilioOtp = async (phone) => {
    try {
      const { data } = await sendOtp(phone);
      return data;
    } catch (err) {
      const errMsg = err?.response?.data?.message || 'Failed to send OTP';
      toast.error(errMsg);
      throw err;
    }
  };

  const verifyTwilioOtp = async (phone, code, name) => {
    try {
      const { data } = await verifyOtp(phone, code, name);
      localStorage.setItem('eroturf_token', data.token);
      localStorage.setItem('eroturf_user', JSON.stringify(data.user));
      setUser(data.user);
      setShowAuthModal(false);
      toast.success('Logged in successfully! 🏏');
      checkRedirect();
      return data.user;
    } catch (err) {
      const errMsg = err?.response?.data?.message || 'Invalid OTP. Please try again.';
      toast.error(errMsg);
      throw err;
    }
  };


  const registerWithEmail = async (name, email, phone, password) => {
    try {
      let userObj;
      let token;

      if (isFirebaseConfigured) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const idToken = await userCredential.user.getIdToken();
        const { data } = await verifyFirebaseToken({ idToken, name, email, phone });
        userObj = data.user;
        token = data.token;
      } else {
        // Dev mode registration bypass
        userObj = {
          id: 'dev_user_' + Date.now(),
          name,
          email,
          phone,
          avatar: '',
          role: 'user',
        };
        token = 'dev_placeholder_token';
      }

      localStorage.setItem('eroturf_token', token);
      localStorage.setItem('eroturf_user', JSON.stringify(userObj));
      setUser(userObj);
      setShowAuthModal(false);
      toast.success(`Welcome, ${userObj.name}! 🏏`);
      checkRedirect();
      return userObj;
    } catch (err) {
      console.error('Registration Error:', err);
      toast.error(err?.response?.data?.message || err?.message || 'Registration failed');
      throw err;
    }
  };

  const loginWithEmail = async (email, password) => {
    try {
      let userObj;
      let token;

      if (isFirebaseConfigured) {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const idToken = await userCredential.user.getIdToken();
        const { data } = await verifyFirebaseToken({ idToken, email });
        userObj = data.user;
        token = data.token;
      } else {
        // Dev mode login bypass
        userObj = {
          id: 'dev_user_001',
          name: email.split('@')[0],
          email,
          phone: '+91 98765 43210',
          avatar: '',
          role: 'user',
        };
        token = 'dev_placeholder_token';
      }

      localStorage.setItem('eroturf_token', token);
      localStorage.setItem('eroturf_user', JSON.stringify(userObj));
      setUser(userObj);
      setShowAuthModal(false);
      toast.success(`Welcome back, ${userObj.name}! 🏏`);
      checkRedirect();
      return userObj;
    } catch (err) {
      console.error('Sign-in Error:', err);
      toast.error(err?.response?.data?.message || err?.message || 'Sign-in failed');
      throw err;
    }
  };

  // Dev mode login (when Firebase isn't configured)
  const devLogin = async () => {
    const devUser = {
      id: 'dev_user_001',
      name: 'Sridhar!',
      email: 'sridhar0106a@gmail.com',
      phone: '+91 98765 43210',
      avatar: '',
      role: 'user', // dev mode matches user mockup
    };
    const devToken = 'dev_placeholder_token';
    localStorage.setItem('eroturf_token', devToken);
    localStorage.setItem('eroturf_user', JSON.stringify(devUser));
    setUser(devUser);
    setShowAuthModal(false);
    toast.success('Dev mode login ✓');
    checkRedirect();
  };

  const logout = () => {
    try { auth?.signOut?.(); } catch {}
    localStorage.removeItem('eroturf_token');
    localStorage.removeItem('eroturf_user');
    setUser(null);
    toast.success('Logged out');
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    showAuthModal,
    setShowAuthModal,
    loginWithGoogle,
    loginWithPhone,
    requestTwilioOtp,
    verifyTwilioOtp,
    registerWithEmail,
    loginWithEmail,
    devLogin,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const getAvatarUrl = (user) => {
  const name = user?.name || 'U';
  const avatar = user?.avatar;

  if (avatar && avatar !== 'null' && avatar !== 'undefined' && avatar.trim() !== '') {
    return avatar;
  }

  const char = name.charAt(0).toUpperCase();
  const colors = [
    '#00C853', // green
    '#10B981', // emerald
    '#3B82F6', // blue
    '#F59E0B', // amber
    '#8B5CF6', // purple
    '#EF4444', // red
  ];

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const color = char === 'S' ? '#0F4C3A' : colors[Math.abs(hash) % colors.length];

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <rect width="100%" height="100%" fill="${color}"/>
    <text x="50%" y="50%" font-size="50" font-family="Inter, sans-serif" font-weight="900" fill="#ffffff" text-anchor="middle" dominant-baseline="central">${char}</text>
  </svg>`;
  return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
};

export const handleAvatarError = (e, name) => {
  e.target.onerror = null;
  const char = (name || 'U').charAt(0).toUpperCase();
  const color = char === 'S' ? '#0F4C3A' : '#00C853';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <rect width="100%" height="100%" fill="${color}"/>
    <text x="50%" y="50%" font-size="50" font-family="Inter, sans-serif" font-weight="900" fill="#ffffff" text-anchor="middle" dominant-baseline="central">${char}</text>
  </svg>`;
  e.target.src = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
};
