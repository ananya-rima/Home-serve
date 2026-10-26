const asyncHandler = require('../utils/asyncHandler');
const { ApiError, sendSuccess } = require('../utils/responseUtils');
const { getPaginationParams, buildPaginationMeta } = require('../utils/paginationUtils');
const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const ProviderService = require('../models/ProviderService');
const Availability = require('../models/Availability');
const Service = require('../models/Service');
const Address = require('../models/Address');
const User = require('../models/User');
const Review = require('../models/Review');
const { emitToUser } = require('../config/socket');


const ALLOWED_TRANSITIONS = {
  Pending: ['Confirmed', 'Rejected', 'Cancelled'],
  Confirmed: ['OnTheWay', 'Cancelled'],
  OnTheWay: ['Started', 'Cancelled'],
  Started: ['Completed'],
  Completed: [],
  Rejected: [],
  Cancelled: [],
};

const ACTIVE_STATUSES = ['Pending', 'Confirmed', 'OnTheWay', 'Started'];


const JOB_PROGRESS_STATUSES = ['OnTheWay', 'Started', 'Completed'];

class BookingController {
 
  create = asyncHandler(async (req, res) => {
    const { serviceId, providerId, addressId, bookingDate, timeSlot } = req.body;
    if (!serviceId || !providerId || !addressId || !bookingDate || !timeSlot) {
      throw new ApiError(400, 'serviceId, providerId, addressId, bookingDate and timeSlot are required');
    }

    
    const address = await Address.findOne({ _id: addressId, userId: req.user._id });
    if (!address) throw new ApiError(404, 'Address not found');

    
    const service = await Service.findById(serviceId);
    if (!service || service.status !== 'active') {
      throw new ApiError(404, 'Service not found or inactive');
    }

    
    const provider = await User.findById(providerId);
    if (!provider || provider.role !== 'provider' || !provider.isApproved || provider.status !== 'active') {
      throw new ApiError(400, 'Provider is not available for booking');
    }

    
    const providerService = await ProviderService.findOne({
      providerId,
      serviceId,
      status: 'active',
    });
    if (!providerService) {
      throw new ApiError(400, 'This provider does not currently offer the selected service');
    }

    
    const dayName = new Date(bookingDate).toLocaleDateString('en-US', { weekday: 'long' });
    const availability = await Availability.findOne({ providerId, day: dayName, isAvailable: true });
    if (!availability) {
      throw new ApiError(400, `Provider is not available on ${dayName}`);
    }
    if (timeSlot < availability.startTime || timeSlot > availability.endTime) {
      throw new ApiError(400, 'Selected time slot is outside provider availability');
    }

    
    const dateOnly = new Date(bookingDate);
    dateOnly.setHours(0, 0, 0, 0);
    const nextDay = new Date(dateOnly);
    nextDay.setDate(nextDay.getDate() + 1);

    const conflict = await Booking.findOne({
      providerId,
      timeSlot,
      bookingDate: { $gte: dateOnly, $lt: nextDay },
      status: { $in: ACTIVE_STATUSES },
    });
    if (conflict) {
      throw new ApiError(409, 'This time slot is already booked for the selected provider');
    }

    const booking = await Booking.create({
      customerId: req.user._id,
      providerId,
      serviceId,
      addressId,
      bookingDate: dateOnly,
      timeSlot,
      price: providerService.price,
      status: 'Pending',
      statusHistory: [{ status: 'Pending', changedAt: new Date() }],
    });
      emitToUser(providerId, 'booking:new', {
    bookingId: booking._id,
    message: `New booking request from ${req.user.name} for ${service.name}`,
  });

    return sendSuccess(res, 201, 'Booking created', booking);
  });

  
  getMyBookings = asyncHandler(async (req, res) => {
    const { page, limit, skip } = getPaginationParams(req.query);
    const { status } = req.query;

    const matchStage = { customerId: req.user._id };
    if (status) matchStage.status = status;

    const basePipeline = [
      { $match: matchStage },
      { $lookup: { from: 'services', localField: 'serviceId', foreignField: '_id', as: 'service' } },
      { $lookup: { from: 'users', localField: 'providerId', foreignField: '_id', as: 'provider' } },
      { $lookup: { from: 'addresses', localField: 'addressId', foreignField: '_id', as: 'address' } },
      { $unwind: '$service' },
      { $unwind: '$provider' },
      { $unwind: '$address' },
      {
        $project: {
          status: 1,
          bookingDate: 1,
          timeSlot: 1,
          price: 1,
          paymentStatus: 1,
          createdAt: 1,
          'service.name': 1,
          'service.basePrice': 1,
          'service.image': 1,
          'provider._id': 1,
          'provider.name': 1,
          'provider.profileImage': 1,
          address: 1,
        },
      },
    ];

    const [bookings, totalResult] = await Promise.all([
      Booking.aggregate([...basePipeline, { $sort: { bookingDate: -1 } }, { $skip: skip }, { $limit: limit }]),
      Booking.aggregate([...basePipeline, { $count: 'total' }]),
    ]);
    const total = totalResult[0]?.total || 0;

    return sendSuccess(res, 200, 'Bookings fetched', bookings, buildPaginationMeta(total, page, limit));
  });

  
  getById = asyncHandler(async (req, res) => {
    const booking = await Booking.findById(req.params.id)
      .populate('serviceId')
      .populate('providerId', 'name phone profileImage')
      .populate('customerId', 'name phone profileImage')
      .populate('addressId');

    if (!booking) throw new ApiError(404, 'Booking not found');

    const isOwnerCustomer = booking.customerId._id.toString() === req.user._id.toString();
    const isOwnerProvider = booking.providerId._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwnerCustomer && !isOwnerProvider && !isAdmin) {
      throw new ApiError(403, 'You do not have access to this booking');
    }

    return sendSuccess(res, 200, 'Booking fetched', booking);
  });

  
  acceptBooking = asyncHandler(async (req, res) => {
    const booking = await this._getOwnedProviderBooking(req);
    this._applyTransition(booking, 'Confirmed');
    await booking.save();
    this._notifyCustomer(booking, 'Your booking was accepted');
    return sendSuccess(res, 200, 'Booking accepted', booking);
  });

  
  rejectBooking = asyncHandler(async (req, res) => {
    const booking = await this._getOwnedProviderBooking(req);
    this._applyTransition(booking, 'Rejected');
    await booking.save();
    this._notifyCustomer(booking, 'Your booking request was declined');
    return sendSuccess(res, 200, 'Booking rejected', booking);
  });

  
  updateStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;
    if (!status) throw new ApiError(400, 'status is required');

    const booking = await this._getOwnedProviderBooking(req);
    this._applyTransition(booking, status);
    this._notifyCustomer(booking, `Your booking is now ${status}`);
    await booking.save();

    return sendSuccess(res, 200, `Booking status updated to ${status}`, booking);
  });

  
  cancelBooking = asyncHandler(async (req, res) => {
    const booking = await Booking.findOne({ _id: req.params.id, customerId: req.user._id });
    if (!booking) throw new ApiError(404, 'Booking not found');

    if (!['Pending', 'Confirmed'].includes(booking.status)) {
      throw new ApiError(400, `Booking cannot be cancelled once it is ${booking.status}`);
    }

    this._applyTransition(booking, 'Cancelled');
    await booking.save();
      emitToUser(booking.providerId, 'booking:updated', {
    bookingId: booking._id,
    status: booking.status,
    message: 'A customer cancelled a booking',
  });

    return sendSuccess(res, 200, 'Booking cancelled', booking);
  });
    _notifyCustomer = (booking, message) => {
    emitToUser(booking.customerId, 'booking:updated', {
      bookingId: booking._id,
      status: booking.status,
      message,
    });
  };

  
  _getOwnedProviderBooking = async (req) => {
    const booking = await Booking.findOne({ _id: req.params.id, providerId: req.user._id });
    if (!booking) throw new ApiError(404, 'Booking not found');
    return booking;
  };

  
  

  _applyTransition = (booking, nextStatus) => {
    const allowed = ALLOWED_TRANSITIONS[booking.status] || [];
    if (!allowed.includes(nextStatus)) {
      throw new ApiError(400, `Invalid status transition from ${booking.status} to ${nextStatus}`);
    }

   
    const [startTime] = booking.timeSlot.split('-');
    const [hours, minutes] = (startTime || '00:00').split(':').map(Number);

    const scheduledTime = new Date(booking.bookingDate);
    scheduledTime.setHours(hours || 0, minutes || 0, 0, 0);

    const now = new Date();

    
    if (nextStatus === 'Confirmed' && now > scheduledTime) {
      throw new ApiError(400, 'You cannot confirm this booking as the scheduled time has already passed.');
    }

   
    if (JOB_PROGRESS_STATUSES.includes(nextStatus)) {
    
      const oneHourAfterSlot = new Date(scheduledTime.getTime() + 60 * 60 * 1000); 

      
      if (now < scheduledTime) {
        throw new ApiError(
          400,
          `This job is scheduled for ${scheduledTime.toLocaleString()}. You cannot update its status before that time.`
        );
      }

     
      if (now > oneHourAfterSlot) {
        throw new ApiError(
          400,
          `The time window to start this service has expired (more than 1 hour past the schedule). You can no longer mark it as ${nextStatus}.`
        );
      }
    }

    booking.status = nextStatus;
    booking.statusHistory.push({ status: nextStatus, changedAt: new Date() });
  };
}


module.exports = new BookingController();
