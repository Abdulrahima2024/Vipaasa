import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useAuthStore } from "./authStore";
import { fetchApi } from "../lib/api";

let cachedProducts: any[] | null = null;

async function getCachedProducts(): Promise<any[]> {
  if (cachedProducts) return cachedProducts;
  try {
    const productsData = await fetchApi<any>("/api/products?limit=100");
    cachedProducts = productsData?.items || [];
    return cachedProducts || [];
  } catch (e) {
    console.error("Failed to fetch products for cart caching:", e);
    return [];
  }
}


export interface CartItem {
  id: string; // product.id + '-' + weight (guest) OR variantId (authenticated)
  productId: string;
  variantId?: string; // variant ID from database
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
  fetchCart: () => Promise<void>;
  mergeGuestCart: (guestItems: CartItem[]) => Promise<void>;
  addToCart: (product: any, weight: "1kg" | "500g" | "250g", quantityToAdd?: number) => Promise<void>;
  updateQuantity: (id: string, delta: number) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  saveForLater: (id: string) => void;
  moveToCart: (id: string) => void;
  removeSavedItem: (id: string) => void;
  toggleFavorite: (productId: string) => void;
  setAnimatingProductId: (id: string | null) => void;
  clearCart: () => Promise<void>;
}

const mapBackendCartToFrontend = (backendCart: any): CartItem[] => {
  return (backendCart?.items || []).map((item: any) => {
    const grams = item.weightGrams || 250;
    const weight: "1kg" | "500g" | "250g" = grams === 1000 ? "1kg" : grams === 500 ? "500g" : "250g";
    const image = item.image || "/placeholder.jpg";
    const description = item.categoryName || "General";
    const spec = `${weight} • Pure Organic`;

    return {
      id: item.id, // Use actual database CartItem ID for update/delete
      productId: item.productId,
      variantId: item.productId,
      name: item.productName || "Product",
      description,
      spec,
      price: item.unitPrice,
      quantity: item.quantity,
      image,
      weight,
      saved: false,
    };
  });
};

const syncCartToBackend = async (items: CartItem[], allProducts: any[]) => {
  // 1. Clear cart
  await fetchApi("/api/cart", { method: "DELETE" });
  // 2. Re-add items sequentially
  for (const item of items) {
    let variantId = item.variantId;
    if (!variantId && item.productId) {
      const parentProduct = allProducts.find((p: any) => p.id === item.productId);
      if (parentProduct && parentProduct.variants) {
        const grams = item.weight === "1kg" ? 1000 : item.weight === "500g" ? 500 : 250;
        const variant = parentProduct.variants.find((v: any) => v.weightGrams === grams);
        variantId = variant?.id;
      }
    }

    if (variantId) {
      await fetchApi("/api/cart/items", {
        method: "POST",
        body: JSON.stringify({ productId: variantId, quantity: item.quantity }),
      });
    }
  }
};

export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      items: [],
      savedItems: [],
      favorites: [],
      animatingProductId: null,

      fetchCart: async () => {
        const user = useAuthStore.getState().user;
        if (user) {
          try {
            const data = await fetchApi<any>("/api/cart");
            if (data) {
              set({ items: mapBackendCartToFrontend(data) });
            }
          } catch (e) {
            console.error("Error fetching cart from backend", e);
          }
        }
      },

      mergeGuestCart: async (guestItems) => {
        if (guestItems.length === 0) return;
        try {
          const productsData = await fetchApi<any>("/api/products?limit=100");
          const allProducts = productsData?.items || [];
          const userCart = await fetchApi<any>("/api/cart");
          const userItemsMapped = mapBackendCartToFrontend(userCart);

          // Merge guest items into user items
          const mergedItems = [...userItemsMapped];
          for (const gItem of guestItems) {
            let variantId = gItem.variantId;
            const grams = gItem.weight === "1kg" ? 1000 : gItem.weight === "500g" ? 500 : 250;

            if (!variantId && gItem.productId) {
              const parentProduct = allProducts.find((p: any) => p.id === gItem.productId);
              if (parentProduct && parentProduct.variants) {
                const variant = parentProduct.variants.find((v: any) => v.weightGrams === grams);
                variantId = variant?.id;
              }
            }

            if (variantId) {
              const existing = mergedItems.find((uItem) => uItem.variantId === variantId);
              if (existing) {
                existing.quantity += gItem.quantity;
              } else {
                mergedItems.push({
                  ...gItem,
                  id: variantId,
                  variantId,
                });
              }
            }
          }

          // Sync merged cart to backend
          await syncCartToBackend(mergedItems, allProducts);
        } catch (e) {
          console.error("Error merging guest cart", e);
        }
      },

      addToCart: async (product, weight, quantityToAdd = 1) => {
        const user = useAuthStore.getState().user;
        console.log("[useCartStore] addToCart action invoked. User authenticated:", !!user, "Product:", product.name, "Weight:", weight, "Quantity:", quantityToAdd);
        let grams = weight === "1kg" ? 1000 : weight === "500g" ? 500 : 250;
        let variantId: string | null = null;

        // Try to find variant ID from product object
        if (product.variants && Array.isArray(product.variants) && product.variants.length > 0) {
          const variant = product.variants.find((v: any) => v.weightGrams === grams) || product.variants[0];
          variantId = variant?.id || null;
          const resolvedGrams = variant?.weightGrams || 250;
          weight = resolvedGrams === 1000 ? "1kg" : resolvedGrams === 500 ? "500g" : "250g";
          grams = resolvedGrams;
        }

        if (user) {
          // Resolve variantId from backend if not present
          if (!variantId && product.id && !product.id.startsWith("bundle-") && !product.id.startsWith("mock-")) {
            try {
              const raw = await fetchApi<any>(`/api/products/${product.id}`);
              if (raw && raw.variants && raw.variants.length > 0) {
                const variant = raw.variants.find((v: any) => v.weightGrams === grams) || raw.variants[0];
                variantId = variant?.id || null;
                const resolvedGrams = variant?.weightGrams || 250;
                weight = resolvedGrams === 1000 ? "1kg" : resolvedGrams === 500 ? "500g" : "250g";
                grams = resolvedGrams;
              }
            } catch (e) {
              console.error("Failed to fetch product details to retrieve variant ID:", e);
            }
          }

          console.log("[useCartStore] Resolved variantId for backend cart:", variantId);

          if (variantId) {
            try {
              console.log("[useCartStore] Making POST /api/cart/items request to add item:", { variantId, quantity: quantityToAdd });
              const res = await fetchApi<any>("/api/cart/items", {
                method: "POST",
                body: JSON.stringify({ productId: variantId, quantity: quantityToAdd }),
              });
              console.log("[useCartStore] Backend response for adding item to cart (returned updated cart):", res);
              
              const mapped = mapBackendCartToFrontend(res);
              console.log("[useCartStore] Client-side mapped cart items for rendering:", mapped);
              set({ items: mapped });
            } catch (e: any) {
              console.error("Error adding item to backend cart:", e);
              alert(e.message || "Failed to add item to cart. It might be out of stock.");
            }
          } else {
            console.warn("[useCartStore] Failed to add to cart: Could not resolve a product variant ID in the database for weight:", weight, "on product:", product);
            alert("Could not resolve a product variant ID for this product weight.");
          }
        } else {
          // Guest mode: local state update
          console.log("[useCartStore] Added product to FRONTEND guest cart (localStorage only):", product.name, "weight:", weight);
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
              variantId: variantId || undefined,
              name: product.name,
              description: product.category || "",
              spec: `${weight} • Pure Organic`,
              price: price,
              quantity: quantityToAdd,
              image: product.image,
              weight: weight,
              saved: false,
            };

            return { items: [...state.items, newItem] };
          });
        }
      },

      updateQuantity: async (id, delta) => {
        const user = useAuthStore.getState().user;
        if (user) {
          const state = useCartStore.getState();
          const currentItem = state.items.find(item => item.id === id);
          if (!currentItem) return;

          const oldQty = currentItem.quantity;
          const newQty = Math.max(1, currentItem.quantity + delta);

          // Optimistically update frontend state
          set((state) => ({
            items: state.items.map((item) =>
              item.id === id ? { ...item, quantity: newQty } : item
            ),
          }));

          try {
            const res = await fetchApi<any>(`/api/cart/items/${id}`, {
              method: "PUT",
              body: JSON.stringify({ quantity: newQty }),
            });
            set({ items: mapBackendCartToFrontend(res) });
          } catch (e) {
            console.error("Error updating quantity in backend cart:", e);
            // Rollback on error
            set((state) => ({
              items: state.items.map((item) =>
                item.id === id ? { ...item, quantity: oldQty } : item
              ),
            }));
          }
        } else {
          set((state) => ({
            items: state.items.map((item) =>
              item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
            ),
          }));
        }
      },

      removeItem: async (id) => {
        const user = useAuthStore.getState().user;
        const state = useCartStore.getState();
        const itemToRemove = state.items.find(item => item.id === id);
        if (!itemToRemove) return;

        if (user) {
          // Optimistically update frontend state
          set((state) => ({
            items: state.items.filter((item) => item.id !== id),
          }));

          try {
            const res = await fetchApi<any>(`/api/cart/items/${id}`, {
              method: "DELETE",
            });
            set({ items: mapBackendCartToFrontend(res) });
          } catch (e) {
            console.error("Error removing item from backend cart:", e);
            // Rollback on error
            set((state) => ({
              items: [...state.items, itemToRemove],
            }));
          }
        } else {
          set((state) => ({
            items: state.items.filter((item) => item.id !== id),
          }));
        }
      },

      saveForLater: (id) =>
        set((state) => {
          const itemToSave = state.items.find((item) => item.id === id);
          if (!itemToSave) return {};

          const user = useAuthStore.getState().user;
          if (user) {
            // Remove item from backend cart
            const productsData = fetchApi<any>("/api/products?limit=100");
            const updatedItems = state.items.filter((item) => item.id !== id);
            productsData.then((pData) => {
              syncCartToBackend(updatedItems, pData?.items || []).catch((e) =>
                console.error("Error syncing cart for saveForLater:", e)
              );
            });
          }

          return {
            items: state.items.filter((item) => item.id !== id),
            savedItems: [...state.savedItems, { ...itemToSave, saved: true }],
          };
        }),

      moveToCart: (id) =>
        set((state) => {
          const itemToMove = state.savedItems.find((item) => item.id === id);
          if (!itemToMove) return {};

          const user = useAuthStore.getState().user;
          if (user) {
            const productsData = fetchApi<any>("/api/products?limit=100");
            const updatedItems = [...state.items, { ...itemToMove, saved: false }];
            productsData.then((pData) => {
              syncCartToBackend(updatedItems, pData?.items || [])
                .then(() => {
                  useCartStore.getState().fetchCart();
                })
                .catch((e) => console.error("Error syncing cart for moveToCart:", e));
            });
          }

          return {
            savedItems: state.savedItems.filter((item) => item.id !== id),
            items: user ? state.items : [...state.items, { ...itemToMove, saved: false }],
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

      clearCart: async () => {
        const user = useAuthStore.getState().user;
        if (user) {
          try {
            await fetchApi<any>("/api/cart", {
              method: "DELETE",
            });
            set({ items: [] });
          } catch (e) {
            console.error("Error clearing backend cart:", e);
          }
        } else {
          set({ items: [] });
        }
      },
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
                state.savedItems = parsed.savedItems || [];
              } catch (e) {
                console.error("Error parsing saved cart during rehydration", e);
              }
            } else {
              state.savedItems = [];
            }
            // Fetch backend cart to populate items
            state.fetchCart();
          }
        }
      },
    }
  )
);

// Subscribe to auth store changes to sync cart per user
if (typeof window !== "undefined") {
  let prevUser: any = null;

  // Set initial prevUser if already hydrated/loaded
  prevUser = useAuthStore.getState().user;

  if (prevUser) {
    useCartStore.getState().fetchCart();
  }

  useAuthStore.subscribe((state) => {
    const user = state.user;

    if (user && (!prevUser || prevUser.id !== user.id)) {
      // User logged in or switched
      const guestCartItems = useCartStore.getState().items;

      useCartStore
        .getState()
        .mergeGuestCart(guestCartItems)
        .then(() => {
          useCartStore.getState().fetchCart();
        });
    } else if (!user && prevUser) {
      // User logged out
      useCartStore.setState({ items: [], savedItems: [] });
    }

    prevUser = user;
  });

  // Subscribe to cart changes to save savedItems to local storage
  useCartStore.subscribe((state) => {
    const user = useAuthStore.getState().user;
    if (user) {
      localStorage.setItem(
        `vipaasa-cart-user-${user.id}`,
        JSON.stringify({
          savedItems: state.savedItems,
        })
      );
    }
  });
}
