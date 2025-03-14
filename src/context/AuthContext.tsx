
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
      console.log("Auth state changed:", user?.email);
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
          
          // Also ensure the user document exists in users collection
          const userProfileDoc = await getDoc(doc(db, "users", user.uid));
          if (!userProfileDoc.exists()) {
            await setDoc(doc(db, "users", user.uid), {
              email: user.email,
              displayName: user.displayName || '',
              createdAt: Date.now(),
              wishlist: []
            });
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
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
    setLoading(true);
    try {
      console.log("Starting sign up process for:", email);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log("User created:", userCredential.user.uid);
      
      // Set default role for new users
      await setDoc(doc(db, "userRoles", userCredential.user.uid), {
        isAdmin: false,
      });
      
      // Create user profile document
      await setDoc(doc(db, "users", userCredential.user.uid), {
        email: userCredential.user.email,
        displayName: userCredential.user.displayName || '',
        createdAt: Date.now(),
        wishlist: []
      });
      
      toast.success('Account created successfully');
      return Promise.resolve();
    } catch (error) {
      console.error('Sign up error:', error);
      toast.error('Failed to create account. ' + (error instanceof Error ? error.message : 'Please try again.'));
      setLoading(false);
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      console.log("Starting sign in process for:", email);
      await signInWithEmailAndPassword(auth, email, password);
      toast.success('Signed in successfully');
    } catch (error) {
      console.error('Sign in error:', error);
      toast.error('Failed to sign in. Please check your credentials.');
      setLoading(false);
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
      {!loading ? children : (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      )}
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
