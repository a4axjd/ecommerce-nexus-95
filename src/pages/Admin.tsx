
import { useState } from "react";
import { collection, addDoc, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useProducts, Product, ProductVariation } from "@/hooks/useProducts";
import { useStoreSettings } from "@/hooks/useStoreSettings";
import { formatPrice } from "@/lib/storeSettings";
import { Pencil, Trash, Star, Plus, X, Settings, DollarSign, Globe } from "lucide-react";
import { toast } from "sonner";
import { AdminSidebar } from "@/components/AdminSidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const Admin = () => {
  const { data: products, refetch } = useProducts();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("products");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    image: "",
    additionalImages: [""],
    featured: false,
    shippingInfo: "",
    returnPolicy: "",
    availableColors: "",
    availableSizes: "",
  });

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleAdditionalImageChange = (index: number, value: string) => {
    const newAdditionalImages = [...formData.additionalImages];
    newAdditionalImages[index] = value;
    setFormData(prev => ({ ...prev, additionalImages: newAdditionalImages }));
  };

  const addImageField = () => {
    setFormData(prev => ({
      ...prev,
      additionalImages: [...prev.additionalImages, ""]
    }));
  };

  const removeImageField = (index: number) => {
    const newAdditionalImages = [...formData.additionalImages];
    newAdditionalImages.splice(index, 1);
    setFormData(prev => ({
      ...prev,
      additionalImages: newAdditionalImages
    }));
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) {
      toast.info("Already processing your request...");
      return; // Prevent multiple submissions
    }
    
    setIsSubmitting(true);
    toast.info("Starting product submission...");
    
    try {
      console.log("Starting product submission...");
      
      // Filter out empty image URLs
      const filteredAdditionalImages = formData.additionalImages.filter(url => url.trim() !== "");
      
      // Process colors and sizes
      const availableColors = formData.availableColors ? 
        formData.availableColors.split(',').map(color => color.trim()) : 
        [];
        
      const availableSizes = formData.availableSizes ? 
        formData.availableSizes.split(',').map(size => size.trim()) : 
        [];
      
      // Prepare the product data
      const productData = {
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category,
        image: formData.image,
        images: [formData.image, ...filteredAdditionalImages], // Include main image and additional images
        featured: formData.featured,
        shippingInfo: formData.shippingInfo,
        returnPolicy: formData.returnPolicy,
        availableColors: availableColors.length > 0 ? availableColors : null,
        availableSizes: availableSizes.length > 0 ? availableSizes : null,
      };

      console.log("Product data prepared:", productData);
      toast.info("Saving product data...");

      try {
        if (selectedProduct) {
          console.log("Updating existing product...");
          await updateDoc(doc(db, "products", selectedProduct.id), productData);
          toast.success("Product updated successfully");
        } else {
          console.log("Adding new product...");
          const docRef = await addDoc(collection(db, "products"), productData);
          console.log("Product added with ID:", docRef.id);
          toast.success("Product added successfully");
        }
      } catch (dbError) {
        console.error("Error saving to database:", dbError);
        toast.error("Error saving to database: " + (dbError instanceof Error ? dbError.message : String(dbError)));
        setIsSubmitting(false);
        return;
      }

      // Reset the form
      setFormData({
        title: "",
        description: "",
        price: "",
        category: "",
        image: "",
        additionalImages: [""],
        featured: false,
        shippingInfo: "",
        returnPolicy: "",
        availableColors: "",
        availableSizes: "",
      });
      setSelectedProduct(null);
      
      // Refresh the products list
      console.log("Refreshing products list...");
      toast.info("Refreshing products list...");
      await refetch();
      console.log("Form reset and products refetched");
      
    } catch (error) {
      console.error("General error in product submission:", error);
      toast.error("Error saving product: " + (error instanceof Error ? error.message : String(error)));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setFormData({
      title: product.title,
      description: product.description,
      price: product.price.toString(),
      category: product.category,
      image: product.image,
      additionalImages: product.images ? 
        // Filter out the main image from the images array
        product.images.filter(img => img !== product.image) : 
        [""],
      featured: product.featured || false,
      shippingInfo: product.shippingInfo || "",
      returnPolicy: product.returnPolicy || "",
      availableColors: product.availableColors ? product.availableColors.join(', ') : "",
      availableSizes: product.availableSizes ? product.availableSizes.join(', ') : "",
    });
  };

  const handleDelete = async (productId: string) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteDoc(doc(db, "products", productId));
        toast.success("Product deleted successfully");
        refetch();
      } catch (error) {
        console.error("Error deleting product:", error);
        toast.error("Error deleting product: " + (error instanceof Error ? error.message : String(error)));
      }
    }
  };

  return (
    <div className="flex h-screen">
      <AdminSidebar />
      
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-4xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
              <TabsList>
                <TabsTrigger value="products" className="gap-2">
                  <ShoppingBag className="h-4 w-4" />
                  Products
                </TabsTrigger>
                <TabsTrigger value="settings" className="gap-2">
                  <Settings className="h-4 w-4" />
                  Store Settings
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="products" className="space-y-8">
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-6">
                  {selectedProduct ? "Edit Product" : "Add New Product"}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium mb-1">
                      Title
                    </label>
                    <Input
                      type="text"
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-medium mb-1">
                      Description
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      required
                      className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="price" className="block text-sm font-medium mb-1">
                      Price ({settings.currency.code})
                    </label>
                    <Input
                      type="number"
                      id="price"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      required
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <label htmlFor="category" className="block text-sm font-medium mb-1">
                      Category
                    </label>
                    <Input
                      type="text"
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="image" className="block text-sm font-medium mb-1">
                      Main Image URL
                    </label>
                    <Input
                      type="url"
                      id="image"
                      name="image"
                      value={formData.image}
                      onChange={handleInputChange}
                      placeholder="https://example.com/image.jpg"
                      required
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-sm font-medium">
                        Additional Images
                      </label>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={addImageField}
                        className="text-xs"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add Image
                      </Button>
                    </div>
                    
                    {formData.additionalImages.map((imageUrl, index) => (
                      <div key={index} className="flex items-center gap-2 mb-2">
                        <Input
                          type="url"
                          value={imageUrl}
                          onChange={(e) => handleAdditionalImageChange(index, e.target.value)}
                          placeholder={`Additional image URL ${index + 1}`}
                          className="flex-1"
                        />
                        <Button 
                          type="button" 
                          variant="outline"
                          size="icon"
                          onClick={() => removeImageField(index)}
                          disabled={formData.additionalImages.length === 1 && index === 0}
                          className="h-10 w-10 shrink-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  <div>
                    <label htmlFor="shippingInfo" className="block text-sm font-medium mb-1">
                      Shipping Information
                    </label>
                    <textarea
                      id="shippingInfo"
                      name="shippingInfo"
                      value={formData.shippingInfo}
                      onChange={handleInputChange}
                      className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                      placeholder="Shipping details, delivery times, etc."
                    />
                  </div>

                  <div>
                    <label htmlFor="returnPolicy" className="block text-sm font-medium mb-1">
                      Return Policy
                    </label>
                    <textarea
                      id="returnPolicy"
                      name="returnPolicy"
                      value={formData.returnPolicy}
                      onChange={handleInputChange}
                      className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                      placeholder="Return policy, conditions, process, etc."
                    />
                  </div>

                  <div>
                    <label htmlFor="availableColors" className="block text-sm font-medium mb-1">
                      Available Colors (comma separated)
                    </label>
                    <Input
                      type="text"
                      id="availableColors"
                      name="availableColors"
                      value={formData.availableColors}
                      onChange={handleInputChange}
                      placeholder="e.g. #ff0000, #00ff00, #0000ff"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Add colors as hex codes or names separated by commas
                    </p>
                  </div>

                  <div>
                    <label htmlFor="availableSizes" className="block text-sm font-medium mb-1">
                      Available Sizes (comma separated)
                    </label>
                    <Input
                      type="text"
                      id="availableSizes"
                      name="availableSizes"
                      value={formData.availableSizes}
                      onChange={handleInputChange}
                      placeholder="e.g. S, M, L, XL"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Add sizes separated by commas
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="featured"
                      name="featured"
                      checked={formData.featured}
                      onChange={handleCheckboxChange}
                      className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                    />
                    <label htmlFor="featured" className="block text-sm font-medium">
                      Feature on Home Page
                    </label>
                  </div>

                  <div className="flex gap-4">
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting 
                        ? "Processing..." 
                        : selectedProduct 
                          ? "Update Product" 
                          : "Add Product"
                      }
                    </Button>
                    {selectedProduct && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setSelectedProduct(null);
                          setFormData({
                            title: "",
                            description: "",
                            price: "",
                            category: "",
                            image: "",
                            additionalImages: [""],
                            featured: false,
                            shippingInfo: "",
                            returnPolicy: "",
                            availableColors: "",
                            availableSizes: "",
                          });
                        }}
                        disabled={isSubmitting}
                      >
                        Cancel Edit
                      </Button>
                    )}
                  </div>
                </form>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4">Product List</h2>
                <div className="space-y-4">
                  {products?.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <img
                            src={product.image}
                            alt={product.title}
                            className="w-16 h-16 object-cover rounded"
                          />
                          {product.featured && (
                            <div className="absolute -top-2 -right-2 bg-yellow-400 rounded-full p-1" title="Featured on home page">
                              <Star className="h-3 w-3 text-white" />
                            </div>
                          )}
                          {product.images && product.images.length > 1 && (
                            <div className="absolute -bottom-2 -right-2 bg-blue-500 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center" title="Has additional images">
                              {product.images.length}
                            </div>
                          )}
                        </div>
                        <div>
                          <h3 className="font-medium">{product.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {formatPrice(product.price, settings)}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleEdit(product)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => handleDelete(product.id)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {products?.length === 0 && (
                    <p className="text-center text-muted-foreground py-4">
                      No products found. Add your first product above.
                    </p>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="settings" className="space-y-8">
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
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Admin;
