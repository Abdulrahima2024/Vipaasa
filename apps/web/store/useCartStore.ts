import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useAuthStore } from "./authStore";
import { fetchApi } from "../lib/api";
import { useToastStore } from "./useToastStore";

let cachedProducts: any[] | null = null;
let debounceTimeouts: Record<string, any> = {};
let latestTransactionId: Record<string, number> = {};

async function getCachedProducts(): Promise<any[]> {
  if (cachedProducts) return cachedProducts;
  try {
    const productsData = await fetchApi<any>("/api/products?limit=100");
    cachedProducts = productsData?.items || [];
    return cachedProducts || [];
  } catch (e) {
    console.warn("Failed to fetch products for cart caching:", e);
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
  updatingItemId: string | null;
  actionItemId: string | null;
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

// syncCartToBackend removed (optimized out to avoid full cart clear/re-add and heavy product list queries)

export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      items: [],
      savedItems: [],
      favorites: [],
      animatingProductId: null,
      updatingItemId: null,
      actionItemId: null,

      fetchCart: async () => {
        const { user, token } = useAuthStore.getState();
        if (user && token) {
          try {
            const data = await fetchApi<any>("/api/cart");
            if (data) {
              set({ items: mapBackendCartToFrontend(data) });
            }
          } catch (e) {
            console.warn("Error fetching cart from backend", e);
          }
        }
      },

      mergeGuestCart: async (guestItems) => {
        if (guestItems.length === 0) return;
        const allProducts = await getCachedProducts();

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

          if (!variantId) continue;

          // Each item is merged independently so one stock error doesn't break the whole merge
          try {
            await fetchApi("/api/cart/items", {
              method: "POST",
              body: JSON.stringify({ productId: variantId, quantity: gItem.quantity }),
            });
          } catch (e: any) {
            console.warn(`[mergeGuestCart] Failed to merge item ${gItem.name} (qty: ${gItem.quantity}):`, e.message);
            // If quantity exceeds stock, retry with quantity 1 as a safe fallback
            if (e.message && (e.message.toLowerCase().includes("stock") || e.message.toLowerCase().includes("quantity"))) {
              try {
                await fetchApi("/api/cart/items", {
                  method: "POST",
                  body: JSON.stringify({ productId: variantId, quantity: 1 }),
                });
                console.info(`[mergeGuestCart] Retried ${gItem.name} with quantity 1 due to stock limit.`);
              } catch (retryErr: any) {
                console.warn(`[mergeGuestCart] Retry also failed for ${gItem.name}:`, retryErr.message);
              }
            }
          }
        }
      },

      addToCart: async (product, weight, quantityToAdd = 1) => {
        const user = useAuthStore.getState().user;
        console.log("[useCartStore] addToCart action invoked. User authenticated:", !!user, "Product:", product.name, "Weight:", weight, "Quantity:", quantityToAdd);
        let grams = weight === "1kg" ? 1000 : weight === "500g" ? 500 : 250;
        let variantId: string | null = null;
        let matchedVariant: any = null;

        // Try to find variant ID from product object
        if (product.variants && Array.isArray(product.variants) && product.variants.length > 0) {
          matchedVariant = product.variants.find((v: any) => v.weightGrams === grams) || product.variants[0];
          variantId = matchedVariant?.id || null;
          const resolvedGrams = matchedVariant?.weightGrams || 250;
          weight = resolvedGrams === 1000 ? "1kg" : resolvedGrams === 500 ? "500g" : "250g";
          grams = resolvedGrams;
        }

        if (user) {
          // Resolve variantId from backend if not present
          if (!variantId && product.id && !product.id.startsWith("bundle-") && !product.id.startsWith("mock-")) {
            try {
              const raw = await fetchApi<any>(`/api/products/${product.id}`);
              if (raw && raw.variants && raw.variants.length > 0) {
                matchedVariant = raw.variants.find((v: any) => v.weightGrams === grams) || raw.variants[0];
                variantId = matchedVariant?.id || null;
                const resolvedGrams = matchedVariant?.weightGrams || 250;
                weight = resolvedGrams === 1000 ? "1kg" : resolvedGrams === 500 ? "500g" : "250g";
                grams = resolvedGrams;
              }
            } catch (e) {
              console.warn("Failed to fetch product details to retrieve variant ID:", e);
            }
          }

          console.log("[useCartStore] Resolved variantId for backend cart:", variantId);

          if (variantId) {
            const state = useCartStore.getState();
            if (state.actionItemId === variantId) {
              console.log("[useCartStore] Already adding variant, ignoring duplicate add request:", variantId);
              return;
            }
            set({ actionItemId: variantId });

            // Optimistically update frontend state immediately
            const previousItems = useCartStore.getState().items;

            // Client-side stock validation
            if (matchedVariant && matchedVariant.inventories) {
              const availableStock = matchedVariant.inventories.reduce(
                (sum: number, inv: any) => sum + (inv.quantityOnHand - inv.quantityReserved),
                0
              );
              const existingItem = previousItems.find((item) => item.productId === variantId || item.id === variantId);
              const currentCartQty = existingItem?.quantity || 0;
              if (currentCartQty + quantityToAdd > availableStock) {
                useToastStore.getState().showToast(`Only ${availableStock} items are in stock.`, "warning");
                set({ actionItemId: null });
                return;
              }
            }

            const cartItemId = variantId;
            const existingItem = previousItems.find((item) => item.productId === variantId || item.id === variantId);

            let optimisticItems: CartItem[];
            if (existingItem) {
              optimisticItems = previousItems.map((item) =>
                item.productId === variantId || item.id === variantId
                  ? { ...item, quantity: item.quantity + quantityToAdd }
                  : item
              );
            } else {
              const price = product.prices[weight] || 0;
              const newItem: CartItem = {
                id: cartItemId, // Temporary id matching variantId
                productId: variantId,
                variantId: variantId,
                name: product.name,
                description: product.category || "General",
                spec: `${weight} • Pure Organic`,
                price: price,
                quantity: quantityToAdd,
                image: product.image || "/placeholder.jpg",
                weight: weight,
                saved: false,
              };
              optimisticItems = [...previousItems, newItem];
            }

            set({ items: optimisticItems });

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
              console.warn("Error adding item to backend cart:", e);
              // Rollback to previous items state on error
              set({ items: previousItems });
              if (e?.message && !e.message.includes("token")) {
                let alertMsg = e.message;
                const match = e.message.match(/available stock is (\d+)/i);
                if (match && match[1]) {
                  alertMsg = `Only ${match[1]} items are in stock.`;
                }
                useToastStore.getState().showToast(alertMsg, "warning");
              }
            } finally {
              set({ actionItemId: null });
            }
          } else {
            console.warn("[useCartStore] Failed to add to cart: Could not resolve a product variant ID in the database for weight:", weight, "on product:", product);
            // Alert removed to prevent ugly popups
          }
        } else {
          // Guest mode: local state update
          console.log("[useCartStore] Added product to FRONTEND guest cart (localStorage only):", product.name, "weight:", weight);
          
          // Client-side stock check for guest mode
          if (matchedVariant && matchedVariant.inventories) {
            const availableStock = matchedVariant.inventories.reduce(
              (sum: number, inv: any) => sum + (inv.quantityOnHand - inv.quantityReserved),
              0
            );
            const cartItemId = `${product.id}-${weight}`;
            const existingItem = useCartStore.getState().items.find((item) => item.id === cartItemId);
            const currentCartQty = existingItem?.quantity || 0;
            if (currentCartQty + quantityToAdd > availableStock) {
              useToastStore.getState().showToast(`Only ${availableStock} items are in stock.`, "warning");
              return;
            }
          }

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
        const state = useCartStore.getState();
        if (state.actionItemId === id) return;

        const previousItems = state.items;
        const currentItem = previousItems.find(item => item.id === id);
        if (!currentItem) return;

        const newQty = Math.max(1, currentItem.quantity + delta);

        // Client-side stock check when increasing quantity
        if (delta > 0) {
          try {
            const allProducts = await getCachedProducts();
            const parentProduct = allProducts.find(
              (p) =>
                p.id === currentItem.productId ||
                p.variants?.some((v: any) => v.id === currentItem.variantId || v.id === currentItem.productId)
            );
            const grams = currentItem.weight === "1kg" ? 1000 : currentItem.weight === "500g" ? 500 : 250;
            const matchedVariant = parentProduct?.variants?.find(
              (v: any) => v.weightGrams === grams || v.id === currentItem.variantId
            );

            if (matchedVariant && matchedVariant.inventories) {
              const availableStock = matchedVariant.inventories.reduce(
                (sum: number, inv: any) => sum + (inv.quantityOnHand - inv.quantityReserved),
                0
              );
              if (newQty > availableStock) {
                useToastStore.getState().showToast(`Only ${availableStock} items are in stock.`, "warning");
                return;
              }
            }
          } catch (err) {
            console.warn("Client-side stock check failed in updateQuantity:", err);
          }
        }

        // Optimistically update frontend state immediately (lightning-fast UI feedback)
        set({
          items: previousItems.map((item) =>
            item.id === id ? { ...item, quantity: newQty } : item
          ),
        });

        if (!user) {
          // Guest mode is purely client-side
          return;
        }

        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
        
        if (!isUuid) {
          try {
            // Sync backend cart first to resolve the actual database UUID
            await state.fetchCart();
            const updatedItems = useCartStore.getState().items;
            const resolvedItem = updatedItems.find(item => item.productId === currentItem.productId);
            if (resolvedItem && resolvedItem.id !== id) {
              await useCartStore.getState().updateQuantity(resolvedItem.id, delta);
            }
          } catch (err) {
            console.warn("Failed to resolve database ID for cart item quantity update:", err);
          }
          return;
        }

        // Debounce the backend API sync to allow rapid clicks
        if (debounceTimeouts[id]) {
          clearTimeout(debounceTimeouts[id]);
        }

        set({ updatingItemId: id });

        // Increment and track the current transaction version
        const currentTxId = (latestTransactionId[id] || 0) + 1;
        latestTransactionId[id] = currentTxId;

        debounceTimeouts[id] = setTimeout(async () => {
          try {
            const res = await fetchApi<any>(`/api/cart/items/${id}`, {
              method: "PUT",
              body: JSON.stringify({ quantity: newQty }),
            });
            // Update items with latest response only if no newer transaction has been initiated
            if (latestTransactionId[id] === currentTxId) {
              set({ items: mapBackendCartToFrontend(res) });
            }
          } catch (e: any) {
            console.warn("Error updating quantity in backend cart:", e?.message || e);
            if (e?.status === 404 || e?.status === 403) {
              await state.fetchCart();
            } else {
              // Rollback on error if no newer transaction is in progress
              if (latestTransactionId[id] === currentTxId) {
                set({ items: previousItems });
                if (e?.message && !e.message.includes("token")) {
                  let alertMsg = e.message;
                  const match = e.message.match(/available stock is (\d+)/i);
                  if (match && match[1]) {
                    alertMsg = `Only ${match[1]} items are in stock.`;
                  }
                  useToastStore.getState().showToast(alertMsg, "warning");
                }
              }
            }
          } finally {
            delete debounceTimeouts[id];
            // Only clear updatingItemId if this transaction is still the active one
            if (latestTransactionId[id] === currentTxId) {
              set({ updatingItemId: null });
            }
          }
        }, 500); // 500ms debounce
      },

      removeItem: async (id) => {
        const user = useAuthStore.getState().user;
        const state = useCartStore.getState();
        if (state.updatingItemId || state.actionItemId) return;
        set({ actionItemId: id });

        try {
          const previousItems = state.items;
          const itemToRemove = previousItems.find(item => item.id === id);
          if (!itemToRemove) return;

          if (user) {
            const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
            
            if (!isUuid) {
              try {
                await state.fetchCart();
                const updatedItems = useCartStore.getState().items;
                const resolvedItem = updatedItems.find(item => item.productId === itemToRemove.productId);
                if (resolvedItem && resolvedItem.id !== id) {
                  set({ actionItemId: null });
                  await useCartStore.getState().removeItem(resolvedItem.id);
                  return;
                }
              } catch (err) {
                console.warn("Failed to resolve database ID for cart item removal:", err);
              }
              return;
            }

            // Optimistically update frontend state
            set({
              items: previousItems.filter((item) => item.id !== id),
            });

            try {
              const res = await fetchApi<any>(`/api/cart/items/${id}`, {
                method: "DELETE",
              });
              set({ items: mapBackendCartToFrontend(res) });
            } catch (e: any) {
              console.warn("Error removing item from backend cart:", e?.message || e);
              if (e?.status === 404 || e?.status === 403) {
                // Sync with backend if the item doesn't exist or isn't ours
                await state.fetchCart();
              } else {
                // Rollback to exact previous items state on other errors
                set({ items: previousItems });
              }
            }
          } else {
            set((state) => ({
              items: state.items.filter((item) => item.id !== id),
            }));
          }
        } finally {
          set({ actionItemId: null });
        }
      },

      saveForLater: (id) => {
        const state = useCartStore.getState();
        if (state.updatingItemId || state.actionItemId) return;
        set({ actionItemId: id });

        const itemToSave = state.items.find((item) => item.id === id);
        if (!itemToSave) {
          set({ actionItemId: null });
          return;
        }

        const user = useAuthStore.getState().user;
        if (user) {
          const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
          if (isUuid) {
            // Remove item from backend cart directly
            fetchApi<any>(`/api/cart/items/${id}`, { method: "DELETE" })
              .catch((e: any) => console.warn("Error deleting cart item for saveForLater:", e?.message || e))
              .finally(() => set({ actionItemId: null }));
          } else {
            // Non-UUID: fetch cart first then remove the resolved database item
            useCartStore.getState().fetchCart().then(() => {
              const resolvedItem = useCartStore.getState().items.find(item => item.productId === itemToSave.productId);
              if (resolvedItem) {
                fetchApi<any>(`/api/cart/items/${resolvedItem.id}`, { method: "DELETE" })
                  .catch((e: any) => console.warn("Error deleting resolved cart item for saveForLater:", e?.message || e))
                  .finally(() => set({ actionItemId: null }));
              } else {
                set({ actionItemId: null });
              }
            }).catch(() => {
              set({ actionItemId: null });
            });
          }
        } else {
          set({ actionItemId: null });
        }

        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
          savedItems: [...state.savedItems, { ...itemToSave, saved: true }],
        }));
      },

      moveToCart: (id) =>
        set((state) => {
          const itemToMove = state.savedItems.find((item) => item.id === id);
          if (!itemToMove) return {};

          const user = useAuthStore.getState().user;
          if (user) {
            const variantId = itemToMove.variantId || itemToMove.productId;
            fetchApi<any>("/api/cart/items", {
              method: "POST",
              body: JSON.stringify({ productId: variantId, quantity: itemToMove.quantity }),
            })
              .then((res) => {
                set({ items: mapBackendCartToFrontend(res) });
              })
              .catch((e: any) => console.warn("Error moving item to cart:", e?.message || e));
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
            console.warn("Error clearing backend cart:", e);
          }
        } else {
          set({ items: [] });
        }
      },
    }),
    {
      name: "vipaasa-cart-storage",
      partialize: (state) => {
        const user = useAuthStore.getState().user;
        if (user) {
          return {
            savedItems: state.savedItems,
            favorites: state.favorites,
          };
        }
        return {
          items: state.items,
          savedItems: state.savedItems,
          favorites: state.favorites,
        };
      },
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
                console.warn("Error parsing saved cart during rehydration", e);
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
