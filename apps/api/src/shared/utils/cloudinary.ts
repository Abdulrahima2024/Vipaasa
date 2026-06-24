import { v2 as cloudinary } from 'cloudinary';

// Ensure this is called after dotenv config is loaded in the main app
export const configureCloudinary = () => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
};

export const uploadImageToCloudinary = async (
  fileBuffer: Buffer,
  folder: string = 'vipaasa-organics'
): Promise<{ url: string; publicId: string }> => {
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY) {
    console.warn("Cloudinary is not configured. Falling back to a placeholder image in development.");
    return {
      url: "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg",
      publicId: "placeholder-public-id",
    };
  }
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
      },
      (error, result) => {
        if (error) return reject(error);
        if (!result) return reject(new Error('Cloudinary upload failed: no result returned'));
        
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
        });
      }
    );

    uploadStream.end(fileBuffer);
  });
};

export const deleteImageFromCloudinary = async (publicId: string): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Failed to delete image from Cloudinary:', error);
    throw error;
  }
};
