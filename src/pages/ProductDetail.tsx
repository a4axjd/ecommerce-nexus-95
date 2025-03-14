import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/ProductCard";
import { Minus, Plus, ShoppingBag, Tag, Clock, Check, ArrowRight, Heart, Star } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useProduct, useProducts } from "@/hooks/useProducts";
import { useStoreSettings } from "@/hooks/useStoreSettings";
import { formatPrice } from "@/lib/storeSettings";
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  Timestamp,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  getDoc,
  setDoc
} from "firebase/firestore";
import { db } from "@/lib/firebase";

interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: Timestamp;
}

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newReview, setNewReview] = useState({ rating: 5, comment: "" });
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [averageRating, setAverageRating] = useState(0);
  const [selectedImage, setSelectedImage] = useState("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");
  const { addToCart } = useCart();
  const { currentUser } = useAuth();
  const [recentlyViewed, setRecentlyViewed] = useState<string[]>([]);
  const { settings } = useStoreSettings();
  
  const { data: product, isLoading } = useProduct(id || "");
  const { data: allProducts = [] } = useProducts();
  
  useEffect(() => {
    if (product) {
      setSelectedImage(product.image);
      
      if (product.availableColors && product.availableColors.length > 0) {
        setSelectedColor(product.availableColors[0]);
      }
      
      if (product.availableSizes && product.availableSizes.length > 0) {
        setSelectedSize(product.availableSizes[0]);
      }
    }
  }, [product]);
  
  useEffect(() => {
    if (!id) return;
    
    const storedRecent = localStorage.getItem('recentlyViewed');
    const recentProducts = storedRecent ? JSON.parse(storedRecent) : [];
    
    if (!recentProducts.includes(id)) {
      const updatedRecent = [id, ...recentProducts].slice(0, 4);
      localStorage.setItem('recentlyViewed', JSON.stringify(updatedRecent));
      setRecentlyViewed(updatedRecent);
    } else {
      setRecentlyViewed(recentProducts);
    }
  }, [id]);
  
  const relatedProducts = allProducts
    .filter(p => p.id !== id && p.category === product?.category)
    .slice(0, 4);

  useEffect(() => {
    const fetchReviews = async () => {
      if (!id) return;
      
      try {
        const q = query(
          collection(db, "reviews"),
          where("productId", "==", id),
          orderBy("createdAt", "desc")
        );
        
        const querySnapshot = await getDocs(q);
        const reviewsData: Review[] = [];
        
        querySnapshot.forEach((doc) => {
          reviewsData.push({ id: doc.id, ...doc.data() } as Review);
        });
        
        setReviews(reviewsData);
        
        if (reviewsData.length > 0) {
          const totalRating = reviewsData.reduce((sum, review) => sum + review.rating, 0);
          setAverageRating(Math.round((totalRating / reviewsData.length) * 10) / 10);
        }
      } catch (error) {
        console.error("Error fetching reviews:", error);
      }
    };
    
    fetchReviews();
  }, [id]);
  
  useEffect(() => {
    const checkWishlist = async () => {
      if (!currentUser || !id) return;
      
      try {
        const userRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          const userData = userSnap.data();
          const wishlist = userData.wishlist || [];
          setIsInWishlist(wishlist.includes(id));
        }
      } catch (error) {
        console.error("Error checking wishlist:", error);
      }
    };
    
    checkWishlist();
  }, [currentUser, id]);
  
  const handleAddToWishlist = async () => {
    if (!currentUser) {
      toast.error("Please sign in to add items to your wishlist");
      return;
    }
    
    if (!id) return;
    
    try {
      const userRef = doc(db, "users", currentUser.uid);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        await setDoc(userRef, {
          email: currentUser.email,
          displayName: currentUser.displayName,
          wishlist: []
        });
      }
      
      if (isInWishlist) {
        await updateDoc(userRef, {
          wishlist: arrayRemove(id)
        });
        setIsInWishlist(false);
        toast.success("Removed from wishlist");
      } else {
        await updateDoc(userRef, {
          wishlist: arrayUnion(id)
        });
        setIsInWishlist(true);
        toast.success("Added to wishlist");
      }
    } catch (error) {
      console.error("Error updating wishlist:", error);
      toast.error("Failed to update wishlist");
    }
  };
  
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      toast.error("Please sign in to leave a review");
      return;
    }
    
    if (!id) return;
    
    try {
      const reviewData = {
        productId: id,
        userId: currentUser.uid,
        userName: currentUser.displayName || "Anonymous",
        rating: newReview.rating,
        comment: newReview.comment,
        createdAt: Timestamp.now()
      };
      
      await addDoc(collection(db, "reviews"), reviewData);
      
      toast.success("Review submitted successfully");
      
      const q = query(
        collection(db, "reviews"),
        where("productId", "==", id),
        orderBy("createdAt", "desc")
      );
      
      const querySnapshot = await getDocs(q);
      const reviewsData: Review[] = [];
      
      querySnapshot.forEach((doc) => {
        reviewsData.push({ id: doc.id, ...doc.data() } as Review);
      });
      
      setReviews(reviewsData);
      
      if (reviewsData.length > 0) {
        const totalRating = reviewsData.reduce((sum, review) => sum + review.rating, 0);
        setAverageRating(Math.round((totalRating / reviewsData.length) * 10) / 10);
      }
      
      setNewReview({ rating: 5, comment: "" });
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error("Failed to submit review");
    }
  };
  
  const handleAddToCart = () => {
    const variationInfo = selectedColor || selectedSize ? 
      `${selectedColor ? `Color: ${selectedColor}` : ""}${selectedColor && selectedSize ? ", " : ""}${selectedSize ? `Size: ${selectedSize}` : ""}` : 
      "";
    
    const productTitle = variationInfo ? `${product.title} (${variationInfo})` : product.title;
    
    addToCart({
      id: product.id,
      title: productTitle,
      price: product.price,
      image: product.image,
      quantity,
      color: selectedColor,
      size: selectedSize,
    });
    
    toast.success("Added to cart");
  };

  const getVariationPrice = () => {
    if (!product?.variations || !selectedColor || !selectedSize) return product?.price || 0;
    
    const variation = product.variations.find(v => 
      (!v.color || v.color === selectedColor) && 
      (!v.size || v.size === selectedSize)
    );
    
    return variation && variation.price_adjustment ? 
      product.price + variation.price_adjustment : 
      product.price;
  };

  const productPrice = getVariationPrice();

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow pt-24">
          <div className="container mx-auto px-4">
            <div className="animate-pulse">
              <div className="bg-gray-200 aspect-square w-full rounded-lg mb-4" />
              <div className="bg-gray-200 h-8 w-1/2 rounded mb-4" />
              <div className="bg-gray-200 h-4 w-3/4 rounded mb-4" />
              <div className="bg-gray-200 h-4 w-1/4 rounded" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow pt-24">
          <div className="container mx-auto px-4">
            <div className="text-center">Product not found</div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const allImages = product?.images || [product?.image];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="text-sm text-muted-foreground mb-6">
            <Link to="/" className="hover:text-primary">Home</Link>
            <span className="mx-2">/</span>
            <Link to="/products" className="hover:text-primary">Products</Link>
            <span className="mx-2">/</span>
            <span>{product?.title}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            <div className="space-y-4">
              <div className="aspect-square w-full overflow-hidden rounded-lg bg-gray-100 shadow-md relative">
                <img
                  src={selectedImage}
                  alt={product?.title}
                  className="h-full w-full object-cover transition-transform hover:scale-105 duration-500"
                />
                {product?.featured && (
                  <div className="absolute top-4 left-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-medium">
                    Featured
                  </div>
                )}
              </div>
              
              {allImages.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {allImages.map((img, index) => (
                    <button
                      key={index}
                      className={`h-20 w-20 flex-shrink-0 rounded-md overflow-hidden border-2 ${
                        selectedImage === img ? 'border-primary' : 'border-transparent'
                      }`}
                      onClick={() => setSelectedImage(img)}
                    >
                      <img 
                        src={img} 
                        alt={`${product?.title} - image ${index + 1}`} 
                        className="h-full w-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div>
                <div className="flex items-center mb-2">
                  <span className="px-2.5 py-0.5 bg-secondary text-secondary-foreground rounded-full text-xs font-medium mr-2">
                    {product?.category}
                  </span>
                  <div className="flex items-center text-amber-500">
                    {Array(5).fill(0).map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < Math.floor(averageRating) ? 'fill-amber-500' : 'fill-gray-200'}`} />
                    ))}
                    <span className="text-xs text-muted-foreground ml-1">
                      ({averageRating} • {reviews.length} reviews)
                    </span>
                  </div>
                </div>
                <h1 className="text-3xl font-semibold">{product?.title}</h1>
                <p className="text-2xl font-bold mt-2">{formatPrice(productPrice, settings)}</p>
              </div>

              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <Check className="h-4 w-4 mr-1 text-green-500" />
                  <span>In Stock</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>Ships in 1-2 days</span>
                </div>
              </div>

              <p className="text-gray-600 leading-relaxed">{product?.description}</p>

              {product?.availableColors && product.availableColors.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-medium">Color</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.availableColors.map((color, index) => (
                      <button
                        key={index}
                        className={`h-8 w-8 rounded-full border ${
                          selectedColor === color 
                            ? 'ring-2 ring-primary ring-offset-2' 
                            : 'ring-0'
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => setSelectedColor(color)}
                        aria-label={`Select ${color} color`}
                      />
                    ))}
                  </div>
                </div>
              )}

              {product?.availableSizes && product.availableSizes.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-medium">Size</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.availableSizes.map((size, index) => (
                      <button
                        key={index}
                        className={`h-10 min-w-10 px-3 rounded-md border ${
                          selectedSize === size 
                            ? 'bg-primary text-primary-foreground border-primary' 
                            : 'bg-white border-gray-300'
                        }`}
                        onClick={() => setSelectedSize(size)}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <h3 className="font-medium">Quantity</h3>
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-8 text-center">{quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleAddToCart}
                >
                  <ShoppingBag className="mr-2 h-5 w-5" />
                  Add to Cart
                </Button>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    className="w-full"
                    size="lg"
                    onClick={() => {
                      handleAddToCart();
                      navigate("/checkout");
                    }}
                  >
                    Buy Now
                  </Button>
                  <Button
                    variant={isInWishlist ? "default" : "outline"}
                    className={`w-full ${isInWishlist ? 'bg-red-500 hover:bg-red-600 border-red-500' : ''}`}
                    size="lg"
                    onClick={handleAddToWishlist}
                  >
                    <Heart className={`h-5 w-5 ${isInWishlist ? 'fill-white' : ''}`} />
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-4 border-t">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Tags:</span>
                <span className="text-sm bg-secondary px-2 py-1 rounded-full">{product?.category}</span>
                <span className="text-sm bg-secondary px-2 py-1 rounded-full">trending</span>
              </div>
            </div>
          </div>

          {relatedProducts.length > 0 && (
            <section className="mb-16">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold">Similar Products</h2>
                <Link to="/products" className="flex items-center text-primary text-sm font-medium hover:underline">
                  View all
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                {relatedProducts.map(product => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    title={product.title}
                    price={product.price}
                    image={product.image}
                    category={product.category}
                    featured={product.featured}
                  />
                ))}
              </div>
            </section>
          )}

          <div className="border-t pt-8">
            <div className="flex border-b mb-6 overflow-x-auto whitespace-nowrap">
              <button 
                className={`px-4 py-2 font-medium ${activeTab === "description" 
                  ? "text-primary border-b-2 border-primary" 
                  : "text-muted-foreground"}`}
                onClick={() => setActiveTab("description")}
              >
                Description
              </button>
              <button 
                className={`px-4 py-2 font-medium ${activeTab === "reviews" 
                  ? "text-primary border-b-2 border-primary" 
                  : "text-muted-foreground"}`}
                onClick={() => setActiveTab("reviews")}
              >
                Reviews ({reviews.length})
              </button>
              <button 
                className={`px-4 py-2 font-medium ${activeTab === "shipping" 
                  ? "text-primary border-b-2 border-primary" 
                  : "text-muted-foreground"}`}
                onClick={() => setActiveTab("shipping")}
              >
                Shipping & Returns
              </button>
            </div>

            {activeTab === "description" && (
              <div className="prose max-w-none">
                <p>{product?.description}</p>
                <p className="mt-4">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                </p>
                <ul className="mt-4">
                  <li>High-quality materials</li>
                  <li>Durable construction</li>
                  <li>Easy to clean and maintain</li>
                  <li>Perfect for everyday use</li>
                </ul>
              </div>
            )}

            {activeTab === "reviews" && (
              <div className="space-y-8">
                {reviews.length > 0 ? (
                  <div className="space-y-6">
                    {reviews.map((review) => (
                      <div key={review.id} className="border-b pb-6">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <div className="bg-primary text-primary-foreground h-10 w-10 rounded-full flex items-center justify-center font-semibold text-sm mr-3">
                              {review.userName.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-medium">{review.userName}</span>
                          </div>
                          <div className="flex items-center">
                            {Array(5).fill(0).map((_, i) => (
                              <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-amber-500' : 'fill-gray-200'}`} />
                            ))}
                          </div>
                        </div>
                        <p className="text-gray-600">{review.comment}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {review.createdAt.toDate().toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No reviews yet. Be the first to leave a review!
                  </div>
                )}

                <div className="bg-gray-50 p-6 rounded-lg">
                  {currentUser ? (
                    <form onSubmit={handleSubmitReview} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Rating</label>
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setNewReview({ ...newReview, rating: star })}
                              className="p-1"
                            >
                              <Star className={`w-6 h-6 ${star <= newReview.rating ? 'fill-amber-500 text-amber-500' : 'fill-gray-200 text-gray-200'}`} />
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <label htmlFor="comment" className="block text-sm font-medium mb-1">Your Review</label>
                        <textarea
                          id="comment"
                          rows={4}
                          value={newReview.comment}
                          onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                          className="w-full rounded-md border border-input bg-background px-3 py-2"
                          placeholder="Share your experience with this product..."
                          required
                        />
                      </div>
                      
                      <Button type="submit" className="mt-2">
                        Submit Review
                      </Button>
                    </form>
                  ) : (
                    <div className="text-center py-4">
                      <p className="mb-2">Please sign in to leave a review</p>
                      <Button asChild variant="outline">
                        <Link to="/sign-in">Sign In</Link>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "shipping" && (
              <div className="prose max-w-none">
                <h3>Shipping Information</h3>
                <p>
                  {product?.shippingInfo || "We ship to locations worldwide. Shipping times and costs will vary based on location. Standard shipping usually takes 3-7 business days within the continental United States."}
                </p>
                
                <h3 className="mt-6">Return Policy</h3>
                <p>
                  {product?.returnPolicy || "If you're not completely satisfied with your purchase, you may return it within 30 days of receipt for a full refund of the item price. To be eligible for a return, your item must be in the same condition that you received, unworn or unused, with tags, and in its original packaging."}
                </p>
                
                <h4 className="mt-4">How to Return</h4>
                <ol>
                  <li>Contact our customer service team to obtain a return authorization</li>
                  <li>Package your item securely</li>
                  <li>Include your order number and return reason</li>
                  <li>Ship the item to the address provided</li>
                </ol>
                
                <p className="text-sm text-muted-foreground mt-4">
                  Please note that shipping costs for returns are the responsibility of the customer unless 
                  the item received was defective or incorrect.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProductDetail;
