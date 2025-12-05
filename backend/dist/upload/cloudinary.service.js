"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "CloudinaryService", {
    enumerable: true,
    get: function() {
        return CloudinaryService;
    }
});
const _common = require("@nestjs/common");
const _cloudinary = require("cloudinary");
const _stream = require("stream");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let CloudinaryService = class CloudinaryService {
    /**
   * Upload an image to Cloudinary
   * @param fileBuffer - The file buffer to upload
   * @param filename - The filename (will be used as public_id)
   * @param folder - Optional folder name in Cloudinary (default: 'homezy')
   * @returns The secure URL of the uploaded image
   */ async uploadImage(fileBuffer, filename, folder = 'homezy') {
        return new Promise((resolve, reject)=>{
            const uploadStream = _cloudinary.v2.uploader.upload_stream({
                folder: folder,
                public_id: filename.replace(/\.[^/.]+$/, ''),
                resource_type: 'image',
                transformation: [
                    {
                        quality: 'auto'
                    },
                    {
                        fetch_format: 'auto'
                    }
                ]
            }, (error, result)=>{
                if (error) {
                    this.logger.error('Cloudinary upload error:', error);
                    return reject(error);
                }
                this.logger.log(`Image uploaded: ${result.secure_url}`);
                resolve(result.secure_url);
            });
            // Convert buffer to stream and pipe to Cloudinary
            const readableStream = _stream.Readable.from(fileBuffer);
            readableStream.pipe(uploadStream);
        });
    }
    /**
   * Delete an image from Cloudinary
   * @param publicId - The public ID of the image to delete
   */ async deleteImage(publicId) {
        try {
            await _cloudinary.v2.uploader.destroy(publicId);
            this.logger.log(`Image deleted: ${publicId}`);
        } catch (error) {
            this.logger.error('Cloudinary delete error:', error);
            throw error;
        }
    }
    /**
   * Check if Cloudinary is properly configured
   */ isConfigured() {
        return !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);
    }
    constructor(){
        this.logger = new _common.Logger(CloudinaryService.name);
        // Configure Cloudinary
        _cloudinary.v2.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET
        });
        // Log configuration status (without exposing secrets)
        if (process.env.CLOUDINARY_CLOUD_NAME) {
            this.logger.log(`Cloudinary configured for: ${process.env.CLOUDINARY_CLOUD_NAME}`);
        } else {
            this.logger.warn('Cloudinary not configured - check environment variables');
        }
    }
};
CloudinaryService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [])
], CloudinaryService);

//# sourceMappingURL=cloudinary.service.js.map