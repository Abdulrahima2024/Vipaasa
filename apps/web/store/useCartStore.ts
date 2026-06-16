import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useAuthStore } from "./authStore";

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
      items: [],
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
      onRehydrateStorage: () => (state) => {
        if (state) {
          const user = useAuthStore.getState().user;
          if (user) {
            const savedCart = localStorage.getItem(`vipaasa-cart-user-${user.id}`);
            if (savedCart) {
              try {
                const parsed = JSON.parse(savedCart);
                state.items = parsed.items || [];
                state.savedItems = parsed.savedItems || [];
              } catch (e) {
                console.error("Error parsing saved cart during rehydration", e);
              }
            } else {
              state.items = [];
              state.savedItems = [];
            }
          }
        }
      }
    }
  )
);

// Subscribe to auth store changes to sync cart per user
if (typeof window !== "undefined") {
  let prevUser: any = null;

  // Set initial prevUser if already hydrated/loaded
  prevUser = useAuthStore.getState().user;

  useAuthStore.subscribe((state) => {
    const user = state.user;

    if (user && (!prevUser || prevUser.id !== user.id)) {
      // User logged in or switched
      const guestCartItems = useCartStore.getState().items;
      const guestSavedItems = useCartStore.getState().savedItems;

      const savedCart = localStorage.getItem(`vipaasa-cart-user-${user.id}`);
      let userItems: CartItem[] = [];
      let userSavedItems: CartItem[] = [];

      if (savedCart) {
        try {
          const parsed = JSON.parse(savedCart);
          userItems = parsed.items || [];
          userSavedItems = parsed.savedItems || [];
        } catch (e) {
          console.error("Error parsing saved cart", e);
        }
      }

      // Merge guest items into user items (avoiding duplicates based on product ID & weight)
      const mergedItems = [...userItems];
      guestCartItems.forEach((gItem) => {
        const existing = mergedItems.find((uItem) => uItem.id === gItem.id);
        if (existing) {
          existing.quantity += gItem.quantity;
        } else {
          mergedItems.push(gItem);
        }
      });

      const mergedSaved = [...userSavedItems];
      guestSavedItems.forEach((gItem) => {
        const existing = mergedSaved.find((uItem) => uItem.id === gItem.id);
        if (!existing) {
          mergedSaved.push(gItem);
        }
      });

      // Save merged cart back to user's storage
      localStorage.setItem(
        `vipaasa-cart-user-${user.id}`,
        JSON.stringify({
          items: mergedItems,
          savedItems: mergedSaved,
        })
      );

      useCartStore.setState({
        items: mergedItems,
        savedItems: mergedSaved,
      });
    } else if (!user && prevUser) {
      // User logged out
      // Save current cart before clearing
      const currentCart = useCartStore.getState();
      localStorage.setItem(
        `vipaasa-cart-user-${prevUser.id}`,
        JSON.stringify({
          items: currentCart.items,
          savedItems: currentCart.savedItems,
        })
      );
      // Clear the cart
      useCartStore.setState({ items: [], savedItems: [] });
    }

    prevUser = user;
  });

  // Subscribe to cart changes to save to user persistent storage
  useCartStore.subscribe((state) => {
    const user = useAuthStore.getState().user;
    if (user) {
      localStorage.setItem(
        `vipaasa-cart-user-${user.id}`,
        JSON.stringify({
          items: state.items,
          savedItems: state.savedItems,
        })
      );
    }
  });
}
