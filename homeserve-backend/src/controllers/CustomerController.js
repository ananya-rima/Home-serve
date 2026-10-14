const asyncHandler = require('../utils/asyncHandler');
const { ApiError, sendSuccess } = require('../utils/responseUtils');
const { getPaginationParams, buildPaginationMeta } = require('../utils/paginationUtils');
const mongoose = require('mongoose');
const User = require('../models/User');
const Address = require('../models/Address');
const { uploadBufferToCloudinary, deleteImageByUrl } = require('../utils/cloudinaryUtils');
const Availability = require('../models/Availability');
const Booking = require('../models/Booking');

class CustomerController {
  
  getProfile = asyncHandler(async (req, res) => {
    return sendSuccess(res, 200, 'Profile fetched', req.user.toSafeObject());
  });

  
  updateProfile = asyncHandler(async (req, res) => {
    const { name, phone } = req.body;
    const user = await User.findById(req.user._id);

    const oldImage = user.profileImage;

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (req.file) {
      const result = await uploadBufferToCloudinary(req.file.buffer, 'homeserve/profiles');
      user.profileImage = result.secure_url;
    }

    await user.save();
    
    if (oldImage && oldImage !== user.profileImage) await deleteImageByUrl(oldImage);
    return sendSuccess(res, 200, 'Profile updated', user.toSafeObject());
  });

 
  createAddress = asyncHandler(async (req, res) => {
    const { label, houseNo, street, area, city, state, pincode, isDefault } = req.body;
    if (!houseNo || !street || !area || !city || !state || !pincode) {
      throw new ApiError(400, 'All address fields are required');
    }

    if (isDefault) {
      await Address.updateMany({ userId: req.user._id }, { isDefault: false });
    }

    const address = await Address.create({
      userId: req.user._id,
      label,
      houseNo,
      street,
      area,
      city,
      state,
      pincode,
      isDefault: !!isDefault,
    });

    return sendSuccess(res, 201, 'Address created', address);
  });

 
  getAddresses = asyncHandler(async (req, res) => {
    const addresses = await Address.find({ userId: req.user._id }).sort({ isDefault: -1, createdAt: -1 });
    return sendSuccess(res, 200, 'Addresses fetched', addresses);
  });

  
  updateAddress = asyncHandler(async (req, res) => {
    const address = await Address.findOne({ _id: req.params.id, userId: req.user._id });
    if (!address) throw new ApiError(404, 'Address not found');

    const { label, houseNo, street, area, city, state, pincode, isDefault } = req.body;
    if (label) address.label = label;
    if (houseNo) address.houseNo = houseNo;
    if (street) address.street = street;
    if (area) address.area = area;
    if (city) address.city = city;
    if (state) address.state = state;
    if (pincode) address.pincode = pincode;

    if (isDefault) {
      await Address.updateMany({ userId: req.user._id }, { isDefault: false });
      address.isDefault = true;
    }

    await address.save();
    return sendSuccess(res, 200, 'Address updated', address);
  });

  
  deleteAddress = asyncHandler(async (req, res) => {
    const address = await Address.findOne({ _id: req.params.id, userId: req.user._id });
    if (!address) throw new ApiError(404, 'Address not found');

    await address.deleteOne();
    return sendSuccess(res, 200, 'Address deleted');
  });

  
  setDefaultAddress = asyncHandler(async (req, res) => {
    const address = await Address.findOne({ _id: req.params.id, userId: req.user._id });
    if (!address) throw new ApiError(404, 'Address not found');

    await Address.updateMany({ userId: req.user._id }, { isDefault: false });
    address.isDefault = true;
    await address.save();

    return sendSuccess(res, 200, 'Default address set', address);
  });

  
  discoverProviders = asyncHandler(async (req, res) => {
    const { page, limit, skip } = getPaginationParams(req.query);
    const { service, location, minRating, maxPrice, experience, sort } = req.query;

    const matchProviderService = { status: 'active' };
    if (service) matchProviderService.serviceId = new mongoose.Types.ObjectId(service);
    if (maxPrice) matchProviderService.price = { $lte: Number(maxPrice) };
    if (experience) matchProviderService.experience = { $gte: Number(experience) };

    const pipeline = [
      { $match: matchProviderService },
      {
        $lookup: {
          from: 'users',
          localField: 'providerId',
          foreignField: '_id',
          as: 'provider',
        },
      },
      { $unwind: '$provider' },
      { $match: { 'provider.isApproved': true, 'provider.status': 'active' } },
    ];

    if (location) {
      pipeline.push({ $match: { 'provider.location': { $regex: location, $options: 'i' } } });
    }

    pipeline.push(
      {
        $lookup: {
          from: 'reviews',
          localField: 'providerId',
          foreignField: 'providerId',
          as: 'reviews',
        },
      },
      {
        $addFields: {
          avgRating: { $ifNull: [{ $avg: '$reviews.rating' }, 0] },
          reviewCount: { $size: '$reviews' },
        },
      }
    );

    if (minRating) {
      pipeline.push({ $match: { avgRating: { $gte: Number(minRating) } } });
    }

    let sortStage = { 'provider.createdAt': -1 };
    if (sort === 'rating') sortStage = { avgRating: -1 };
    if (sort === 'price') sortStage = { price: 1 };
    pipeline.push({ $sort: sortStage });

    pipeline.push({
      $project: {
        price: 1,
        experience: 1,
        avgRating: 1,
        reviewCount: 1,
        'provider._id': 1,
        'provider.name': 1,
        'provider.profileImage': 1,
        'provider.location': 1,
        'provider.skills': 1,
      },
    });

    const totalPipeline = [...pipeline.slice(0, -1), { $count: 'total' }];
    const [providers, totalResult] = await Promise.all([
      require('../models/ProviderService').aggregate([...pipeline, { $skip: skip }, { $limit: limit }]),
      require('../models/ProviderService').aggregate(totalPipeline),
    ]);
    const total = totalResult[0]?.total || 0;

    return sendSuccess(res, 200, 'Providers fetched', providers, buildPaginationMeta(total, page, limit));
  });

  
  getProviderDetails = asyncHandler(async (req, res) => {
    const provider = await User.findOne({ _id: req.params.id, role: 'provider' });
    if (!provider) throw new ApiError(404, 'Provider not found');

    const ProviderService = require('../models/ProviderService');
    const Review = require('../models/Review');

    const [services, reviews, ratingSummary] = await Promise.all([
      ProviderService.find({ providerId: provider._id, status: 'active' }).populate('serviceId'),
      Review.find({ providerId: provider._id }).populate('customerId', 'name profileImage').sort({ createdAt: -1 }),
      Review.aggregate([
        { $match: { providerId: provider._id } },
        { $group: { _id: '$providerId', avgRating: { $avg: '$rating' }, totalReviews: { $sum: 1 } } },
      ]),
    ]);

    return sendSuccess(res, 200, 'Provider details fetched', {
      provider: provider.toSafeObject(),
      services,
      reviews,
      ratingSummary: ratingSummary[0] || { avgRating: 0, totalReviews: 0 },
    });
  });

  
  getProviderAvailability = asyncHandler(async (req, res) => {
    const provider = await User.findOne({ _id: req.params.id, role: 'provider' });
    if (!provider) throw new ApiError(404, 'Provider not found');

    const availability = await Availability.find({ providerId: provider._id }).select('day startTime endTime isAvailable');

    const { date } = req.query;
    if (!date) {
      return sendSuccess(res, 200, 'Availability fetched', { providerId: provider._id, availability });
    }

    const dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
    const isWorkingDay = availability.some((a) => a.day === dayName && a.isAvailable);

    const dateOnly = new Date(date);
    dateOnly.setHours(0, 0, 0, 0);
    const nextDay = new Date(dateOnly);
    nextDay.setDate(nextDay.getDate() + 1);

    const ACTIVE_BOOKING_STATUSES = ['Pending', 'Confirmed', 'OnTheWay', 'Started'];
    const bookings = await Booking.find({
      providerId: provider._id,
      bookingDate: { $gte: dateOnly, $lt: nextDay },
      status: { $in: ACTIVE_BOOKING_STATUSES },
    }).select('timeSlot');

    return sendSuccess(res, 200, 'Availability fetched', {
      providerId: provider._id,
      date,
      day: dayName,
      isWorkingDay,
      availability,
      bookedSlots: bookings.map((b) => b.timeSlot),
    });
  });
}

module.exports = new CustomerController();
