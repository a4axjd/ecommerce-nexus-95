
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Heart, Eye } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";

interface ProductCardProps {
  id: string;
  title: string;
  price: number;
  image: string;
  category?: string;
  featured?: boolean;
}

export const ProductCard = ({ id, title, price, image, category, featured }: ProductCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const { addToCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    addToCart({
      id,
      title,
      price,
      image,
      quantity: 1,
    });
    
    toast.success("Added to cart");
  };
  
  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toast.success("Added to wishlist");
  };
  
  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toast.info("Quick view not implemented");
  };

  return (
    <Link
      to={`/products/${id}`}
      className="group relative overflow-hidden rounded-lg shadow-sm border animate-slide-in transition-all duration-300 hover:shadow-md bg-white"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="aspect-square w-full overflow-hidden bg-gray-100 relative">
        <img
          src={image}
          alt={title}
          className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110"
        />
        
        {/* Featured badge */}
        {featured && (
          <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs font-medium px-2 py-1 rounded-full">
            Featured
          </div>
        )}
        
        {/* Category tag */}
        {category && (
          <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
            {category}
          </div>
        )}
        
        {/* Quick action buttons */}
        <div className={`absolute bottom-2 inset-x-2 flex items-center justify-center gap-2 transition-all duration-300 ${
          isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}>
          <Button 
            size="icon" 
            variant="secondary" 
            className="h-8 w-8 bg-white hover:bg-primary hover:text-white transition-colors shadow-sm"
            onClick={handleWishlist}
          >
            <Heart className="h-4 w-4" />
          </Button>
          <Button 
            size="sm" 
            className="bg-white text-foreground hover:bg-primary hover:text-white transition-colors shadow-sm"
            onClick={handleAddToCart}
          >
            <ShoppingCart className="h-4 w-4 mr-1" />
            Add to Cart
          </Button>
          <Button 
            size="icon" 
            variant="secondary" 
            className="h-8 w-8 bg-white hover:bg-primary hover:text-white transition-colors shadow-sm"
            onClick={handleQuickView}
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-1 line-clamp-1 group-hover:text-primary transition-colors">
          {title}
        </h3>
        <p className="text-sm font-semibold text-gray-900">${price.toFixed(2)}</p>
      </div>
    </Link>
  );
};
