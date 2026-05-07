import { useState, useEffect } from 'react';
import { Star, StarHalf, MessageSquare, AlertCircle, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import useStore from '../store/useStore';
import { getProductReviews, checkUserHasReviewed, addProductReview, deleteProductReview } from '../firebase/reviewService';
import Button from './Button';
import ConfirmModal from './ConfirmModal';
import { toast } from '../store/useToastStore';

const ProductReviews = ({ productId }) => {
  const user = useStore((state) => state.user);
  
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userHasReviewed, setUserHasReviewed] = useState(false);
  const [showForm, setShowForm] = useState(false);
  
  // Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState(null);
  
  // Form State
  const [rating, setRating] = useState(5);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchReviews = async () => {
    setLoading(true);
    const fetchedReviews = await getProductReviews(productId);
    setReviews(fetchedReviews);
    setLoading(false);
  };

  const checkStatus = async () => {
    if (user) {
      const hasReviewed = await checkUserHasReviewed(productId, user.uid);
      setUserHasReviewed(hasReviewed);
    }
  };

  useEffect(() => {
    fetchReviews();
    checkStatus();
  }, [productId, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    
    const trimmedComment = comment.trim();
    if (trimmedComment.length < 10) {
      setFormError('Comment must be at least 10 characters long.');
      return;
    }

    setSubmitting(true);
    try {
      await addProductReview(
        productId, 
        user.uid, 
        user.displayName || user.email?.split('@')[0] || 'User', 
        rating, 
        trimmedComment
      );
      
      setComment('');
      setShowForm(false);
      setUserHasReviewed(true);
      await fetchReviews();
    } catch (error) {
      setFormError(error.message || 'Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (reviewId) => {
    setReviewToDelete(reviewId);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!reviewToDelete) return;
    
    try {
      await deleteProductReview(productId, reviewToDelete);
      setUserHasReviewed(false);
      await fetchReviews();
      setReviewToDelete(null);
      toast.success('Review deleted successfully 🗑️');
    } catch (error) {
      console.error('Failed to delete review:', error);
      toast.error('Failed to delete review. Please try again.');
    }
  };

  // Calculate Average
  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, rev) => acc + rev.rating, 0) / reviews.length).toFixed(1)
    : 0;

  // Star Display Helper
  const renderStars = (numRating, size = 16) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= numRating) {
        stars.push(<Star key={i} size={size} className="fill-orange-400 text-orange-400" />);
      } else if (i - 0.5 <= numRating) {
        stars.push(<StarHalf key={i} size={size} className="fill-orange-400 text-orange-400" />);
      } else {
        stars.push(<Star key={i} size={size} className="text-gray-400" />);
      }
    }
    return stars;
  };

  return (
    <div className="mt-16 pt-16 border-t border-white/10">
      <h2 className="text-3xl font-bold text-white mb-8">Customer Reviews</h2>
      
      <div className="flex flex-col md:flex-row gap-12">
        {/* Summary Section */}
        <div className="md:w-1/3">
          <div className="glass p-8 rounded-3xl flex flex-col items-center justify-center text-center">
            <span className="text-5xl font-bold text-white mb-2">{averageRating}</span>
            <div className="flex gap-1 mb-2">
              {renderStars(averageRating, 24)}
            </div>
            <p className="text-gray-400 mb-6">Based on {reviews.length} review{reviews.length !== 1 && 's'}</p>
            
            {user ? (
              !userHasReviewed ? (
                !showForm && (
                  <Button onClick={() => setShowForm(true)} className="w-full">
                    Write a Review
                  </Button>
                )
              ) : (
                <div className="bg-brand-light/10 text-brand-light px-4 py-3 rounded-xl text-sm border border-brand-light/20 flex items-center justify-center gap-2 w-full">
                  <AlertCircle size={16} /> You've reviewed this product
                </div>
              )
            ) : (
              <div className="text-sm text-gray-400 bg-brand-primary/30 p-4 rounded-xl border border-white/5 w-full">
                Please <Link to="/auth" className="text-blue-400 hover:text-white underline">log in</Link> to leave a review.
              </div>
            )}
          </div>
        </div>

        {/* Reviews List & Form */}
        <div className="md:w-2/3 space-y-6">
          
          {/* Form */}
          {showForm && (
            <div className="glass p-6 rounded-3xl border border-white/10 animate-fade-in mb-8">
              <h3 className="text-xl font-semibold text-white mb-4">Write your review</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                
                {formError && (
                  <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-xl text-sm">
                    {formError}
                  </div>
                )}

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onMouseEnter={() => setHoveredRating(star)}
                        onMouseLeave={() => setHoveredRating(0)}
                        onClick={() => setRating(star)}
                        className="focus:outline-none transition-transform hover:scale-110"
                      >
                        <Star 
                          size={28} 
                          className={`${(hoveredRating || rating) >= star ? 'fill-orange-400 text-orange-400' : 'text-gray-500'}`} 
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label htmlFor="comment" className="block text-sm text-gray-400 mb-2">Review (min. 10 chars)</label>
                  <textarea
                    id="comment"
                    rows="4"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="What did you like or dislike?"
                    className="w-full bg-brand-dark/50 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-blue-500 transition-colors resize-none"
                    disabled={submitting}
                  ></textarea>
                </div>

                <div className="flex gap-4 pt-2">
                  <Button type="submit" disabled={submitting || comment.trim().length < 10}>
                    {submitting ? 'Submitting...' : 'Submit Review'}
                  </Button>
                  <button
                    type="button"
                    onClick={() => { setShowForm(false); setFormError(''); }}
                    className="px-6 py-3 rounded-full text-gray-400 hover:text-white transition-colors"
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* List */}
          {loading ? (
            <div className="flex items-center justify-center p-12 text-gray-500">
              <div className="animate-pulse flex flex-col items-center gap-2">
                <MessageSquare size={32} className="opacity-50" />
                <span>Loading reviews...</span>
              </div>
            </div>
          ) : reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="glass p-6 rounded-2xl border border-white/5">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="font-semibold text-white block mb-1">{review.username}</span>
                      <div className="flex gap-1">
                        {renderStars(review.rating, 14)}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric', month: 'short', day: 'numeric'
                        })}
                      </span>
                      {user && user.uid === review.id && (
                        <button 
                          onClick={() => handleDelete(review.id)}
                          className="text-red-400 hover:text-red-300 transition-colors p-1.5 rounded-full hover:bg-white/5"
                          title="Delete your review"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-gray-300 whitespace-pre-wrap text-sm leading-relaxed">
                    {review.comment}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="glass p-12 rounded-3xl text-center border border-white/5 flex flex-col items-center justify-center gap-4 text-gray-400">
              <MessageSquare size={48} className="opacity-30" />
              <p>No reviews yet. Be the first to share your thoughts!</p>
            </div>
          )}

        </div>
      </div>

      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setReviewToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Review?"
        message="Are you sure you want to delete your review? This action cannot be undone."
      />
    </div>
  );
};

export default ProductReviews;
