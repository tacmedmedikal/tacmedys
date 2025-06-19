import * as AuthSession from 'expo-auth-session';
import * as Crypto from 'expo-crypto';
import {
    createUserWithEmailAndPassword,
    GoogleAuthProvider,
    onAuthStateChanged,
    signInWithCredential,
    signInWithEmailAndPassword,
    signOut,
    User
} from 'firebase/auth';
import {
    doc,
    getDoc,
    setDoc
} from 'firebase/firestore';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../firebaseConfig';

interface AuthContextType {
  user: User | null;
  userRole: 'admin' | 'user' | null;
  userProfile: any;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, profileData?: any) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: () => boolean;
  updateProfile: (profileData: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<'admin' | 'user' | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Admin email listesi (gerçek uygulamada Firestore'da tutulmalı)
  const adminEmails = ['admin@tacmedikal.com', 'yonetici@tacmedikal.com'];

  // Kullanıcı profilini Firestore'dan getir
  const fetchUserProfile = async (uid: string) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        const profileData = userDoc.data();
        setUserProfile(profileData);
        setUserRole(profileData.role || 'user');
        return profileData;
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
    return null;
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        // Kullanıcı profilini Firestore'dan getir
        await fetchUserProfile(user.uid);
      } else {
        setUserRole(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };
  const loginWithGoogle = async () => {
    try {
      // Google OAuth için yapılandırma
      const request = new AuthSession.AuthRequest({
        clientId: '544739357657-web.apps.googleusercontent.com', // Firebase Console'dan alınacak
        scopes: ['profile', 'email'],
        responseType: AuthSession.ResponseType.IdToken,
        redirectUri: AuthSession.makeRedirectUri(),
        extraParams: {},
        state: await Crypto.digestStringAsync(
          Crypto.CryptoDigestAlgorithm.SHA256,
          Math.random().toString(),
          { encoding: Crypto.CryptoEncoding.HEX }
        ),
      });

      const result = await request.promptAsync({
        authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
      });

      if (result.type === 'success' && result.params.id_token) {
        const credential = GoogleAuthProvider.credential(result.params.id_token);
        const userCredential = await signInWithCredential(auth, credential);
        const user = userCredential.user;

        // Kullanıcı ilk kez giriş yapıyorsa profil oluştur
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (!userDoc.exists()) {
          const isAdminUser = adminEmails.includes(user.email || '');
          const role = isAdminUser ? 'admin' : 'user';
          
          const profile = {
            email: user.email,
            role: role,
            createdAt: new Date().toISOString(),
            firstName: user.displayName?.split(' ')[0] || '',
            lastName: user.displayName?.split(' ')[1] || '',
            phone: '',
            company: '',
            photoURL: user.photoURL || ''
          };
          
          await setDoc(doc(db, 'users', user.uid), profile);
        }
      }
    } catch (error) {
      console.error('Google login error:', error);
      throw error;
    }
  };

  const register = async (email: string, password: string, profileData?: any) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Kullanıcı rolünü belirle
    const isAdminUser = adminEmails.includes(email);
    const role = isAdminUser ? 'admin' : 'user';
    
    // Kullanıcı profilini Firestore'a kaydet
    const defaultProfile = {
      email: user.email,
      role: role,
      createdAt: new Date().toISOString(),
      firstName: profileData?.firstName || '',
      lastName: profileData?.lastName || '',
      phone: profileData?.phone || '',
      company: profileData?.company || '',
      ...profileData
    };
    
    await setDoc(doc(db, 'users', user.uid), defaultProfile);
  };

  const logout = async () => {
    await signOut(auth);
  };

  const updateProfile = async (profileData: any) => {
    if (!user) throw new Error('No user logged in');
    
    await setDoc(doc(db, 'users', user.uid), profileData, { merge: true });
    setUserProfile({ ...userProfile, ...profileData });
  };

  const isAdmin = () => {
    return userRole === 'admin';
  };
  const value = {
    user,
    userRole,
    userProfile,
    loading,
    login,
    register,
    loginWithGoogle,
    logout,
    isAdmin,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
