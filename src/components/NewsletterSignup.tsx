
import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';

interface NewsletterSignupProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewsletterSignup = ({ isOpen, onClose }: NewsletterSignupProps) => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call to subscribe user
    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: "Successfully subscribed!",
        description: "Check your email for a 10% discount code.",
      });
      onClose();
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-lg w-full max-w-md p-6 relative shadow-xl animate-scale-in max-h-[90vh] overflow-auto">
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close newsletter popup"
        >
          <X className="h-5 w-5" />
        </button>
        
        <div className="mb-6">
          <div className="mb-4 bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-center mb-1">Get 10% Off Your First Order</h2>
          <p className="text-center text-gray-600">
            Sign up for our newsletter and receive exclusive updates, early access to new drops, and a 10% discount code.
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <Button 
            type="submit" 
            className="w-full py-3 h-auto text-base font-medium" 
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              'Get My 10% Discount'
            )}
          </Button>
        </form>
        
        <p className="text-xs text-center text-gray-500 mt-4">
          By signing up, you agree to our <a href="#" className="underline hover:text-primary">Terms of Service</a> and <a href="#" className="underline hover:text-primary">Privacy Policy</a>.
        </p>
      </div>
    </div>
  );
};
