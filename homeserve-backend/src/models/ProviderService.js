const mongoose = require('mongoose');

const providerServiceSchema = new mongoose.Schema(
  {
    providerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
    price: { type: Number, required: true, min: 0 },
    experience: { type: Number, default: 0 },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  },
  { timestamps: true }
);

providerServiceSchema.index({ providerId: 1, serviceId: 1 }, { unique: true });

module.exports = mongoose.model('ProviderService', providerServiceSchema);
