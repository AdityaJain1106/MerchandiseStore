/**
 * Merges a local cart with a remote cart.
 * If an item exists in both carts, their quantities are combined.
 * @param {Array} localCart - The cart array from local storage.
 * @param {Array} remoteCart - The cart array fetched from Firestore.
 * @returns {Array} The merged cart.
 */
export const mergeCarts = (localCart, remoteCart) => {
  const merged = [...remoteCart];
  
  localCart.forEach((localItem) => {
    const existingIndex = merged.findIndex((item) => item.id === localItem.id);
    
    if (existingIndex >= 0) {
      // Item exists in both, combine quantity
      merged[existingIndex] = {
        ...merged[existingIndex],
        quantity: merged[existingIndex].quantity + localItem.quantity
      };
    } else {
      // Item is only in local cart, add it
      merged.push(localItem);
    }
  });
  
  return merged;
};
