
import { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { toast } from "sonner";
import { LockKeyhole } from "lucide-react";

const AdminSignIn = () => {
  const navigate = useNavigate();
  const { signIn, currentUser, loading, isAdmin } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasAttemptedSignIn, setHasAttemptedSignIn] = useState(false);

  useEffect(() => {
    // This effect runs when isAdmin or currentUser changes after sign-in attempt
    if (hasAttemptedSignIn && currentUser && !loading) {
      if (!isAdmin) {
        toast.error("You don't have admin privileges");
        navigate("/account");
      } else {
        navigate("/admin");
      }
      setHasAttemptedSignIn(false);
    }
  }, [isAdmin, currentUser, loading, hasAttemptedSignIn, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (currentUser && isAdmin) {
    return <Navigate to="/admin" />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await signIn(email, password);
      setHasAttemptedSignIn(true);
      // Let the useEffect handle the navigation logic after auth state updates
    } catch (error) {
      console.error("Sign in error:", error);
      setIsSubmitting(false);
      // Error is already handled in the signIn function
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 pt-24 flex items-center justify-center">
        <div className="w-full max-w-md p-8 space-y-8 bg-white shadow-lg rounded-lg">
          <div className="text-center">
            <h1 className="text-2xl font-semibold mb-2">Admin Sign In</h1>
            <p className="text-muted-foreground">Sign in to access the admin dashboard</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-1">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              <LockKeyhole className="h-4 w-4 mr-2" />
              {isSubmitting ? "Signing In..." : "Sign In"}
            </Button>
          </form>
          
          <div className="text-center text-sm">
            <p className="text-muted-foreground">
              Looking for regular sign in?{" "}
              <a href="/sign-in" className="text-primary hover:underline font-medium">
                Sign In Here
              </a>
            </p>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default AdminSignIn;
