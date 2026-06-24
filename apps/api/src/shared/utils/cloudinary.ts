import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';

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
  return new Promise((resolve, reject) => {
    // Fallback if Cloudinary is not configured in this environment
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      try {
        const uploadDir = path.resolve(process.cwd(), "uploads");
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.png`;
        const filePath = path.join(uploadDir, fileName);
        fs.writeFileSync(filePath, fileBuffer);

        const apiBaseUrl = process.env.API_BASE_URL || "http://localhost:4002";
        resolve({
          url: `${apiBaseUrl}/uploads/${fileName}`,
          publicId: `local_${fileName}`
        });
      } catch (err) {
        console.error("Local upload fallback failed:", err);
        reject(err);
      }
      return;
    }

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
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.warn("Cloudinary credentials are not configured. Skipping mock image deletion.");
      return;
    }
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Failed to delete image from Cloudinary:', error);
    throw error;
  }
};
