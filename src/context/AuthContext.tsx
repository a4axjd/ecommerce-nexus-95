
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { toast } from 'sonner';

interface UserRole {
  isAdmin: boolean;
}

interface AuthContextType {
  currentUser: User | null;
  userRoles: UserRole | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userRoles, setUserRoles] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        try {
          // Fetch user roles from Firestore
          const userDoc = await getDoc(doc(db, "userRoles", user.uid));
          if (userDoc.exists()) {
            const userRoleData = userDoc.data() as UserRole;
            setUserRoles(userRoleData);
            setIsAdmin(userRoleData.isAdmin);
          } else {
            // Default roles for new users
            setUserRoles({ isAdmin: false });
            setIsAdmin(false);
          }
        } catch (error) {
          console.error("Error fetching user roles:", error);
          setUserRoles({ isAdmin: false });
          setIsAdmin(false);
        }
      } else {
        setUserRoles(null);
        setIsAdmin(false);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signUp = async (email: string, password: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // Set default role for new users
      await setDoc(doc(db, "userRoles", userCredential.user.uid), {
        isAdmin: false,
      });
      toast.success('Account created successfully');
    } catch (error) {
      console.error('Sign up error:', error);
      toast.error('Failed to create account. ' + (error instanceof Error ? error.message : 'Please try again.'));
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success('Signed in successfully');
    } catch (error) {
      console.error('Sign in error:', error);
      toast.error('Failed to sign in. Please check your credentials.');
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      toast.success('Signed out successfully');
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('Failed to sign out');
      throw error;
    }
  };

  const value = {
    currentUser,
    userRoles,
    loading,
    signUp,
    signIn,
    signOut,
    isAdmin
  };

  return (
    <AuthContext.Provider value={value}>
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
