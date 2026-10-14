const mongoose = require('mongoose');

const STATUS_VALUES = [
  'Pending',
  'Confirmed',
  'OnTheWay',
  'Started',
  'Completed',
  'Rejected',
  'Cancelled',
];

const bookingSchema = new mongoose.Schema(
  {
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    providerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
    addressId: { type: mongoose.Schema.Types.ObjectId, ref: 'Address', required: true },
    bookingDate: { type: Date, required: true },
    timeSlot: { type: String, required: true }, // e.g. "10:00-11:00"
    price: { type: Number, required: true, min: 0 },
    status: { type: String, enum: STATUS_VALUES, default: 'Pending' },
    paymentStatus: { type: String, enum: ['unpaid', 'paid'], default: 'unpaid' },
    statusHistory: [
      {
        status: { type: String, enum: STATUS_VALUES },
        changedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

bookingSchema.statics.STATUS_VALUES = STATUS_VALUES;


bookingSchema.index({ providerId: 1, bookingDate: 1, timeSlot: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
