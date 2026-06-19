export interface CartItemResponse {
  id: string; // The database cartItem.id
  productId: string; // This corresponds to the variantId from the database
  productName: string; // The descriptive product variant name
  quantity: number;
  unitPrice: number;
  subtotal: number;
  image: string;
  categoryName: string;
  weightGrams: number;
}


export interface CartResponse {
  cartId: string;
  items: CartItemResponse[];
  totalAmount: number;
}

export interface AddToCartInput {
  productId: string;
  quantity: number;
}

export interface UpdateCartItemInput {
  quantity: number;
}
