"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _core = require("@nestjs/core");
const _platformfastify = require("@nestjs/platform-fastify");
const _swagger = require("@nestjs/swagger");
const _config = require("@nestjs/config");
const _common = require("@nestjs/common");
const _crypto = /*#__PURE__*/ _interop_require_wildcard(require("crypto"));
const _appmodule = require("./app.module");
const _globalexceptionfilter = require("./common/filters/global-exception.filter");
const _responseinterceptor = require("./common/interceptors/response.interceptor");
const _logginginterceptor = require("./common/interceptors/logging.interceptor");
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
// Polyfill crypto for Node.js 18+ compatibility with @nestjs/schedule
if (typeof global.crypto === 'undefined') {
    global.crypto = _crypto;
}
async function bootstrap() {
    const logger = new _common.Logger('Bootstrap');
    // Create Fastify app
    const app = await _core.NestFactory.create(_appmodule.AppModule, new _platformfastify.FastifyAdapter({
        logger: process.env.NODE_ENV === 'development'
    }));
    const configService = app.get(_config.ConfigService);
    const port = configService.get('PORT') || 3000;
    const nodeEnv = configService.get('NODE_ENV') || 'development';
    // Security middleware
    await app.register(require('@fastify/helmet'), {
        contentSecurityPolicy: {
            directives: {
                defaultSrc: [
                    `'self'`
                ],
                styleSrc: [
                    `'self'`,
                    `'unsafe-inline'`
                ],
                scriptSrc: [
                    `'self'`
                ],
                objectSrc: [
                    `'none'`
                ],
                upgradeInsecureRequests: []
            }
        }
    });
    // Compression
    await app.register(require('@fastify/compress'), {
        encodings: [
            'gzip',
            'deflate'
        ]
    });
    // File upload support
    await app.register(require('@fastify/multipart'), {
        limits: {
            fileSize: 5 * 1024 * 1024
        }
    });
    // Static file serving for uploads
    const uploadsPath = require('path').join(__dirname, '..', 'uploads');
    // Create uploads directory if it doesn't exist
    const fs = require('fs');
    if (!fs.existsSync(uploadsPath)) {
        fs.mkdirSync(uploadsPath, {
            recursive: true
        });
    }
    await app.register(require('@fastify/static'), {
        root: uploadsPath,
        prefix: '/uploads/'
    });
    // CORS
    app.enableCors({
        origin: nodeEnv === 'production' ? [
            'capacitor://localhost',
            'ionic://localhost',
            'http://localhost',
            'http://localhost:3000',
            'http://localhost:3001',
            'http://localhost:8081',
            'http://localhost:8100',
            'https://howitworksapp.vercel.app',
            'https://app.howitworks.com.ng'
        ] : true,
        credentials: true,
        methods: [
            'GET',
            'POST',
            'PUT',
            'DELETE',
            'PATCH',
            'OPTIONS'
        ],
        allowedHeaders: [
            'Content-Type',
            'Authorization'
        ]
    });
    // Global validation pipe
    app.useGlobalPipes(new _common.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: false,
        transform: true,
        disableErrorMessages: nodeEnv === 'production'
    }));
    // Global filters
    app.useGlobalFilters(new _globalexceptionfilter.GlobalExceptionFilter());
    // Global interceptors
    app.useGlobalInterceptors(new _logginginterceptor.LoggingInterceptor(), new _responseinterceptor.ResponseInterceptor());
    // Swagger documentation (only in development)
    if (nodeEnv === 'development') {
        const config = new _swagger.DocumentBuilder().setTitle('Homezy API').setDescription('Property management platform API').setVersion('1.0').addBearerAuth({
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            name: 'JWT',
            description: 'Enter JWT token',
            in: 'header'
        }, 'JWT-auth').build();
        const document = _swagger.SwaggerModule.createDocument(app, config);
        _swagger.SwaggerModule.setup('api/docs', app, document, {
            swaggerOptions: {
                persistAuthorization: true
            }
        });
        logger.log(`📚 Swagger documentation available at http://localhost:${port}/api/docs`);
    }
    // Graceful shutdown
    process.on('SIGTERM', async ()=>{
        logger.log('SIGTERM received, shutting down gracefully');
        await app.close();
        process.exit(0);
    });
    process.on('SIGINT', async ()=>{
        logger.log('SIGINT received, shutting down gracefully');
        await app.close();
        process.exit(0);
    });
    await app.listen(port, '0.0.0.0');
    logger.log(`🚀 Application is running on: http://localhost:${port}`);
    logger.log(`🌍 Environment: ${nodeEnv}`);
    logger.log(`📊 Health check: http://localhost:${port}/health`);
}
bootstrap().catch((error)=>{
    console.error('❌ Error starting server:', error);
    process.exit(1);
});

//# sourceMappingURL=main.js.map