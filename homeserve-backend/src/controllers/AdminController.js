const asyncHandler = require('../utils/asyncHandler');
const { ApiError, sendSuccess } = require('../utils/responseUtils');
const { getPaginationParams, buildPaginationMeta } = require('../utils/paginationUtils');
const mongoose = require('mongoose');
const User = require('../models/User');
const Booking = require('../models/Booking');
const Review = require('../models/Review');
const Complaint = require('../models/Complaint');
const Service = require('../models/Service');
const Category = require('../models/Category');

class AdminController {
  

  
  getCustomers = asyncHandler(async (req, res) => {
    const { page, limit, skip } = getPaginationParams(req.query);
    const { search, status } = req.query;

    const filter = { role: 'customer' };
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const [customers, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(filter),
    ]);

    return sendSuccess(res, 200, 'Customers fetched', customers, buildPaginationMeta(total, page, limit));
  });

  
  getCustomerDetails = asyncHandler(async (req, res) => {
    const customer = await User.findOne({ _id: req.params.id, role: 'customer' });
    if (!customer) throw new ApiError(404, 'Customer not found');

    const bookings = await Booking.find({ customerId: customer._id })
      .populate('serviceId', 'name')
      .populate('providerId', 'name')
      .sort({ bookingDate: -1 });

    return sendSuccess(res, 200, 'Customer details fetched', { customer, bookings });
  });

  
  toggleCustomerBlock = asyncHandler(async (req, res) => {
    const customer = await User.findOne({ _id: req.params.id, role: 'customer' });
    if (!customer) throw new ApiError(404, 'Customer not found');

    customer.status = customer.status === 'active' ? 'blocked' : 'active';
    await customer.save();

    return sendSuccess(res, 200, `Customer ${customer.status === 'blocked' ? 'blocked' : 'unblocked'}`, customer);
  });

  

  
  getProviders = asyncHandler(async (req, res) => {
    const { page, limit, skip } = getPaginationParams(req.query);
    const { search, status, approvalStatus } = req.query;

    const filter = { role: 'provider' };
    if (status) filter.status = status;
    if (approvalStatus) filter.approvalStatus = approvalStatus;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const [providers, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(filter),
    ]);

    return sendSuccess(res, 200, 'Providers fetched', providers, buildPaginationMeta(total, page, limit));
  });

  
  getProviderDetails = asyncHandler(async (req, res) => {
    const provider = await User.findOne({ _id: req.params.id, role: 'provider' });
    if (!provider) throw new ApiError(404, 'Provider not found');

    const ProviderService = require('../models/ProviderService');
    const [services, bookings, reviews] = await Promise.all([
      ProviderService.find({ providerId: provider._id }).populate('serviceId'),
      Booking.find({ providerId: provider._id }).populate('serviceId', 'name').populate('customerId', 'name'),
      Review.find({ providerId: provider._id }).populate('customerId', 'name'),
    ]);

    return sendSuccess(res, 200, 'Provider details fetched', { provider, services, bookings, reviews });
  });

  
  approveProvider = asyncHandler(async (req, res) => {
    const provider = await User.findOne({ _id: req.params.id, role: 'provider' });
    if (!provider) throw new ApiError(404, 'Provider not found');

    provider.isApproved = true;
    provider.approvalStatus = 'approved';
    await provider.save();

    return sendSuccess(res, 200, 'Provider approved', provider);
  });

  
  rejectProvider = asyncHandler(async (req, res) => {
    const provider = await User.findOne({ _id: req.params.id, role: 'provider' });
    if (!provider) throw new ApiError(404, 'Provider not found');

    provider.isApproved = false;
    provider.approvalStatus = 'rejected';
    await provider.save();

    return sendSuccess(res, 200, 'Provider rejected', provider);
  });

  
  toggleProviderBlock = asyncHandler(async (req, res) => {
    const provider = await User.findOne({ _id: req.params.id, role: 'provider' });
    if (!provider) throw new ApiError(404, 'Provider not found');

    provider.status = provider.status === 'active' ? 'blocked' : 'active';
    await provider.save();

    return sendSuccess(res, 200, `Provider ${provider.status === 'blocked' ? 'blocked' : 'unblocked'}`, provider);
  });

  

  
  getAllBookings = asyncHandler(async (req, res) => {
    const { page, limit, skip } = getPaginationParams(req.query);
    const { status, provider, customer, service, fromDate, toDate } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (provider) filter.providerId = provider;
    if (customer) filter.customerId = customer;
    if (service) filter.serviceId = service;
    if (fromDate || toDate) {
      filter.bookingDate = {};
      if (fromDate) filter.bookingDate.$gte = new Date(fromDate);
      if (toDate) filter.bookingDate.$lte = new Date(toDate);
    }

    const [bookings, total] = await Promise.all([
      Booking.find(filter)
        .populate('customerId', 'name')
        .populate('providerId', 'name')
        .populate('serviceId', 'name')
        .sort({ bookingDate: -1 })
        .skip(skip)
        .limit(limit),
      Booking.countDocuments(filter),
    ]);

    return sendSuccess(res, 200, 'Bookings fetched', bookings, buildPaginationMeta(total, page, limit));
  });

  
  getBookingDetails = asyncHandler(async (req, res) => {
    const result = await Booking.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(req.params.id) } },
      { $lookup: { from: 'users', localField: 'customerId', foreignField: '_id', as: 'customer' } },
      { $lookup: { from: 'users', localField: 'providerId', foreignField: '_id', as: 'provider' } },
      { $lookup: { from: 'services', localField: 'serviceId', foreignField: '_id', as: 'service' } },
      { $lookup: { from: 'addresses', localField: 'addressId', foreignField: '_id', as: 'address' } },
      { $unwind: '$customer' },
      { $unwind: '$provider' },
      { $unwind: '$service' },
      { $unwind: '$address' },
      {
        $project: {
          status: 1,
          bookingDate: 1,
          timeSlot: 1,
          price: 1,
          paymentStatus: 1,
          statusHistory: 1,
          createdAt: 1,
          'customer._id': 1,
          'customer.name': 1,
          'customer.phone': 1,
          'provider._id': 1,
          'provider.name': 1,
          'provider.phone': 1,
          'service.name': 1,
          'service.basePrice': 1,
          address: 1,
        },
      },
    ]);

    if (!result.length) throw new ApiError(404, 'Booking not found');
    return sendSuccess(res, 200, 'Booking details fetched', result[0]);
  });

 

 
  getReviews = asyncHandler(async (req, res) => {
    const { page, limit, skip } = getPaginationParams(req.query);
    const { reported } = req.query;

    const filter = {};
    if (reported === 'true') filter.isReported = true;

    const [reviews, total] = await Promise.all([
      Review.find(filter)
        .populate('customerId', 'name')
        .populate('providerId', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Review.countDocuments(filter),
    ]);

    return sendSuccess(res, 200, 'Reviews fetched', reviews, buildPaginationMeta(total, page, limit));
  });

  
  removeReview = asyncHandler(async (req, res) => {
    const review = await Review.findById(req.params.id);
    if (!review) throw new ApiError(404, 'Review not found');

    await review.deleteOne();
    return sendSuccess(res, 200, 'Review removed');
  });

  
  getComplaints = asyncHandler(async (req, res) => {
    const { page, limit, skip } = getPaginationParams(req.query);
    const { status } = req.query;

    const filter = {};
    if (status) filter.status = status;

    const [complaints, total] = await Promise.all([
      Complaint.find(filter)
        .populate('customerId', 'name')
        .populate('providerId', 'name')
        .populate('bookingId')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Complaint.countDocuments(filter),
    ]);

    return sendSuccess(res, 200, 'Complaints fetched', complaints, buildPaginationMeta(total, page, limit));
  });

  
  updateComplaint = asyncHandler(async (req, res) => {
    const { status, adminRemark } = req.body;
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) throw new ApiError(404, 'Complaint not found');

    if (status) complaint.status = status;
    if (adminRemark !== undefined) complaint.adminRemark = adminRemark;

    await complaint.save();
    return sendSuccess(res, 200, 'Complaint updated', complaint);
  });

  

  
  getDashboard = asyncHandler(async (req, res) => {
    const [
      totalCustomers,
      totalProviders,
      totalServices,
      totalBookings,
      approvedProviders,
      pendingProviders,
      completedBookings,
      cancelledBookings,
      revenueResult,
    ] = await Promise.all([
      User.countDocuments({ role: 'customer' }),
      User.countDocuments({ role: 'provider' }),
      Service.countDocuments(),
      Booking.countDocuments(),
      User.countDocuments({ role: 'provider', isApproved: true }),
      User.countDocuments({ role: 'provider', approvalStatus: 'pending' }),
      Booking.countDocuments({ status: 'Completed' }),
      Booking.countDocuments({ status: 'Cancelled' }),
      Booking.aggregate([
        { $match: { status: 'Completed' } },
        { $group: { _id: null, totalRevenue: { $sum: '$price' } } },
      ]),
    ]);

    return sendSuccess(res, 200, 'Dashboard stats fetched', {
      totalCustomers,
      totalProviders,
      totalServices,
      totalBookings,
      approvedProviders,
      pendingProviders,
      completedBookings,
      cancelledBookings,
      totalRevenue: revenueResult[0]?.totalRevenue || 0,
    });
  });

 
  getRevenueReport = asyncHandler(async (req, res) => {
    const monthlyRevenue = await Booking.aggregate([
      { $match: { status: 'Completed' } },
      {
        $group: {
          _id: { year: { $year: '$bookingDate' }, month: { $month: '$bookingDate' } },
          totalRevenue: { $sum: '$price' },
          totalBookings: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
    ]);

    return sendSuccess(res, 200, 'Revenue report fetched', monthlyRevenue);
  });

 
  getTopServices = asyncHandler(async (req, res) => {
    const limit = Number(req.query.limit) || 5;

    const topServices = await Booking.aggregate([
      { $match: { status: 'Completed' } },
      { $group: { _id: '$serviceId', bookingCount: { $sum: 1 } } },
      { $lookup: { from: 'services', localField: '_id', foreignField: '_id', as: 'service' } },
      { $unwind: '$service' },
      { $project: { bookingCount: 1, 'service.name': 1, 'service.basePrice': 1 } },
      { $sort: { bookingCount: -1 } },
      { $limit: limit },
    ]);

    return sendSuccess(res, 200, 'Top services fetched', topServices);
  });

  
  getTopProviders = asyncHandler(async (req, res) => {
    const limit = Number(req.query.limit) || 5;

    const topProviders = await Booking.aggregate([
      { $match: { status: 'Completed' } },
      { $group: { _id: '$providerId', completedJobs: { $sum: 1 }, totalEarnings: { $sum: '$price' } } },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'provider' } },
      { $unwind: '$provider' },
      { $project: { completedJobs: 1, totalEarnings: 1, 'provider.name': 1, 'provider.profileImage': 1 } },
      { $sort: { completedJobs: -1 } },
      { $limit: limit },
    ]);

    return sendSuccess(res, 200, 'Top providers fetched', topProviders);
  });

 
  getProviderRatingSummaries = asyncHandler(async (req, res) => {
    const summaries = await Review.aggregate([
      { $group: { _id: '$providerId', avgRating: { $avg: '$rating' }, totalReviews: { $sum: 1 } } },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'provider' } },
      { $unwind: '$provider' },
      { $project: { avgRating: 1, totalReviews: 1, 'provider.name': 1 } },
      { $sort: { avgRating: -1 } },
    ]);

    return sendSuccess(res, 200, 'Provider rating summaries fetched', summaries);
  });

 
  getProvidersWithServices = asyncHandler(async (req, res) => {
    const ProviderService = require('../models/ProviderService');
    const data = await ProviderService.aggregate([
      { $lookup: { from: 'users', localField: 'providerId', foreignField: '_id', as: 'provider' } },
      { $lookup: { from: 'services', localField: 'serviceId', foreignField: '_id', as: 'service' } },
      { $unwind: '$provider' },
      { $unwind: '$service' },
      { $lookup: { from: 'categories', localField: 'service.categoryId', foreignField: '_id', as: 'category' } },
      { $unwind: '$category' },
      {
        $project: {
          price: 1,
          experience: 1,
          status: 1,
          'provider.name': 1,
          'service.name': 1,
          'category.name': 1,
        },
      },
    ]);

    return sendSuccess(res, 200, 'Providers with services fetched', data);
  });
}

module.exports = new AdminController();
