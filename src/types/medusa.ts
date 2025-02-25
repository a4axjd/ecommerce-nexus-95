
export interface MedusaProduct {
  id: string;
  title: string;
  handle: string;
  description: string;
  thumbnail: string;
  variants: ProductVariant[];
  collection_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProductVariant {
  id: string;
  title: string;
  prices: {
    id: string;
    currency_code: string;
    amount: number;
  }[];
  inventory_quantity: number;
}

export interface MedusaCollection {
  id: string;
  title: string;
  handle: string;
}

export interface CartItem {
  variant_id: string;
  quantity: number;
}

export interface Cart {
  id: string;
  items: CartItem[];
}
