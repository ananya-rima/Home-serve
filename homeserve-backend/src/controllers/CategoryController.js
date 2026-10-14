const asyncHandler = require('../utils/asyncHandler');
const { ApiError, sendSuccess } = require('../utils/responseUtils');
const { getPaginationParams, buildPaginationMeta } = require('../utils/paginationUtils');
const Category = require('../models/Category');
const Service = require('../models/Service');
const { uploadBufferToCloudinary, deleteImageByUrl } = require('../utils/cloudinaryUtils');

class CategoryController {
  
  create = asyncHandler(async (req, res) => {
    const { name, description, image } = req.body;
    if (!name) throw new ApiError(400, 'Category name is required');

    const existing = await Category.findOne({ name });
    if (existing) throw new ApiError(409, 'Category with this name already exists');

    let finalImage = image || '';
    if (req.file) {
      const result = await uploadBufferToCloudinary(req.file.buffer, 'homeserve/categories');
      finalImage = result.secure_url;
    }

    const category = await Category.create({ name, description, image: finalImage });
    return sendSuccess(res, 201, 'Category created', category);
  });

  
  getAll = asyncHandler(async (req, res) => {
    const { page, limit, skip } = getPaginationParams(req.query);
    const filter = {};
    if (req.query.status) filter.status = req.query.status;

    const [categories, total] = await Promise.all([
      Category.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Category.countDocuments(filter),
    ]);

    return sendSuccess(res, 200, 'Categories fetched', categories, buildPaginationMeta(total, page, limit));
  });

  
  getById = asyncHandler(async (req, res) => {
    const category = await Category.findById(req.params.id);
    if (!category) throw new ApiError(404, 'Category not found');
    return sendSuccess(res, 200, 'Category fetched', category);
  });

  
  update = asyncHandler(async (req, res) => {
    const { name, description, image, status } = req.body;
    const category = await Category.findById(req.params.id);
    if (!category) throw new ApiError(404, 'Category not found');
    const oldImage = category.image;

    if (name) category.name = name;
    if (description !== undefined) category.description = description;
    if (image !== undefined) category.image = image;
    if (status) category.status = status;

    if (req.file) {
      const result = await uploadBufferToCloudinary(req.file.buffer, 'homeserve/categories');
      category.image = result.secure_url;
    }

    await category.save();
    if (oldImage && oldImage !== category.image) await deleteImageByUrl(oldImage);
    return sendSuccess(res, 200, 'Category updated', category);
  });


  remove = asyncHandler(async (req, res) => {
    const category = await Category.findById(req.params.id);
    if (!category) throw new ApiError(404, 'Category not found');

    const linkedServices = await Service.countDocuments({ categoryId: category._id });
    if (linkedServices > 0) {
      throw new ApiError(400, 'Cannot delete category with existing services. Deactivate it instead.');
    }

    await category.deleteOne();
    await deleteImageByUrl(category.image);
    return sendSuccess(res, 200, 'Category deleted');
  });

  
  toggleStatus = asyncHandler(async (req, res) => {
    const category = await Category.findById(req.params.id);
    if (!category) throw new ApiError(404, 'Category not found');

    category.status = category.status === 'active' ? 'inactive' : 'active';
    await category.save();
    return sendSuccess(res, 200, 'Category status updated', category);
  });
}

module.exports = new CategoryController();
