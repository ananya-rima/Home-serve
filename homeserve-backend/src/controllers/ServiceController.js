const asyncHandler = require('../utils/asyncHandler');
const { ApiError, sendSuccess } = require('../utils/responseUtils');
const { getPaginationParams, buildPaginationMeta } = require('../utils/paginationUtils');
const mongoose = require('mongoose');
const Service = require('../models/Service');
const Category = require('../models/Category');
const ProviderService = require('../models/ProviderService');
const { uploadBufferToCloudinary, deleteImageByUrl } = require('../utils/cloudinaryUtils');

class ServiceController {
  
  create = asyncHandler(async (req, res) => {
    const { categoryId, name, description, basePrice, duration, image } = req.body;
    if (!categoryId || !name || basePrice === undefined || !duration) {
      throw new ApiError(400, 'categoryId, name, basePrice and duration are required');
    }

    const category = await Category.findById(categoryId);
    if (!category) throw new ApiError(404, 'Category not found');

    let finalImage = image || '';
    if (req.file) {
      const result = await uploadBufferToCloudinary(req.file.buffer, 'homeserve/services');
      finalImage = result.secure_url;
    }

    const service = await Service.create({
      categoryId,
      name,
      description,
      basePrice,
      duration,
      image: finalImage,
    });
    return sendSuccess(res, 201, 'Service created', service);
  });

 
  getAll = asyncHandler(async (req, res) => {
    const { page, limit, skip } = getPaginationParams(req.query);
    const { search, category, minPrice, maxPrice, sort, status } = req.query;

    const filter = {};
    filter.status = status || 'active';
    if (category) filter.categoryId = category;
    if (search) filter.$text = { $search: search };
    if (minPrice || maxPrice) {
      filter.basePrice = {};
      if (minPrice) filter.basePrice.$gte = Number(minPrice);
      if (maxPrice) filter.basePrice.$lte = Number(maxPrice);
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'price_asc') sortOption = { basePrice: 1 };
    if (sort === 'price_desc') sortOption = { basePrice: -1 };

    const [services, total] = await Promise.all([
      Service.find(filter).populate('categoryId', 'name').sort(sortOption).skip(skip).limit(limit),
      Service.countDocuments(filter),
    ]);

    return sendSuccess(res, 200, 'Services fetched', services, buildPaginationMeta(total, page, limit));
  });

  
  getById = asyncHandler(async (req, res) => {
    const service = await Service.findById(req.params.id).populate('categoryId', 'name');
    if (!service) throw new ApiError(404, 'Service not found');

    const providers = await ProviderService.aggregate([
      { $match: { serviceId: new mongoose.Types.ObjectId(req.params.id), status: 'active' } },
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
      {
        $project: {
          _id: 1,
          price: 1,
          experience: 1,
          'provider._id': 1,
          'provider.name': 1,
          'provider.profileImage': 1,
          'provider.location': 1,
        },
      },
    ]);

    return sendSuccess(res, 200, 'Service fetched', { service, providers });
  });

 
  update = asyncHandler(async (req, res) => {
    const service = await Service.findById(req.params.id);
    if (!service) throw new ApiError(404, 'Service not found');
    const oldImage = service.image;

    const fields = ['categoryId', 'name', 'description', 'basePrice', 'duration', 'image', 'status'];
    fields.forEach((field) => {
      if (req.body[field] !== undefined) service[field] = req.body[field];
    });

    if (req.file) {
      const result = await uploadBufferToCloudinary(req.file.buffer, 'homeserve/services');
      service.image = result.secure_url;
    }

    await service.save();
    if (oldImage && oldImage !== service.image) await deleteImageByUrl(oldImage);
    return sendSuccess(res, 200, 'Service updated', service);
  });

 
  remove = asyncHandler(async (req, res) => {
    const service = await Service.findById(req.params.id);
    if (!service) throw new ApiError(404, 'Service not found');

    await service.deleteOne();
    await deleteImageByUrl(service.image);
    return sendSuccess(res, 200, 'Service deleted');
  });
}

module.exports = new ServiceController();
