
import { useState } from "react";
import { collection, addDoc, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useProducts, Product } from "@/hooks/useProducts";
import { Pencil, Trash, Star } from "lucide-react";
import { toast } from "sonner";
import { AdminSidebar } from "@/components/AdminSidebar";

const Admin = () => {
  const { data: products, refetch } = useProducts();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    image: "",
    featured: false,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
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
        featured: formData.featured,
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
        featured: false,
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
      featured: product.featured || false,
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
          <h1 className="text-2xl font-semibold mb-8">Product Management</h1>

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
                          featured: false,
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
                      </div>
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
    </div>
  );
};

export default Admin;
