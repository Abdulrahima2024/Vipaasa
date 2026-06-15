import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  id: string; // product.id + '-' + weight
  productId: string;
  name: string;
  description: string;
  spec: string;
  price: number;
  quantity: number;
  image: string;
  weight: "1kg" | "500g" | "250g";
  saved: boolean;
}

interface CartStore {
  items: CartItem[];
  savedItems: CartItem[];
  favorites: string[];
  animatingProductId: string | null;
  addToCart: (product: any, weight: "1kg" | "500g" | "250g", quantityToAdd?: number) => void;
  updateQuantity: (id: string, delta: number) => void;
  removeItem: (id: string) => void;
  saveForLater: (id: string) => void;
  moveToCart: (id: string) => void;
  removeSavedItem: (id: string) => void;
  toggleFavorite: (productId: string) => void;
  setAnimatingProductId: (id: string | null) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      items: [
        {
          id: "1-250g",
          productId: "1",
          name: "Organic Lakadong Turmeric",
          description: "Pure Hand-ground",
          spec: "250g • Pure Hand-ground",
          price: 18,
          quantity: 1,
          image: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&q=80&w=400",
          weight: "250g",
          saved: false,
        },
        {
          id: "37-500g",
          productId: "37",
          name: "Wild Forest Honey",
          description: "Cold Pressed",
          spec: "500g • Cold Pressed",
          price: 24,
          quantity: 2,
          image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&q=80&w=400",
          weight: "500g",
          saved: false,
        },
      ],
      savedItems: [],
      favorites: [],
      animatingProductId: null,
      
      addToCart: (product, weight, quantityToAdd = 1) =>
        set((state) => {
          const cartItemId = `${product.id}-${weight}`;
          const existingItem = state.items.find((item) => item.id === cartItemId);
          
          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item.id === cartItemId ? { ...item, quantity: item.quantity + quantityToAdd } : item
              ),
            };
          }
          
          const price = product.prices[weight];
          const newItem: CartItem = {
            id: cartItemId,
            productId: product.id,
            name: product.name,
            description: product.category,
            spec: `${weight} • Pure Organic`,
            price: price,
            quantity: quantityToAdd,
            image: product.image,
            weight: weight,
            saved: false,
          };
          
          return { items: [...state.items, newItem] };
        }),
        
      updateQuantity: (id, delta) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
          ),
        })),
        
      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        })),
        
      saveForLater: (id) =>
        set((state) => {
          const itemToSave = state.items.find((item) => item.id === id);
          if (!itemToSave) return {};
          return {
            items: state.items.filter((item) => item.id !== id),
            savedItems: [...state.savedItems, { ...itemToSave, saved: true }],
          };
        }),
        
      moveToCart: (id) =>
        set((state) => {
          const itemToMove = state.savedItems.find((item) => item.id === id);
          if (!itemToMove) return {};
          return {
            savedItems: state.savedItems.filter((item) => item.id !== id),
            items: [...state.items, { ...itemToMove, saved: false }],
          };
        }),
        
      removeSavedItem: (id) =>
        set((state) => ({
          savedItems: state.savedItems.filter((item) => item.id !== id),
        })),
        
      toggleFavorite: (productId) =>
        set((state) => {
          const isFav = state.favorites.includes(productId);
          let favorites = [...state.favorites];
          let animatingProductId = state.animatingProductId;
          
          if (isFav) {
            favorites = favorites.filter((id) => id !== productId);
          } else {
            if (favorites.length === 0) {
              animatingProductId = productId;
            }
            favorites.push(productId);
          }
          
          return { favorites, animatingProductId };
        }),
        
      setAnimatingProductId: (id) => set({ animatingProductId: id }),
      
      clearCart: () => set({ items: [] }),
    }),
    {
      name: "vipaasa-cart-storage",
    }
  )
);
