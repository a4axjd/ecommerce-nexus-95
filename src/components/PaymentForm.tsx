
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Banknote, HomeIcon, Building } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useStoreSettings } from "@/hooks/useStoreSettings";

interface PaymentFormProps {
  onSuccess: () => void;
  amount: number;
  shippingInfo?: {
    name: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    phone: string;
    email: string;
  };
}

export const PaymentForm = ({ onSuccess, amount, shippingInfo }: PaymentFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"bank" | "cod">("bank");
  const { settings } = useStoreSettings();

  const handleBankTransferSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    toast.info("Processing Bank Transfer request...");
    
    // Simulate processing
    setTimeout(() => {
      toast.success("Bank Transfer order confirmed");
      setIsLoading(false);
      onSuccess();
    }, 1000);
  };

  const handleCodSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    toast.info("Processing Cash on Delivery request...");
    
    // Simulate processing
    setTimeout(() => {
      toast.success("Cash on Delivery order confirmed");
      setIsLoading(false);
      onSuccess();
    }, 1000);
  };

  // Display information about shipped to address
  const renderShippingInfo = () => {
    if (!shippingInfo) return null;
    
    return (
      <div className="mb-4 p-3 bg-muted rounded-md">
        <div className="text-sm font-medium mb-2">Shipping Information:</div>
        <div className="text-xs text-muted-foreground">
          <p><span className="font-medium">Name:</span> {shippingInfo.name}</p>
          <p><span className="font-medium">Address:</span> {shippingInfo.address}</p>
          <p><span className="font-medium">City:</span> {shippingInfo.city}, {shippingInfo.state} {shippingInfo.zipCode}</p>
          <p><span className="font-medium">Country:</span> {shippingInfo.country}</p>
          <p><span className="font-medium">Email:</span> {shippingInfo.email}</p>
          <p><span className="font-medium">Phone:</span> {shippingInfo.phone}</p>
        </div>
      </div>
    );
  };

  return (
    <Tabs defaultValue="bank" onValueChange={(value) => setPaymentMethod(value as "bank" | "cod")}>
      <TabsList className="grid w-full grid-cols-2 mb-6">
        <TabsTrigger value="bank" className="flex items-center gap-2">
          <Building className="h-4 w-4" />
          Bank Transfer
        </TabsTrigger>
        <TabsTrigger value="cod" className="flex items-center gap-2">
          <Banknote className="h-4 w-4" />
          Cash on Delivery
        </TabsTrigger>
      </TabsList>

      {/* Bank Transfer Tab */}
      <TabsContent value="bank" className="space-y-6" id="bank">
        {shippingInfo && renderShippingInfo()}
        
        <form onSubmit={handleBankTransferSubmit} className="space-y-6">
          <div className="p-4 bg-secondary/50 rounded-lg">
            <div className="flex items-start gap-3 mb-4">
              <div className="mt-1">
                <Building className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Bank Transfer</p>
                <p className="text-xs text-muted-foreground">
                  Transfer the payment to our bank account and your order will be shipped once the payment is confirmed.
                </p>
              </div>
            </div>
            
            <div className="space-y-4 text-sm">
              <div className="border-b pb-2">
                <p className="font-medium mb-1">Bank Details:</p>
                <p><span className="font-medium">Bank Name:</span> {settings.bankTransfer.bankName}</p>
                <p><span className="font-medium">Account Name:</span> {settings.bankTransfer.accountName}</p>
                <p><span className="font-medium">Account Number:</span> {settings.bankTransfer.accountNumber}</p>
              </div>
              
              <div className="pt-2">
                <p className="font-medium mb-2">Instructions:</p>
                <p className="text-muted-foreground">{settings.bankTransfer.instructions}</p>
              </div>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading}
            variant="default"
          >
            <Building className="w-4 h-4 mr-2" />
            {isLoading ? "Processing..." : `Place Order - Pay ${settings.currency.symbol}${amount.toFixed(2)} via Bank Transfer`}
          </Button>
        </form>
      </TabsContent>

      {/* Cash on Delivery Tab */}
      <TabsContent value="cod" className="space-y-6" id="cod">
        {shippingInfo && renderShippingInfo()}
        
        <form onSubmit={handleCodSubmit} className="space-y-6">
          <div className="p-4 bg-secondary/50 rounded-lg">
            <div className="flex items-start gap-3 mb-4">
              <div className="mt-1">
                <HomeIcon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Cash on Delivery</p>
                <p className="text-xs text-muted-foreground">
                  Pay with cash when your order is delivered to your address.
                </p>
              </div>
            </div>
            
            <div className="space-y-4 text-sm">
              <div className="flex items-start">
                <div className="shrink-0 mr-2">•</div>
                <p>The delivery person will collect the payment when they deliver your order.</p>
              </div>
              <div className="flex items-start">
                <div className="shrink-0 mr-2">•</div>
                <p>Please have the exact amount ready to ensure a smooth delivery process.</p>
              </div>
              <div className="flex items-start">
                <div className="shrink-0 mr-2">•</div>
                <p>You can inspect your items before making payment.</p>
              </div>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading}
            variant="outline"
          >
            <Banknote className="w-4 h-4 mr-2" />
            {isLoading ? "Processing..." : `Place Order - Pay ${settings.currency.symbol}${amount.toFixed(2)} on Delivery`}
          </Button>
        </form>
      </TabsContent>
    </Tabs>
  );
};
