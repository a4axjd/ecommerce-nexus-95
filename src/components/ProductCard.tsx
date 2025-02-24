
import { Link } from "react-router-dom";

interface ProductCardProps {
  id: string;
  title: string;
  price: number;
  image: string;
}

export const ProductCard = ({ id, title, price, image }: ProductCardProps) => {
  return (
    <Link
      to={`/products/${id}`}
      className="group relative overflow-hidden rounded-lg animate-slide-in"
    >
      <div className="aspect-square w-full overflow-hidden bg-gray-100 relative">
        <img
          src={image}
          alt={title}
          className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      <div className="mt-4 space-y-1">
        <h3 className="text-sm font-medium text-gray-900">{title}</h3>
        <p className="text-sm text-gray-700">${price.toFixed(2)}</p>
      </div>
    </Link>
  );
};
