
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/storeSettings";
import { useStoreSettings } from "@/hooks/useStoreSettings";

interface ProductCardProps {
  id: string;
  title: string;
  price: number;
  image: string;
  category: string;
  featured?: boolean;
}

export const ProductCard = ({
  id,
  title,
  price,
  image,
  category,
  featured = false,
}: ProductCardProps) => {
  const { addToCart } = useCart();
  const { settings } = useStoreSettings();
  
  const handleAddToCart = () => {
    addToCart({
      id,
      title,
      price,
      image,
      quantity: 1,
      category,
    });
  };

  return (
    <div className="group relative overflow-hidden rounded-lg border bg-background transition-all hover:shadow-md">
      {featured && (
        <Badge className="absolute left-2 top-2 z-10" variant="secondary">
          Featured
        </Badge>
      )}
      <Link to={`/product/${id}`} className="block overflow-hidden">
        <div className="aspect-square overflow-hidden bg-secondary/30">
          <img
            src={image || "/placeholder.svg"}
            alt={title}
            className="h-full w-full object-cover transition-all group-hover:scale-105"
          />
        </div>
      </Link>
      <div className="p-4">
        <Link to={`/product/${id}`}>
          <h3 className="font-medium line-clamp-1 hover:underline">{title}</h3>
        </Link>
        <div className="mt-1 flex items-center justify-between">
          <span className="font-semibold">
            {formatPrice(price, settings)}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={handleAddToCart}
            title="Add to Cart"
          >
            <ShoppingCart className="h-4 w-4" />
            <span className="sr-only">Add to cart</span>
          </Button>
        </div>
        <div className="mt-1">
          <Badge variant="outline" className="text-xs">
            {category}
          </Badge>
        </div>
      </div>
    </div>
  );
};
