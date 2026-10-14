const asyncHandler = require('../utils/asyncHandler');
const { ApiError, sendSuccess } = require('../utils/responseUtils');
const Booking = require('../models/Booking');
const Review = require('../models/Review');

class ReviewController {
 
  create = asyncHandler(async (req, res) => {
    const { bookingId, rating, comment } = req.body;
    if (!bookingId || !rating) {
      throw new ApiError(400, 'bookingId and rating are required');
    }
    if (rating < 1 || rating > 5) {
      throw new ApiError(400, 'Rating must be between 1 and 5');
    }

    const booking = await Booking.findOne({ _id: bookingId, customerId: req.user._id });
    if (!booking) throw new ApiError(404, 'Booking not found');

    if (booking.status !== 'Completed') {
      throw new ApiError(400, 'You can only review a completed booking');
    }

    const existingReview = await Review.findOne({ bookingId });
    if (existingReview) {
      throw new ApiError(409, 'A review already exists for this booking');
    }

    const review = await Review.create({
      bookingId,
      customerId: req.user._id,
      providerId: booking.providerId,
      rating,
      comment,
    });

    return sendSuccess(res, 201, 'Review submitted', review);
  });

  
  getByProvider = asyncHandler(async (req, res) => {
    const reviews = await Review.find({ providerId: req.params.id, isReported: false })
      .populate('customerId', 'name profileImage')
      .sort({ createdAt: -1 });

    return sendSuccess(res, 200, 'Reviews fetched', reviews);
  });

  
  update = asyncHandler(async (req, res) => {
    const review = await Review.findOne({ _id: req.params.id, customerId: req.user._id });
    if (!review) throw new ApiError(404, 'Review not found');

    const { rating, comment } = req.body;
    if (rating !== undefined) {
      if (rating < 1 || rating > 5) throw new ApiError(400, 'Rating must be between 1 and 5');
      review.rating = rating;
    }
    if (comment !== undefined) review.comment = comment;

    await review.save();
    return sendSuccess(res, 200, 'Review updated', review);
  });

 
  remove = asyncHandler(async (req, res) => {
    const review = await Review.findOne({ _id: req.params.id, customerId: req.user._id });
    if (!review) throw new ApiError(404, 'Review not found');

    await review.deleteOne();
    return sendSuccess(res, 200, 'Review deleted');
  });
}

module.exports = new ReviewController();
