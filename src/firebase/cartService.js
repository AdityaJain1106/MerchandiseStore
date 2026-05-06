import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from './config';

let debounceTimer;

/**
 * Saves the given cart array to Firestore for the specified user (debounced).
 * @param {string} userId - The Firebase Auth user ID.
 * @param {Array} cart - The cart array to save.
 */
export const saveCartToFirestore = (userId, cart) => {
  if (!userId) {
    console.log('[Firestore] Save cancelled: No user ID provided.');
    return;
  }
  
  // Strip undefined values which cause Firestore to crash silently
  const sanitizedCart = JSON.parse(JSON.stringify(cart));
  
  console.log(`[Firestore] Queuing cart save for user ${userId}...`, sanitizedCart);
  
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(async () => {
    try {
      console.log(`[Firestore] Executing debounced save for user ${userId}...`);
      const userCartRef = doc(db, 'users', userId);
      await setDoc(userCartRef, { cart: sanitizedCart }, { merge: true });
      console.log(`[Firestore] SUCCESS: Cart saved permanently to Firestore for user ${userId}`);
    } catch (error) {
      console.error('[Firestore] ERROR saving cart to Firestore:', error);
    }
  }, 1000);
};

/**
 * Fetches the cart array from Firestore for the specified user.
 * @param {string} userId - The Firebase Auth user ID.
 * @returns {Promise<Array>} The saved cart array, or empty array if none exists.
 */
export const getCartFromFirestore = async (userId) => {
  if (!userId) {
    console.log('[Firestore] Fetch cancelled: No user ID provided.');
    return [];
  }
  
  try {
    console.log(`[Firestore] Fetching cart for user ${userId}...`);
    const userCartRef = doc(db, 'users', userId);
    const docSnap = await getDoc(userCartRef);
    if (docSnap.exists() && docSnap.data().cart) {
      console.log(`[Firestore] SUCCESS: Found existing cart for user ${userId}:`, docSnap.data().cart);
      return docSnap.data().cart;
    }
    console.log(`[Firestore] No existing cart found for user ${userId}. Returning empty array.`);
    return [];
  } catch (error) {
    console.error('[Firestore] ERROR fetching cart from Firestore:', error);
    return [];
  }
};
