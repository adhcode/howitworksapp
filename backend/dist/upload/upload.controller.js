"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "UploadController", {
    enumerable: true,
    get: function() {
        return UploadController;
    }
});
const _common = require("@nestjs/common");
const _swagger = require("@nestjs/swagger");
const _path = /*#__PURE__*/ _interop_require_wildcard(require("path"));
const _cloudinaryservice = require("./cloudinary.service");
function _getRequireWildcardCache(nodeInterop) {
    if (typeof WeakMap !== "function") return null;
    var cacheBabelInterop = new WeakMap();
    var cacheNodeInterop = new WeakMap();
    return (_getRequireWildcardCache = function(nodeInterop) {
        return nodeInterop ? cacheNodeInterop : cacheBabelInterop;
    })(nodeInterop);
}
function _interop_require_wildcard(obj, nodeInterop) {
    if (!nodeInterop && obj && obj.__esModule) {
        return obj;
    }
    if (obj === null || typeof obj !== "object" && typeof obj !== "function") {
        return {
            default: obj
        };
    }
    var cache = _getRequireWildcardCache(nodeInterop);
    if (cache && cache.has(obj)) {
        return cache.get(obj);
    }
    var newObj = {
        __proto__: null
    };
    var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;
    for(var key in obj){
        if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) {
            var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;
            if (desc && (desc.get || desc.set)) {
                Object.defineProperty(newObj, key, desc);
            } else {
                newObj[key] = obj[key];
            }
        }
    }
    newObj.default = obj;
    if (cache) {
        cache.set(obj, newObj);
    }
    return newObj;
}
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
function _ts_param(paramIndex, decorator) {
    return function(target, key) {
        decorator(target, key, paramIndex);
    };
}
let UploadController = class UploadController {
    async uploadFile(req) {
        try {
            // Fastify multipart handling
            const data = await req.file();
            if (!data) {
                throw new _common.BadRequestException('No file uploaded');
            }
            // Check file type
            if (!data.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
                throw new _common.BadRequestException('Only image files are allowed!');
            }
            // Check file size (max 5MB)
            const MAX_SIZE = 5 * 1024 * 1024; // 5MB
            let fileSize = 0;
            // Convert stream to buffer
            const chunks = [];
            for await (const chunk of data.file){
                chunks.push(chunk);
                fileSize += chunk.length;
                if (fileSize > MAX_SIZE) {
                    throw new _common.BadRequestException('File size exceeds 5MB limit');
                }
            }
            const buffer = Buffer.concat(chunks);
            // Generate unique filename
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
            const ext = _path.extname(data.filename);
            const filename = `${uniqueSuffix}${ext}`;
            // Upload to Cloudinary
            const url = await this.cloudinaryService.uploadImage(buffer, filename);
            this.logger.log(`📸 File uploaded to Cloudinary: ${filename}`);
            return {
                url: url,
                filename: filename,
                originalname: data.filename
            };
        } catch (error) {
            this.logger.error('Upload error:', error);
            if (error instanceof _common.BadRequestException) {
                throw error;
            }
            throw new _common.BadRequestException('File upload failed');
        }
    }
    constructor(cloudinaryService){
        this.cloudinaryService = cloudinaryService;
        this.logger = new _common.Logger(UploadController.name);
    }
};
_ts_decorate([
    (0, _common.Post)(),
    (0, _swagger.ApiOperation)({
        summary: 'Upload a file'
    }),
    (0, _swagger.ApiConsumes)('multipart/form-data'),
    (0, _swagger.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary'
                }
            }
        }
    }),
    _ts_param(0, (0, _common.Request)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], UploadController.prototype, "uploadFile", null);
UploadController = _ts_decorate([
    (0, _swagger.ApiTags)('Upload'),
    (0, _common.Controller)('upload'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _cloudinaryservice.CloudinaryService === "undefined" ? Object : _cloudinaryservice.CloudinaryService
    ])
], UploadController);

//# sourceMappingURL=upload.controller.js.map