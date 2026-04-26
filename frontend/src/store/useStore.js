import { create } from "zustand";
import { persist } from "zustand/middleware";

const useStore = create(
  persist(
    (set) => ({

  // 👤 USER
  activeUser: JSON.parse(localStorage.getItem("user")) || null,

  loginActiveUser: (user) => {
    localStorage.setItem("user", JSON.stringify(user));
    set({ activeUser: user });
  },

  logoutActiveUser: () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    set({ activeUser: null });
  },

  // 🛒 CART
  cartItems: [],
  selectedItems: [],

  toggleSelectItem: (id) =>
    set((state) => ({
      selectedItems: state.selectedItems.includes(id)
        ? state.selectedItems.filter((itemId) => itemId !== id)
        : [...state.selectedItems, id],
    })),

  selectAllItems: () =>
    set((state) => ({
      selectedItems: state.cartItems.map((item) => item._id),
    })),

  deselectAllItems: () =>
    set({ selectedItems: [] }),

  addToCart: (product) =>
    set((state) => {
      const exists = state.cartItems.find(
        (item) => item._id === product._id
      );

      if (exists) {
        return {
          cartItems: state.cartItems.map((item) =>
            item._id === product._id
              ? { ...item, qty: item.qty + 1 }
              : item
          ),
        };
      }

      return {
        cartItems: [...state.cartItems, { ...product, qty: 1 }],
      };
    }),

  removeFromCart: (id) =>
    set((state) => ({
      cartItems: state.cartItems.filter((item) => item._id !== id),
      selectedItems: state.selectedItems.filter((itemId) => itemId !== id),
    })),

  increaseQty: (id) =>
    set((state) => ({
      cartItems: state.cartItems.map((item) =>
        item._id === id
          ? { ...item, qty: item.qty + 1 }
          : item
      ),
    })),

  decreaseQty: (id) =>
    set((state) => ({
      cartItems: state.cartItems.map((item) =>
        item._id === id && item.qty > 1
          ? { ...item, qty: item.qty - 1 }
          : item
      ),
    })),

  // ✅ FIXED
  clearCart: () => set({ cartItems: [], selectedItems: [] }),

  // ⚔️ COMPARE
  compareList: [],

  addToCompare: (product) =>
    set((state) => {
      if (state.compareList.find((p) => p._id === product._id)) {
        return state;
      }

      // STRICT RULE: Only allow comparison between products of the same category.
      // If categories mismatch, reset the comparison with the new product.
      if (state.compareList.length > 0 && state.compareList[0].category !== product.category) {
        return {
          compareList: [product],
        };
      }

      // Limit to 3 products for side-by-side comparison
      if (state.compareList.length >= 3) {
        return {
          compareList: [...state.compareList.slice(1), product],
        };
      }

      return {
        compareList: [...state.compareList, product],
      };
    }),

  removeFromCompare: (id) =>
    set((state) => ({
      compareList: state.compareList.filter((p) => p._id !== id),
    })),

  clearCompare: () => set({ compareList: [] }),
    }),
    {
      name: "reviewlens-store",
      partialize: (state) => ({
        cartItems: state.cartItems,
        compareList: state.compareList,
      }),
    }
  )
);

export default useStore;