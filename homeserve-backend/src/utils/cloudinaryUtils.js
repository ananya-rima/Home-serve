const cloudinary = require('../config/cloudinary');
const { ApiError } = require('./responseUtils');


const uploadBufferToCloudinary = (buffer, folder = 'homeserve') =>
  new Promise((resolve, reject) => {
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return reject(new ApiError(500, 'Cloudinary is not configured. Set CLOUDINARY_* variables in .env'));
    }

    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image' },
      (error, result) => {
        if (error) return reject(new ApiError(500, `Image upload failed: ${error.message}`));
        resolve(result);
      }
    );
    stream.end(buffer);
  });


const extractPublicId = (url) => {
  if (!url || typeof url !== 'string' || !url.includes('res.cloudinary.com')) return null;
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[A-Za-z0-9]+$/);
  return match ? decodeURIComponent(match[1]) : null;
};


const deleteImageByUrl = async (url) => {
  const publicId = extractPublicId(url);
  if (!publicId) return;
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) return;

  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
  } catch (error) {
    console.error(`Cloudinary cleanup failed for ${publicId}:`, error.message);
  }
};

module.exports = { uploadBufferToCloudinary, deleteImageByUrl, extractPublicId };
