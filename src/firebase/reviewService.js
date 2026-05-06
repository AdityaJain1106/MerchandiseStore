import { db } from './config';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  orderBy, 
  serverTimestamp,
  deleteDoc
} from 'firebase/firestore';

// Fetch all reviews for a product
export const getProductReviews = async (productId) => {
  if (!db.app) return []; // Fallback if firebase isn't configured

  try {
    const reviewsRef = collection(db, 'products', productId, 'reviews');
    const q = query(reviewsRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      // Convert Firestore timestamp to serializable date string
      createdAt: doc.data().createdAt?.toDate().toISOString() || new Date().toISOString()
    }));
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return [];
  }
};

// Check if a user has already reviewed a product
export const checkUserHasReviewed = async (productId, userId) => {
  if (!db.app || !userId) return false;
  
  try {
    const reviewDocRef = doc(db, 'products', productId, 'reviews', userId);
    const docSnap = await getDoc(reviewDocRef);
    return docSnap.exists();
  } catch (error) {
    console.error('Error checking review status:', error);
    return false;
  }
};

// Add a new review
export const addProductReview = async (productId, userId, username, rating, comment) => {
  if (!db.app) throw new Error('Firebase not configured');
  
  // Basic validation (also enforced by Firestore rules)
  const trimmedComment = comment.trim();
  if (trimmedComment.length < 10) {
    throw new Error('Comment must be at least 10 characters long.');
  }
  if (rating < 1 || rating > 5) {
    throw new Error('Rating must be between 1 and 5.');
  }

  try {
    // The document ID is the userId to ensure 1 review per user
    const reviewDocRef = doc(db, 'products', productId, 'reviews', userId);
    
    await setDoc(reviewDocRef, {
      userId,
      username: username || 'Anonymous User',
      rating,
      comment: trimmedComment,
      createdAt: serverTimestamp()
    });
    
    return true;
  } catch (error) {
    console.error('Error adding review:', error);
    throw error;
  }
};

// Delete a user's review
export const deleteProductReview = async (productId, userId) => {
  if (!db.app) throw new Error('Firebase not configured');

  try {
    const reviewDocRef = doc(db, 'products', productId, 'reviews', userId);
    await deleteDoc(reviewDocRef);
    return true;
  } catch (error) {
    console.error('Error deleting review:', error);
    throw error;
  }
};
