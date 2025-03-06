
import { useState, useEffect } from "react";
import { AdminSidebar } from "@/components/AdminSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useStoreSettings } from "@/hooks/useStoreSettings";
import { formatPrice } from "@/lib/storeSettings";
import { DollarSign, Globe } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

const StoreSettingsAdmin = () => {
  // Store settings hooks and state
  const { 
    settings, 
    updateSettings, 
    isUpdating, 
    currencyOptions, 
    regionOptions 
  } = useStoreSettings();
  
  const [newSettings, setNewSettings] = useState(settings);

  // Update local settings state when the fetched settings change
  useEffect(() => {
    setNewSettings(settings);
  }, [settings]);
  
  const handleSettingsChange = (section: "currency" | "region", key: string, value: string) => {
    setNewSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
  };

  const handleSaveSettings = () => {
    updateSettings(newSettings);
  };

  return (
    <div className="flex h-screen">
      <AdminSidebar />
      
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold">Store Settings</h1>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-6">Store Settings</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Configure global settings for your store. These settings will affect how prices are displayed and how regional features work.
            </p>

            <div className="space-y-8">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-primary" />
                    <CardTitle>Currency Settings</CardTitle>
                  </div>
                  <CardDescription>
                    Set the currency used throughout your store
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Currency
                    </label>
                    <Select 
                      value={newSettings.currency.code} 
                      onValueChange={(value) => handleSettingsChange("currency", "code", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        {currencyOptions.map(option => (
                          <SelectItem key={option.code} value={option.code}>
                            {option.symbol} {option.name} ({option.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Currency Symbol
                    </label>
                    <Input
                      value={newSettings.currency.symbol}
                      onChange={(e) => handleSettingsChange("currency", "symbol", e.target.value)}
                      placeholder="$"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Symbol Position
                    </label>
                    <Select 
                      value={newSettings.currency.position} 
                      onValueChange={(value) => handleSettingsChange("currency", "position", value as "before" | "after")}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select position" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="before">Before amount (e.g., $100)</SelectItem>
                        <SelectItem value="after">After amount (e.g., 100€)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="p-3 bg-secondary/50 rounded-md">
                    <p className="text-sm font-medium">Preview:</p>
                    <p className="text-lg mt-1">
                      {formatPrice(1234.56, newSettings)}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-primary" />
                    <CardTitle>Region Settings</CardTitle>
                  </div>
                  <CardDescription>
                    Configure regional settings for your store
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Country/Region
                    </label>
                    <Select 
                      value={newSettings.region.country} 
                      onValueChange={(value) => {
                        const selectedRegion = regionOptions.find(r => r.country === value);
                        if (selectedRegion) {
                          handleSettingsChange("region", "country", value);
                          handleSettingsChange("region", "countryCode", selectedRegion.countryCode);
                          handleSettingsChange("region", "timezone", selectedRegion.timezone);
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select country/region" />
                      </SelectTrigger>
                      <SelectContent>
                        {regionOptions.map(option => (
                          <SelectItem key={option.countryCode} value={option.country}>
                            {option.country} ({option.countryCode})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Country Code
                    </label>
                    <Input
                      value={newSettings.region.countryCode}
                      readOnly
                      className="bg-muted"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      This is set automatically based on the selected country/region
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Timezone
                    </label>
                    <Input
                      value={newSettings.region.timezone}
                      readOnly
                      className="bg-muted"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      This is set automatically based on the selected country/region
                    </p>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button 
                  onClick={handleSaveSettings} 
                  disabled={isUpdating}
                  className="w-full md:w-auto"
                >
                  {isUpdating ? "Saving..." : "Save Settings"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StoreSettingsAdmin;
