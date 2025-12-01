import { v2 as cloudinary } from 'cloudinary';
import { config } from '../config/config';

// Configure Cloudinary
cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret
});

export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  url: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

export const cloudinaryService = {
  // Upload image from base64 string
  async uploadBase64(base64String: string, folder: string = 'products'): Promise<CloudinaryUploadResult> {
    try {
      const result = await cloudinary.uploader.upload(base64String, {
        folder: `georgy-marketplace/${folder}`,
        resource_type: 'image',
        transformation: [
          { width: 1200, height: 1200, crop: 'limit' },
          { quality: 'auto:good' },
          { fetch_format: 'auto' }
        ]
      });
      
      return {
        public_id: result.public_id,
        secure_url: result.secure_url,
        url: result.url,
        width: result.width,
        height: result.height,
        format: result.format,
        bytes: result.bytes
      };
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw new Error('Failed to upload image to Cloudinary');
    }
  },

  // Upload image from buffer
  async uploadBuffer(buffer: Buffer, folder: string = 'products'): Promise<CloudinaryUploadResult> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `georgy-marketplace/${folder}`,
          resource_type: 'image',
          transformation: [
            { width: 1200, height: 1200, crop: 'limit' },
            { quality: 'auto:good' },
            { fetch_format: 'auto' }
          ]
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            reject(new Error('Failed to upload image to Cloudinary'));
          } else if (result) {
            resolve({
              public_id: result.public_id,
              secure_url: result.secure_url,
              url: result.url,
              width: result.width,
              height: result.height,
              format: result.format,
              bytes: result.bytes
            });
          }
        }
      );
      
      uploadStream.end(buffer);
    });
  },

  // Delete image by public_id
  async deleteImage(publicId: string): Promise<boolean> {
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      return result.result === 'ok';
    } catch (error) {
      console.error('Cloudinary delete error:', error);
      return false;
    }
  },

  // Delete multiple images
  async deleteImages(publicIds: string[]): Promise<void> {
    try {
      await cloudinary.api.delete_resources(publicIds);
    } catch (error) {
      console.error('Cloudinary bulk delete error:', error);
    }
  },

  // Get optimized URL with transformations
  getOptimizedUrl(publicId: string, options: { width?: number; height?: number; crop?: string } = {}): string {
    return cloudinary.url(publicId, {
      secure: true,
      transformation: [
        { width: options.width || 800, height: options.height || 800, crop: options.crop || 'fill' },
        { quality: 'auto:good' },
        { fetch_format: 'auto' }
      ]
    });
  },

  // Get thumbnail URL
  getThumbnailUrl(publicId: string, size: number = 200): string {
    return cloudinary.url(publicId, {
      secure: true,
      transformation: [
        { width: size, height: size, crop: 'thumb', gravity: 'center' },
        { quality: 'auto:good' },
        { fetch_format: 'auto' }
      ]
    });
  }
};

export default cloudinaryService;
