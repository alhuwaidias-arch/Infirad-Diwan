// Cloudinary Storage Configuration
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Upload file to Cloudinary
 * @param {Buffer} fileBuffer - File buffer
 * @param {Object} options - Upload options
 * @returns {Promise<Object>} Upload result
 */
async function uploadToCloudinary(fileBuffer, options = {}) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: options.folder || 'diwan-maarifa',
        resource_type: options.resourceType || 'auto',
        public_id: options.publicId,
        transformation: options.transformation,
        ...options
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    uploadStream.end(fileBuffer);
  });
}

/**
 * Delete file from Cloudinary
 * @param {String} publicId - Public ID of the file
 * @param {String} resourceType - Resource type (image, video, raw)
 * @returns {Promise<Object>} Deletion result
 */
async function deleteFromCloudinary(publicId, resourceType = 'image') {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType
    });
    return result;
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw error;
  }
}

/**
 * Get optimized image URL
 * @param {String} publicId - Public ID of the image
 * @param {Object} options - Transformation options
 * @returns {String} Optimized image URL
 */
function getOptimizedImageUrl(publicId, options = {}) {
  return cloudinary.url(publicId, {
    width: options.width || 800,
    height: options.height,
    crop: options.crop || 'limit',
    quality: options.quality || 'auto',
    fetch_format: 'auto',
    ...options
  });
}

module.exports = {
  cloudinary,
  uploadToCloudinary,
  deleteFromCloudinary,
  getOptimizedImageUrl
};
