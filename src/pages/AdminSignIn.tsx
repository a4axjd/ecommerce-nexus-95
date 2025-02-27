
import { SignIn } from "@clerk/clerk-react";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";

const AdminSignIn = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 pt-24">
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-semibold mb-8 text-center">Admin Sign In</h1>
          <SignIn 
            redirectUrl="/admin"
            routing="path"
            path="/admin/sign-in"
            signUpUrl="/admin/sign-in"
          />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminSignIn;
