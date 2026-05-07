// src/firebase/orderService.js
// Manages Firestore order storage under the scalable path:
//   users/{uid}/orders/{orderId}

import { doc, setDoc, collection, getDocs, orderBy, query, serverTimestamp } from 'firebase/firestore';
import { db } from './config';

/**
 * Saves a completed order to Firestore.
 * Path: users/{userId}/orders/{razorpayOrderId}
 */
export const saveOrderToFirestore = async (userId, orderData) => {
  const {
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
    customerDetails,
    items,
    totalAmount,
  } = orderData;

  if (!userId || !razorpayOrderId) {
    throw new Error('[orderService] Missing userId or razorpayOrderId.');
  }

  const productSnapshot = items.map((item) => ({
    id: item.id,
    cartItemId: item.cartItemId || item.id,
    name: item.name,
    price: Number(item.price),
    quantity: item.quantity,
    mainImage: item.mainImage || null,
    category: item.category || null,
    selectedSize: item.selectedSize || null,
    selectedColor: item.selectedColor || null,
    lineTotal: Number(item.price) * item.quantity,
  }));

  const orderRef = doc(db, 'users', userId, 'orders', razorpayOrderId);

  const orderDoc = {
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
    status: 'Placed',
    totalAmount: Number(totalAmount),
    currency: 'INR',
    customerDetails: {
      fullName: customerDetails.fullName,
      email: customerDetails.email,
      mobile: customerDetails.mobile,
      address: customerDetails.address,
      pincode: customerDetails.pincode,
    },
    items: productSnapshot,
    createdAt: serverTimestamp(),
    userId,
  };

  try {
    await setDoc(orderRef, orderDoc);
    console.log(`[orderService] Order saved: users/${userId}/orders/${razorpayOrderId}`);
    return { success: true, orderId: razorpayOrderId };
  } catch (err) {
    console.error('[orderService] ERROR saving order to Firestore:', err);
    throw err;
  }
};

/**
 * Fetches all orders for a user, sorted newest first.
 * Path: users/{userId}/orders
 * @param {string} userId - Firebase Auth UID
 * @returns {Promise<Array>} Array of order objects with id field injected
 */
export const getUserOrdersFromFirestore = async (userId) => {
  if (!userId) {
    console.warn('[orderService] getUserOrders called without userId.');
    return [];
  }

  try {
    const ordersRef = collection(db, 'users', userId, 'orders');
    const q = query(ordersRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      // Convert Firestore Timestamp to JS Date for rendering
      createdAt: doc.data().createdAt?.toDate?.() || null,
    }));
  } catch (err) {
    console.error('[orderService] ERROR fetching orders from Firestore:', err);
    throw err;
  }
};
