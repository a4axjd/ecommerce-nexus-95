
import { useState } from "react";
import { collection, addDoc, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useProducts, Product } from "@/hooks/useProducts";
import { Pencil, Trash, LogOut } from "lucide-react";
import { toast } from "sonner";
import { useUser, useClerk } from "@clerk/clerk-react";

const Admin = () => {
  const { user } = useUser();
  const { signOut } = useClerk();
  const { data: products, refetch } = useProducts();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    image: "", // Changed from File to string for image URL
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
      
      // Prepare the product data with direct image URL
      const productData = {
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category,
        image: formData.image,
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
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 pt-24">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
            <div className="flex items-center gap-4">
              <p className="text-sm text-muted-foreground">
                Signed in as {user?.primaryEmailAddress?.emailAddress}
              </p>
              <Button variant="outline" onClick={() => signOut()}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>

          <div className="space-y-8">
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
                    Price
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
                    Image URL
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
                      <img
                        src={product.image}
                        alt={product.title}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div>
                        <h3 className="font-medium">{product.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          ${product.price.toFixed(2)}
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
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Admin;
