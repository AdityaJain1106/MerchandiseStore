import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import ScrollToTop from './components/ScrollToTop';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase/config';
import useStore from './store/useStore';
import { saveCartToFirestore, getCartFromFirestore } from './firebase/cartService';
import { mergeCarts } from './utils/cartUtils';
import ToastProvider from './components/ToastProvider';

// Pages
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Wishlist from './pages/Wishlist';
import Contact from './pages/Contact';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Auth from './pages/Auth';
import Story from './pages/Story';
import OrderSuccess from './pages/OrderSuccess';
import OrderHistory from './pages/OrderHistory';

function App() {
  const setUser = useStore((state) => state.setUser);
  const setIsAuthReady = useStore((state) => state.setIsAuthReady);
  const setHasFetchedCart = useStore((state) => state.setHasFetchedCart);

  useEffect(() => {
    console.log('[Auth] Initializing Auth State Listener...');
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      const previousUser = useStore.getState().user;
      
      if (currentUser) {
        console.log(`[Auth] User logged in: ${currentUser.uid}`);
        
        // Ensure syncing is disabled during fetch and merge
        setIsAuthReady(false);
        setHasFetchedCart(false);
        
        console.log('[Auth] 1. Fetching remote cart from Firestore...');
        const remoteCart = await getCartFromFirestore(currentUser.uid);
        
        console.log('[Auth] 2. Fetching guest local cart...');
        const localCart = useStore.getState().cart;
        
        let finalCart;
        const isFreshLogin = !previousUser || previousUser.uid !== currentUser.uid;
        
        if (isFreshLogin) {
          console.log('[Auth] 3. Fresh login detected. Merging guest cart with cloud cart...');
          finalCart = mergeCarts(localCart, remoteCart);
        } else {
          console.log('[Auth] 3. Page refresh detected. Skipping merge, restoring cloud cart directly...');
          finalCart = remoteCart;
        }
        
        console.log('[Auth] 4. Setting Zustand cart (without triggering sync yet)...', finalCart);
        useStore.setState({ cart: finalCart });
        
        console.log('[Auth] 5. Enabling Firestore syncing...');
        setUser({
          uid: currentUser.uid,
          email: currentUser.email,
          displayName: currentUser.displayName,
        });
        setIsAuthReady(true);
        setHasFetchedCart(true);
        
        // Explicitly sync the merged result once setup is complete
        if (isFreshLogin) {
           console.log('[Auth] Triggering initial save of merged cart to Firestore...');
           saveCartToFirestore(currentUser.uid, finalCart);
        }
        
      } else {
        console.log('[Auth] Auth state resolved to guest/null.');
        
        // If they were previously logged in, this is an EXPLICIT LOGOUT event.
        if (previousUser) {
          console.log('[Auth] Explicit logout detected. Clearing local UI cart ONLY.');
          setUser(null);
          useStore.setState({ cart: [] }); 
        } else {
          // It's the first load for a guest user. Do NOT wipe their cart!
          console.log('[Auth] Initial guest load. Preserving guest cart.');
        }
        
        setIsAuthReady(true);
        setHasFetchedCart(false);
      }
    });

    return () => unsubscribe();
  }, [setUser, setIsAuthReady, setHasFetchedCart]);

  return (
    <Router>
      <ScrollToTop />
      <ToastProvider />
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="shop" element={<Shop />} />
          <Route path="product/:id" element={<ProductDetails />} />
          <Route path="cart" element={<Cart />} />
          <Route path="wishlist" element={<Wishlist />} />
          <Route path="contact" element={<Contact />} />
          <Route path="privacy" element={<Privacy />} />
          <Route path="terms" element={<Terms />} />
          <Route path="auth" element={<Auth />} />
          <Route path="story" element={<Story />} />
          <Route path="order-success" element={<OrderSuccess />} />
          <Route path="orders" element={<OrderHistory />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
