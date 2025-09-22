import React, { useState } from 'react';
import { X, Star, Plus, MessageSquare, Calendar, User } from 'lucide-react';
import { Employee } from '../types/Employee';
import { ClientReview } from '../types/Employee';

interface ClientReviewModalProps {
  client: Employee;
  onClose: () => void;
  onAddReview: (clientId: string, reviewData: Omit<ClientReview, 'id' | 'clientId'>) => Promise<void>;
  reviews: ClientReview[];
}

export const ClientReviewModal: React.FC<ClientReviewModalProps> = ({
  client,
  onClose,
  onAddReview,
  reviews,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    rating: 5,
    reviewText: '',
    serviceType: 'general',
  });

  const handleAddReview = async () => {
    await onAddReview(client.id, {
      rating: formData.rating,
      reviewText: formData.reviewText || undefined,
      reviewDate: new Date(),
      serviceType: formData.serviceType,
    });
    
    setFormData({ rating: 5, reviewText: '', serviceType: 'general' });
    setShowAddForm(false);
  };

  const renderStars = (rating: number, interactive = false, onRatingChange?: (rating: number) => void) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 cursor-pointer transition-colors ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        } ${interactive ? 'hover:text-yellow-300' : ''}`}
        onClick={() => interactive && onRatingChange && onRatingChange(i + 1)}
      />
    ));
  };

  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b bg-gradient-to-r from-yellow-50 to-orange-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-yellow-100 p-2 rounded-full">
                <Star className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Client Reviews</h2>
                <p className="text-gray-600">{client.name} - Reviews & Feedback</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-96">
          {/* Review Summary */}
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1">
                  {renderStars(Math.round(averageRating))}
                </div>
                <span className="text-lg font-semibold text-gray-800">
                  {averageRating.toFixed(1)} / 5.0
                </span>
              </div>
              <div className="text-sm text-gray-600">
                {reviews.length} review{reviews.length !== 1 ? 's' : ''}
              </div>
            </div>
            <div className="text-sm text-gray-700">
              Average rating based on all client reviews and feedback
            </div>
          </div>

          {/* Add Review Button */}
          <div className="mb-6">
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Review</span>
            </button>
          </div>

          {/* Add Review Form */}
          {showAddForm && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Rating</label>
                  <div className="flex items-center space-x-1">
                    {renderStars(formData.rating, true, (rating) => 
                      setFormData({ ...formData, rating })
                    )}
                    <span className="ml-2 text-sm text-gray-600">
                      {formData.rating} star{formData.rating !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Service Type</label>
                  <select
                    value={formData.serviceType}
                    onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="general">General Service</option>
                    <option value="consultation">Consultation</option>
                    <option value="project">Project Work</option>
                    <option value="support">Support</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Review Text</label>
                  <textarea
                    placeholder="Share your experience with this client..."
                    value={formData.reviewText}
                    onChange={(e) => setFormData({ ...formData, reviewText: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    rows={4}
                  />
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={handleAddReview}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg"
                  >
                    Add Review
                  </button>
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Reviews List */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">All Reviews</h3>
            {reviews.length > 0 ? (
              reviews.map((review) => (
                <div key={review.id} className="p-4 border rounded-lg bg-white">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-1">
                        {renderStars(review.rating)}
                      </div>
                      <span className="font-medium text-gray-800">
                        {review.rating}/5 Stars
                      </span>
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(review.reviewDate).toLocaleDateString()}
                    </div>
                  </div>
                  
                  {review.serviceType && (
                    <div className="mb-2">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                        {review.serviceType}
                      </span>
                    </div>
                  )}
                  
                  {review.reviewText && (
                    <div className="text-gray-700 leading-relaxed">
                      {review.reviewText}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No reviews yet</p>
                <p className="text-sm text-gray-400 mt-2">Add the first review for this client</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};