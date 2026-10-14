const asyncHandler = require('../utils/asyncHandler');
const { ApiError, sendSuccess } = require('../utils/responseUtils');
const mongoose = require('mongoose');
const User = require('../models/User');
const Service = require('../models/Service');
const ProviderService = require('../models/ProviderService');
const Availability = require('../models/Availability');
const Booking = require('../models/Booking');
const Review = require('../models/Review');
const { uploadBufferToCloudinary, deleteImageByUrl } = require('../utils/cloudinaryUtils');

class ProviderController {
  
  updateProfile = asyncHandler(async (req, res) => {
    const { name, phone, experience, description, location, skills, serviceAreas } = req.body;
    const provider = await User.findById(req.user._id);
    const oldImage = provider.profileImage;

    if (name) provider.name = name;
    if (phone) provider.phone = phone;
    if (experience !== undefined) provider.experience = experience;
    if (description !== undefined) provider.description = description;
    if (location !== undefined) provider.location = location;
    if (skills) provider.skills = Array.isArray(skills) ? skills : provider.skills;
    if (serviceAreas) provider.serviceAreas = Array.isArray(serviceAreas) ? serviceAreas : provider.serviceAreas;
    if (req.file) {
      const result = await uploadBufferToCloudinary(req.file.buffer, 'homeserve/profiles');
      provider.profileImage = result.secure_url;
    }

    await provider.save();
   
    if (oldImage && oldImage !== provider.profileImage) await deleteImageByUrl(oldImage);
    return sendSuccess(res, 200, 'Profile updated', provider.toSafeObject());
  });

  
  getProfile = asyncHandler(async (req, res) => {
    const providerId = req.user._id;

    const [completedJobs, ratingSummary] = await Promise.all([
      Booking.countDocuments({ providerId, status: 'Completed' }),
      Review.aggregate([
        { $match: { providerId } },
        { $group: { _id: '$providerId', avgRating: { $avg: '$rating' }, totalReviews: { $sum: 1 } } },
      ]),
    ]);

    return sendSuccess(res, 200, 'Profile fetched', {
      profile: req.user.toSafeObject(),
      completedJobs,
      ratingSummary: ratingSummary[0] || { avgRating: 0, totalReviews: 0 },
    });
  });

 
  addService = asyncHandler(async (req, res) => {
    if (!req.user.isApproved) {
      throw new ApiError(403, 'Your account is not yet approved by admin');
    }

    const { serviceId, price, experience } = req.body;
    if (!serviceId || price === undefined) {
      throw new ApiError(400, 'serviceId and price are required');
    }

    const service = await Service.findById(serviceId);
    if (!service || service.status !== 'active') {
      throw new ApiError(404, 'Service not found or inactive');
    }

    const existing = await ProviderService.findOne({ providerId: req.user._id, serviceId });
    if (existing) throw new ApiError(409, 'You already offer this service');

    const providerService = await ProviderService.create({
      providerId: req.user._id,
      serviceId,
      price,
      experience: experience || 0,
    });

    return sendSuccess(res, 201, 'Service added', providerService);
  });

 
  getMyServices = asyncHandler(async (req, res) => {
    const services = await ProviderService.find({ providerId: req.user._id }).populate('serviceId');
    return sendSuccess(res, 200, 'Services fetched', services);
  });

 
  updateService = asyncHandler(async (req, res) => {
    const providerService = await ProviderService.findOne({ _id: req.params.id, providerId: req.user._id });
    if (!providerService) throw new ApiError(404, 'Offered service not found');

    const { price, status } = req.body;
    if (price !== undefined) providerService.price = price;
    if (status) providerService.status = status;

    await providerService.save();
    return sendSuccess(res, 200, 'Service updated', providerService);
  });

  
  removeService = asyncHandler(async (req, res) => {
    const providerService = await ProviderService.findOne({ _id: req.params.id, providerId: req.user._id });
    if (!providerService) throw new ApiError(404, 'Offered service not found');

    await providerService.deleteOne();
    return sendSuccess(res, 200, 'Service removed');
  });

  
  setAvailability = asyncHandler(async (req, res) => {
    const { availability } = req.body; 
    if (!Array.isArray(availability) || availability.length === 0) {
      throw new ApiError(400, 'availability array is required');
    }

    const results = [];
    for (const slot of availability) {
      const { day, startTime, endTime, isAvailable } = slot;
      if (!day || !startTime || !endTime) {
        throw new ApiError(400, 'day, startTime and endTime are required for each slot');
      }
      const updated = await Availability.findOneAndUpdate(
        { providerId: req.user._id, day },
        { startTime, endTime, isAvailable: isAvailable !== false },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      results.push(updated);
    }

    return sendSuccess(res, 200, 'Availability updated', results);
  });

  
  getAvailability = asyncHandler(async (req, res) => {
    const availability = await Availability.find({ providerId: req.user._id });
    return sendSuccess(res, 200, 'Availability fetched', availability);
  });

 
  getPublicAvailability = asyncHandler(async (req, res) => {
    const provider = await User.findOne({ _id: req.params.id, role: 'provider' });
    if (!provider) throw new ApiError(404, 'Provider not found');

    const availability = await Availability.find({ providerId: provider._id }).select(
      'day startTime endTime isAvailable -_id'
    );

    const result = {
      providerId: provider._id,
      availability,
      date: null,
      day: null,
      isWorkingDay: null,
      bookedSlots: [],
    };

    const { date } = req.query;
    if (date) {
      const parsed = new Date(date);
      if (Number.isNaN(parsed.getTime())) throw new ApiError(400, 'Invalid date');

      const day = parsed.toLocaleDateString('en-US', { weekday: 'long' });
      const dayRecord = availability.find((a) => a.day === day);

      const dateOnly = new Date(date);
      dateOnly.setHours(0, 0, 0, 0);
      const nextDay = new Date(dateOnly);
      nextDay.setDate(nextDay.getDate() + 1);

      const booked = await Booking.find({
        providerId: provider._id,
        bookingDate: { $gte: dateOnly, $lt: nextDay },
        status: { $in: ['Pending', 'Confirmed', 'OnTheWay', 'Started'] },
      }).select('timeSlot');

      result.date = date;
      result.day = day;
      result.isWorkingDay = Boolean(dayRecord && dayRecord.isAvailable);
      result.bookedSlots = booked.map((b) => b.timeSlot);
    }

    return sendSuccess(res, 200, 'Availability fetched', result);
  });

  
  getBookingRequests = asyncHandler(async (req, res) => {
    const bookings = await Booking.find({ providerId: req.user._id, status: 'Pending' })
      .populate('customerId', 'name phone profileImage')
      .populate('serviceId', 'name basePrice')
      .populate('addressId')
      .sort({ createdAt: -1 });

    return sendSuccess(res, 200, 'Booking requests fetched', bookings);
  });

 
  getMyBookings = asyncHandler(async (req, res) => {
    const { status } = req.query;
    const filter = { providerId: req.user._id };

   
    const statusGroups = {
      active: ['Confirmed', 'OnTheWay', 'Started'],
      completed: ['Completed'],
      rejected: ['Rejected'],
      cancelled: ['Cancelled'],
    };
    if (status && statusGroups[status]) {
      filter.status = { $in: statusGroups[status] };
    }

    const bookings = await Booking.find(filter)
      .populate('customerId', 'name phone profileImage')
      .populate('serviceId', 'name basePrice')
      .populate('addressId')
      .sort({ bookingDate: -1 });

    return sendSuccess(res, 200, 'Bookings fetched', bookings);
  });


  getEarnings = asyncHandler(async (req, res) => {
    const providerId = req.user._id;

    const totalEarningsResult = await Booking.aggregate([
      { $match: { providerId, status: 'Completed' } },
      { $group: { _id: '$providerId', totalEarnings: { $sum: '$price' }, completedJobs: { $sum: 1 } } },
    ]);

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentMonthResult = await Booking.aggregate([
      {
        $match: {
          providerId,
          status: 'Completed',
          updatedAt: { $gte: startOfMonth },
        },
      },
      { $group: { _id: null, currentMonthEarnings: { $sum: '$price' }, currentMonthJobs: { $sum: 1 } } },
    ]);

    return sendSuccess(res, 200, 'Earnings fetched', {
      total: totalEarningsResult[0] || { totalEarnings: 0, completedJobs: 0 },
      currentMonth: currentMonthResult[0] || { currentMonthEarnings: 0, currentMonthJobs: 0 },
    });
  });

  
  getReviews = asyncHandler(async (req, res) => {
    const providerId = req.user._id;

    const [reviews, distribution, summary] = await Promise.all([
      Review.find({ providerId }).populate('customerId', 'name profileImage').sort({ createdAt: -1 }),
      Review.aggregate([
        { $match: { providerId } },
        { $group: { _id: '$rating', count: { $sum: 1 } } },
        { $sort: { _id: -1 } },
      ]),
      Review.aggregate([
        { $match: { providerId } },
        { $group: { _id: '$providerId', avgRating: { $avg: '$rating' }, totalReviews: { $sum: 1 } } },
      ]),
    ]);

    return sendSuccess(res, 200, 'Reviews fetched', {
      reviews,
      ratingDistribution: distribution,
      summary: summary[0] || { avgRating: 0, totalReviews: 0 },
    });
  });
}

module.exports = new ProviderController();
