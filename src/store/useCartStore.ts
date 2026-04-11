import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import type { User } from 'firebase/auth';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CartItem {
  /** Firestore document ID of the marketItem */
  id: string;
  title: string;
  seller: string;
  sellerId: string;
  price: number;
  imageUrl: string;
  category: string;
  type: 'Physical' | 'Digital';
}

interface CartStore {
  items: CartItem[];

  // ── Actions ──────────────────────────────────────────────────────────────────
  /** Add an item — silently ignores duplicates */
  addItem: (item: CartItem) => void;
  /** Remove a single item by its Firestore document ID */
  removeItem: (id: string) => void;
  /** Remove all items from the cart */
  clearCart: () => void;

  // ── Checkout ─────────────────────────────────────────────────────────────────
  /**
   * Write an `orders` document to Firestore then clear the local cart.
   *
   * Security model (enforced by firestore.rules):
   * - buyerId must match the authenticated user's UID
   * - total must be a positive number
   * - No updates or deletes are permitted on orders
   *
   * @returns The new order's Firestore document ID on success, or throws on failure.
   */
  checkout: (user: User) => Promise<string>;

  // ── Computed helpers (derived, not stored) ────────────────────────────────────
  /** Total number of distinct items */
  itemCount: () => number;
  /** Sum of all item prices (2 decimal places) */
  total: () => number;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        const existing = get().items.find((i) => i.id === item.id);
        // Prevent duplicate items — marketplace items are unique physical/digital assets
        if (existing) return;
        set((state) => ({ items: [...state.items, item] }));
      },

      removeItem: (id) => {
        set((state) => ({ items: state.items.filter((i) => i.id !== id) }));
      },

      clearCart: () => {
        set({ items: [] });
      },

      checkout: async (user: User) => {
        const { items, total, clearCart } = get();

        if (items.length === 0) {
          throw new Error('Cart is empty');
        }

        // Build the order document — shape validated by firestore.rules
        const orderPayload = {
          buyerId: user.uid,
          buyerName: user.displayName ?? 'Anonymous',
          buyerEmail: user.email ?? '',
          items: items.map((item) => ({
            id: item.id,
            title: item.title,
            seller: item.seller,
            sellerId: item.sellerId,
            price: item.price,
            category: item.category,
            type: item.type,
          })),
          total: parseFloat(total().toFixed(2)),
          status: 'pending',
          createdAt: serverTimestamp(),
        };

        const docRef = await addDoc(collection(db, 'orders'), orderPayload);
        clearCart();
        return docRef.id;
      },

      // Derived helpers — computed on every call, not persisted
      itemCount: () => get().items.length,
      total: () =>
        parseFloat(
          get()
            .items.reduce((sum, item) => sum + item.price, 0)
            .toFixed(2)
        ),
    }),
    {
      name: 'unleash-cart', // localStorage key
      storage: createJSONStorage(() => localStorage),
      // Only persist items — derived functions and checkout are not serializable
      partialize: (state) => ({ items: state.items }),
    }
  )
);
