const asyncHandler = require('../utils/asyncHandler');
const { ApiError, sendSuccess } = require('../utils/responseUtils');
const Booking = require('../models/Booking');
const Complaint = require('../models/Complaint');

class ComplaintController {
  
  create = asyncHandler(async (req, res) => {
    const { bookingId, subject, description } = req.body;
    if (!bookingId || !subject || !description) {
      throw new ApiError(400, 'bookingId, subject and description are required');
    }

    const booking = await Booking.findOne({ _id: bookingId, customerId: req.user._id });
    if (!booking) throw new ApiError(404, 'Booking not found');

   
    const eligibleStatuses = ['Confirmed', 'OnTheWay', 'Started', 'Completed', 'Cancelled', 'Rejected'];
    if (!eligibleStatuses.includes(booking.status)) {
      throw new ApiError(400, 'This booking is not eligible for a complaint');
    }

    const complaint = await Complaint.create({
      bookingId,
      customerId: req.user._id,
      providerId: booking.providerId,
      subject,
      description,
    });

    return sendSuccess(res, 201, 'Complaint submitted', complaint);
  });

 
  getMyComplaints = asyncHandler(async (req, res) => {
    const complaints = await Complaint.find({ customerId: req.user._id })
      .populate('bookingId')
      .populate('providerId', 'name profileImage')
      .sort({ createdAt: -1 });

    return sendSuccess(res, 200, 'Complaints fetched', complaints);
  });

 
  getById = asyncHandler(async (req, res) => {
    const complaint = await Complaint.findById(req.params.id).populate('bookingId').populate('providerId', 'name');
    if (!complaint) throw new ApiError(404, 'Complaint not found');

    const isOwner = complaint.customerId.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin') {
      throw new ApiError(403, 'You do not have access to this complaint');
    }

    return sendSuccess(res, 200, 'Complaint fetched', complaint);
  });
}

module.exports = new ComplaintController();
