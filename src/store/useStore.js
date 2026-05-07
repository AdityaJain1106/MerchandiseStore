import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { saveCartToFirestore } from '../firebase/cartService';
import { toast } from './useToastStore';

const useStore = create(
  persist(
    (set, get) => ({
      cart: [],
      wishlist: [],
      theme: 'dark', // default to dark
      user: null,
      isAuthReady: false,
      hasFetchedCart: false,
      
      setIsAuthReady: (status) => set({ isAuthReady: status }),
      setHasFetchedCart: (status) => set({ hasFetchedCart: status }),
      setUser: (user) => set({ user }),
      
      canSyncCart: () => {
        const state = get();
        return state.user && state.isAuthReady && state.hasFetchedCart;
      },
      
      setCart: (cart) => {
        set({ cart });
        const state = get();
        if (state.canSyncCart()) {
          console.log('[Zustand] setCart syncing to Firestore...', cart);
          saveCartToFirestore(state.user.uid, cart);
        }
      },
      
      clearCart: () => {
        console.log('[Zustand] clearCart called. Wiping local cart ONLY.');
        set({ cart: [] });
      },
      
      addToCart: (product) =>
        set((state) => {
          let newCart;
          const cartItemId = `${product.id}-${product.selectedSize || ''}-${product.selectedColor || ''}`;
          const existing = state.cart.find((item) => item.cartItemId === cartItemId || (item.id === product.id && item.selectedSize === product.selectedSize && item.selectedColor === product.selectedColor));
          
          if (existing) {
            newCart = state.cart.map((item) =>
              (item.cartItemId === cartItemId || (item.id === product.id && item.selectedSize === product.selectedSize && item.selectedColor === product.selectedColor)) 
                ? { ...item, quantity: item.quantity + 1 } 
                : item
            );
          } else {
            newCart = [...state.cart, { ...product, cartItemId, quantity: 1 }];
          }
          console.log('[Zustand] addToCart updating store...', newCart);
          if (state.canSyncCart()) saveCartToFirestore(state.user.uid, newCart);
          toast.success(`${product.name} Added to Cart 🛒`);
          return { cart: newCart };
        }),
        
      removeFromCart: (cartItemId) =>
        set((state) => {
          const itemToRemove = state.cart.find((item) => item.cartItemId ? item.cartItemId === cartItemId : item.id === cartItemId);
          if (itemToRemove) {
            toast.info(`${itemToRemove.name} Removed from Cart 🗑️`);
          }
          // Fallback to matching id if cartItemId doesn't exist on older items
          const newCart = state.cart.filter((item) => item.cartItemId ? item.cartItemId !== cartItemId : item.id !== cartItemId);
          console.log('[Zustand] removeFromCart updating store...', newCart);
          if (state.canSyncCart()) saveCartToFirestore(state.user.uid, newCart);
          return { cart: newCart };
        }),
        
      updateQuantity: (cartItemId, quantity) =>
        set((state) => {
          const newCart = state.cart.map((item) =>
            (item.cartItemId ? item.cartItemId === cartItemId : item.id === cartItemId) 
              ? { ...item, quantity: Math.max(1, quantity) } 
              : item
          );
          console.log('[Zustand] updateQuantity updating store...', newCart);
          if (state.canSyncCart()) saveCartToFirestore(state.user.uid, newCart);
          return { cart: newCart };
        }),
        
      toggleWishlist: (product) =>
        set((state) => {
          const exists = state.wishlist.find((item) => item.id === product.id);
          if (exists) {
            toast.info(`${product.name} Removed from Wishlist 💔`);
            return { wishlist: state.wishlist.filter((item) => item.id !== product.id) };
          }
          toast.success(`${product.name} Added to Wishlist ❤️`);
          return { wishlist: [...state.wishlist, product] };
        }),
        
      toggleTheme: () =>
        set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
    }),
    {
      name: 'store-storage', // key in local storage
      partialize: (state) => ({
        cart: state.cart,
        wishlist: state.wishlist,
        theme: state.theme,
        user: state.user,
      }),
    }
  )
);

export default useStore;
