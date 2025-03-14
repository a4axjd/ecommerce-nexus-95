
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Minus, Plus, ChevronLeft, Star, ShoppingCart, Share, Heart } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useProducts } from "@/hooks/useProducts";
import { formatPrice } from "@/lib/storeSettings";
import { useStoreSettings } from "@/hooks/useStoreSettings";
import { toast } from "sonner";

const reviews = [
  {
    id: 1,
    username: "Sarah Johnson",
    rating: 5,
    date: "3 weeks ago",
    comment:
      "I absolutely love this product! The quality is exceptional and it exceeded my expectations. Highly recommend to anyone considering this purchase.",
  },
  {
    id: 2,
    username: "Michael Chen",
    rating: 4,
    date: "1 month ago",
    comment:
      "Very good product for the price. There are a few minor issues with the finish, but overall I'm satisfied with my purchase.",
  },
  {
    id: 3,
    username: "Jessica Williams",
    rating: 5,
    date: "2 months ago",
    comment:
      "This is my second purchase from this brand and they never disappoint. Fast shipping and great customer service too!",
  },
];

const ProductDetail = () => {
  const { productId } = useParams<{ productId: string }>();
  const { data: products = [], isLoading } = useProducts();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const { settings } = useStoreSettings();

  // Find the product by ID
  const product = products.find((p) => p.id === productId);

  // Sample color and size options (would come from product data in a real app)
  const colorOptions = ["Black", "White", "Blue", "Red"];
  const sizeOptions = ["S", "M", "L", "XL"];

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      setQuantity(value);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const incrementQuantity = () => {
    setQuantity(quantity + 1);
  };

  const handleAddToCart = () => {
    if (!product) return;

    addToCart({
      id: product.id,
      title: product.title,
      price: product.price,
      image: product.image,
      quantity,
      color: selectedColor,
      size: selectedSize,
      category: product.category,
    });

    toast.success(`Added ${product.title} to cart`);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="animate-pulse">
            <div className="h-4 bg-secondary w-32 mb-2 rounded"></div>
            <div className="h-8 bg-secondary w-60 rounded"></div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Product not found
  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-16">
          <div className="max-w-lg mx-auto text-center">
            <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
            <p className="text-muted-foreground mb-6">The product you're looking for doesn't exist or has been removed.</p>
            <Button asChild>
              <Link to="/products">
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back to Products
              </Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow container mx-auto px-4 py-16">
        {/* Breadcrumb */}
        <div className="mb-8">
          <nav className="flex items-center text-sm">
            <Link to="/" className="text-muted-foreground hover:text-foreground">
              Home
            </Link>
            <span className="mx-2 text-muted-foreground">/</span>
            <Link to="/products" className="text-muted-foreground hover:text-foreground">
              Products
            </Link>
            <span className="mx-2 text-muted-foreground">/</span>
            <Link to={`/products?category=${product.category}`} className="text-muted-foreground hover:text-foreground">
              {product.category}
            </Link>
            <span className="mx-2 text-muted-foreground">/</span>
            <span className="font-medium text-foreground truncate">{product.title}</span>
          </nav>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {/* Product Image */}
          <div className="aspect-square overflow-hidden rounded-lg bg-secondary/30">
            <img
              src={product.image || "/placeholder.svg"}
              alt={product.title}
              className="h-full w-full object-cover"
            />
          </div>

          {/* Product Info */}
          <div>
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <Badge variant="outline" className="capitalize">
                  {product.category}
                </Badge>
                {product.featured && <Badge>Featured</Badge>}
              </div>
              <h1 className="text-3xl font-bold mb-2">{product.title}</h1>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex">
                  {[...Array(5)].map((_, index) => (
                    <Star
                      key={index}
                      className={`h-5 w-5 ${
                        index < 4 ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  (128 reviews)
                </span>
              </div>
              <p className="text-2xl font-semibold mb-4">
                {formatPrice(product.price, settings)}
              </p>
              <p className="text-muted-foreground mb-6">
                {product.description || "No description available for this product."}
              </p>
            </div>

            <div className="space-y-6">
              {/* Color Selection */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Color
                </label>
                <div className="flex gap-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`h-10 w-10 rounded-full border flex items-center justify-center ${
                        selectedColor === color
                          ? "border-primary ring-2 ring-primary ring-offset-2"
                          : "border-input"
                      }`}
                      style={{
                        backgroundColor:
                          color.toLowerCase() === "white" ? "#ffffff" : "",
                      }}
                    >
                      <span
                        className={`w-8 h-8 rounded-full`}
                        style={{
                          backgroundColor: color.toLowerCase(),
                          border:
                            color.toLowerCase() === "white"
                              ? "1px solid #e5e7eb"
                              : "",
                        }}
                      ></span>
                      <span className="sr-only">{color}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Size Selection */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Size
                </label>
                <Select value={selectedSize} onValueChange={setSelectedSize}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    {sizeOptions.map((size) => (
                      <SelectItem key={size} value={size}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Quantity
                </label>
                <div className="flex max-w-[140px] items-center">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 rounded-r-none"
                    onClick={decrementQuantity}
                  >
                    <Minus className="h-4 w-4" />
                    <span className="sr-only">Decrease quantity</span>
                  </Button>
                  <Input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={handleQuantityChange}
                    className="h-10 w-14 rounded-none border-x-0 text-center [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 rounded-l-none"
                    onClick={incrementQuantity}
                  >
                    <Plus className="h-4 w-4" />
                    <span className="sr-only">Increase quantity</span>
                  </Button>
                </div>
              </div>

              {/* Add to Cart */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button className="sm:flex-1" onClick={handleAddToCart}>
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Add to Cart
                </Button>
                <Button variant="outline" size="icon" className="h-10 w-10">
                  <Heart className="h-4 w-4" />
                  <span className="sr-only">Add to wishlist</span>
                </Button>
                <Button variant="outline" size="icon" className="h-10 w-10">
                  <Share className="h-4 w-4" />
                  <span className="sr-only">Share</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <Tabs defaultValue="description" className="mb-16">
          <TabsList className="w-full max-w-md mx-auto grid grid-cols-3">
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="specifications">Specifications</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>
          <TabsContent value="description" className="mt-6">
            <div className="prose max-w-none">
              <h3 className="text-lg font-semibold mb-2">Product Description</h3>
              <p className="mb-4">
                {product.description ||
                  `Experience the premium quality and exquisite craftsmanship of our ${product.title}. 
                  Designed with attention to detail and made from high-quality materials, this product 
                  is perfect for those who appreciate fine quality and sophisticated style.`}
              </p>
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
                enim ad minim veniam, quis nostrud exercitation ullamco laboris
                nisi ut aliquip ex ea commodo consequat.
              </p>
            </div>
          </TabsContent>
          <TabsContent value="specifications" className="mt-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-2">Specifications</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b">
                    <span className="font-medium">Material</span>
                    <span className="text-muted-foreground">Premium Quality</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="font-medium">Dimensions</span>
                    <span className="text-muted-foreground">
                      10cm x 20cm x 5cm
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="font-medium">Weight</span>
                    <span className="text-muted-foreground">250g</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b">
                    <span className="font-medium">Made in</span>
                    <span className="text-muted-foreground">USA</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="font-medium">Color Options</span>
                    <span className="text-muted-foreground">
                      {colorOptions.join(", ")}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="font-medium">Warranty</span>
                    <span className="text-muted-foreground">1 Year</span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="reviews" className="mt-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Customer Reviews</h3>
                <Button variant="outline">Write a Review</Button>
              </div>

              {/* Overall Rating Summary */}
              <div className="flex items-center gap-4 p-4 bg-secondary/30 rounded-lg">
                <div className="text-center">
                  <div className="text-3xl font-bold">4.7</div>
                  <div className="flex mt-1">
                    {[...Array(5)].map((_, index) => (
                      <Star
                        key={index}
                        className={`h-4 w-4 ${
                          index < 4 ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground"
                        }`}
                      />
                    ))}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Based on 128 reviews
                  </div>
                </div>
                <Separator orientation="vertical" className="h-16" />
                <div className="flex-1 space-y-1">
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <div key={rating} className="flex items-center gap-2">
                      <div className="text-sm font-medium w-2">{rating}</div>
                      <Star
                        className={`h-3 w-3 ${
                          rating >= 4
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-muted-foreground"
                        }`}
                      />
                      <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className={`h-full ${
                            rating >= 4 ? "bg-primary" : "bg-muted-foreground"
                          }`}
                          style={{
                            width:
                              rating === 5
                                ? "70%"
                                : rating === 4
                                ? "20%"
                                : rating === 3
                                ? "7%"
                                : rating === 2
                                ? "2%"
                                : "1%",
                          }}
                        ></div>
                      </div>
                      <div className="text-xs text-muted-foreground w-8">
                        {rating === 5
                          ? "70%"
                          : rating === 4
                          ? "20%"
                          : rating === 3
                          ? "7%"
                          : rating === 2
                          ? "2%"
                          : "1%"}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Review List */}
              <div className="space-y-6">
                {reviews.map((review) => (
                  <div key={review.id} className="pb-6 border-b last:border-0">
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">{review.username}</span>
                      <span className="text-sm text-muted-foreground">
                        {review.date}
                      </span>
                    </div>
                    <div className="flex mb-2">
                      {[...Array(5)].map((_, index) => (
                        <Star
                          key={index}
                          className={`h-4 w-4 ${
                            index < review.rating
                              ? "text-yellow-400 fill-yellow-400"
                              : "text-muted-foreground"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-muted-foreground">{review.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
};

export default ProductDetail;
