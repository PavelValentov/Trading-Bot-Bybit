/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ([
/* 0 */,
/* 1 */
/***/ ((module) => {

module.exports = require("@nestjs/core");

/***/ }),
/* 2 */
/***/ ((module) => {

module.exports = require("@nestjs/common");

/***/ }),
/* 3 */
/***/ ((module) => {

module.exports = require("@nestjs/swagger");

/***/ }),
/* 4 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AppModule = void 0;
const common_1 = __webpack_require__(2);
const config_1 = __webpack_require__(5);
const core_1 = __webpack_require__(1);
const app_controller_1 = __webpack_require__(6);
const common_module_1 = __webpack_require__(7);
const database_module_1 = __webpack_require__(15);
const jwt_auth_guard_1 = __webpack_require__(13);
const all_exceptions_filter_1 = __webpack_require__(12);
const logging_interceptor_1 = __webpack_require__(8);
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: ['.env.local', '.env'],
            }),
            database_module_1.DatabaseModule,
            common_module_1.CommonModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [
            {
                provide: core_1.APP_GUARD,
                useClass: jwt_auth_guard_1.JwtAuthGuard,
            },
            {
                provide: core_1.APP_FILTER,
                useClass: all_exceptions_filter_1.AllExceptionsFilter,
            },
            {
                provide: core_1.APP_INTERCEPTOR,
                useClass: logging_interceptor_1.LoggingInterceptor,
            },
        ],
    })
], AppModule);


/***/ }),
/* 5 */
/***/ ((module) => {

module.exports = require("@nestjs/config");

/***/ }),
/* 6 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AppController = void 0;
const common_1 = __webpack_require__(2);
const swagger_1 = __webpack_require__(3);
let AppController = class AppController {
    getHealth() {
        return {
            status: 'ok',
            timestamp: new Date().toISOString(),
            service: 'bybit-trading-bot',
            version: '1.0.0',
        };
    }
};
exports.AppController = AppController;
__decorate([
    (0, common_1.Get)('health'),
    (0, swagger_1.ApiOperation)({ summary: 'Health check endpoint' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Service is healthy' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AppController.prototype, "getHealth", null);
exports.AppController = AppController = __decorate([
    (0, swagger_1.ApiTags)('health'),
    (0, common_1.Controller)()
], AppController);


/***/ }),
/* 7 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CommonModule = void 0;
const common_1 = __webpack_require__(2);
const logging_interceptor_1 = __webpack_require__(8);
const all_exceptions_filter_1 = __webpack_require__(12);
const jwt_auth_guard_1 = __webpack_require__(13);
const logger_service_1 = __webpack_require__(10);
let CommonModule = class CommonModule {
};
exports.CommonModule = CommonModule;
exports.CommonModule = CommonModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        providers: [
            logger_service_1.LoggerService,
            logging_interceptor_1.LoggingInterceptor,
            all_exceptions_filter_1.AllExceptionsFilter,
            jwt_auth_guard_1.JwtAuthGuard,
        ],
        exports: [
            logger_service_1.LoggerService,
        ],
    })
], CommonModule);


/***/ }),
/* 8 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.LoggingInterceptor = void 0;
const common_1 = __webpack_require__(2);
const operators_1 = __webpack_require__(9);
const logger_service_1 = __webpack_require__(10);
let LoggingInterceptor = class LoggingInterceptor {
    constructor(logger) {
        this.logger = logger;
    }
    intercept(context, next) {
        const request = context.switchToHttp().getRequest();
        const method = request.method;
        const url = request.url;
        const startTime = Date.now();
        return next.handle().pipe((0, operators_1.tap)(() => {
            const endTime = Date.now();
            const duration = endTime - startTime;
            this.logger.log(`${method} ${url} - ${duration}ms`, 'HTTP');
        }));
    }
};
exports.LoggingInterceptor = LoggingInterceptor;
exports.LoggingInterceptor = LoggingInterceptor = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof logger_service_1.LoggerService !== "undefined" && logger_service_1.LoggerService) === "function" ? _a : Object])
], LoggingInterceptor);


/***/ }),
/* 9 */
/***/ ((module) => {

module.exports = require("rxjs/operators");

/***/ }),
/* 10 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.LoggerService = void 0;
const common_1 = __webpack_require__(2);
const winston = __webpack_require__(11);
let LoggerService = class LoggerService {
    constructor() {
        this.logger = winston.createLogger({
            level: process.env.LOG_LEVEL || 'info',
            format: winston.format.combine(winston.format.timestamp(), winston.format.errors({ stack: true }), winston.format.json()),
            defaultMeta: { service: 'trading-bot' },
            transports: [
                new winston.transports.File({
                    filename: 'logs/error.log',
                    level: 'error'
                }),
                new winston.transports.File({
                    filename: 'logs/combined.log'
                }),
            ],
        });
        if (process.env.NODE_ENV !== 'production') {
            this.logger.add(new winston.transports.Console({
                format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
            }));
        }
    }
    log(message, context) {
        this.logger.info(message, { context });
    }
    error(message, trace, context) {
        this.logger.error(message, { trace, context });
    }
    warn(message, context) {
        this.logger.warn(message, { context });
    }
    debug(message, context) {
        this.logger.debug(message, { context });
    }
    verbose(message, context) {
        this.logger.verbose(message, { context });
    }
};
exports.LoggerService = LoggerService;
exports.LoggerService = LoggerService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], LoggerService);


/***/ }),
/* 11 */
/***/ ((module) => {

module.exports = require("winston");

/***/ }),
/* 12 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AllExceptionsFilter = void 0;
const common_1 = __webpack_require__(2);
const logger_service_1 = __webpack_require__(10);
let AllExceptionsFilter = class AllExceptionsFilter {
    constructor(logger) {
        this.logger = logger;
    }
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        const status = exception instanceof common_1.HttpException
            ? exception.getStatus()
            : common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        const message = exception instanceof common_1.HttpException
            ? exception.getResponse()
            : 'Internal server error';
        const errorResponse = {
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: request.url,
            method: request.method,
            message: typeof message === 'string' ? message : message.message,
        };
        this.logger.error(`HTTP ${status} Error: ${JSON.stringify(errorResponse)}`, exception instanceof Error ? exception.stack : undefined, 'AllExceptionsFilter');
        response.status(status).json(errorResponse);
    }
};
exports.AllExceptionsFilter = AllExceptionsFilter;
exports.AllExceptionsFilter = AllExceptionsFilter = __decorate([
    (0, common_1.Catch)(),
    __metadata("design:paramtypes", [typeof (_a = typeof logger_service_1.LoggerService !== "undefined" && logger_service_1.LoggerService) === "function" ? _a : Object])
], AllExceptionsFilter);


/***/ }),
/* 13 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.JwtAuthGuard = void 0;
const common_1 = __webpack_require__(2);
const core_1 = __webpack_require__(1);
const jwt_1 = __webpack_require__(14);
let JwtAuthGuard = class JwtAuthGuard {
    constructor(jwtService, reflector) {
        this.jwtService = jwtService;
        this.reflector = reflector;
    }
    async canActivate(context) {
        const isPublic = this.reflector.getAllAndOverride('isPublic', [
            context.getHandler(),
            context.getClass(),
        ]);
        if (isPublic) {
            return true;
        }
        const request = context.switchToHttp().getRequest();
        const token = this.extractTokenFromHeader(request);
        if (!token) {
            throw new common_1.UnauthorizedException('Access token is required');
        }
        try {
            const payload = await this.jwtService.verifyAsync(token, {
                secret: process.env.JWT_SECRET,
            });
            request['user'] = payload;
        }
        catch (error) {
            throw new common_1.UnauthorizedException('Invalid access token');
        }
        return true;
    }
    extractTokenFromHeader(request) {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }
};
exports.JwtAuthGuard = JwtAuthGuard;
exports.JwtAuthGuard = JwtAuthGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof jwt_1.JwtService !== "undefined" && jwt_1.JwtService) === "function" ? _a : Object, typeof (_b = typeof core_1.Reflector !== "undefined" && core_1.Reflector) === "function" ? _b : Object])
], JwtAuthGuard);


/***/ }),
/* 14 */
/***/ ((module) => {

module.exports = require("@nestjs/jwt");

/***/ }),
/* 15 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DatabaseModule = void 0;
const common_1 = __webpack_require__(2);
const typeorm_1 = __webpack_require__(16);
const config_1 = __webpack_require__(5);
let DatabaseModule = class DatabaseModule {
};
exports.DatabaseModule = DatabaseModule;
exports.DatabaseModule = DatabaseModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                useFactory: (configService) => ({
                    type: 'postgres',
                    host: configService.get('DATABASE_HOST', 'localhost'),
                    port: configService.get('DATABASE_PORT', 5432),
                    username: configService.get('DATABASE_USERNAME', 'trading_user'),
                    password: configService.get('DATABASE_PASSWORD', 'trading_password'),
                    database: configService.get('DATABASE_NAME', 'trading_db'),
                    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
                    synchronize: configService.get('NODE_ENV') === 'development',
                    logging: configService.get('NODE_ENV') === 'development',
                    retryAttempts: 3,
                    retryDelay: 3000,
                }),
                inject: [config_1.ConfigService],
            }),
        ],
    })
], DatabaseModule);


/***/ }),
/* 16 */
/***/ ((module) => {

module.exports = require("@nestjs/typeorm");

/***/ }),
/* 17 */
/***/ ((module) => {

module.exports = require("helmet");

/***/ }),
/* 18 */
/***/ ((module) => {

module.exports = require("compression");

/***/ })
/******/ 	]);
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
var exports = __webpack_exports__;

Object.defineProperty(exports, "__esModule", ({ value: true }));
const core_1 = __webpack_require__(1);
const common_1 = __webpack_require__(2);
const swagger_1 = __webpack_require__(3);
const app_module_1 = __webpack_require__(4);
const helmet_1 = __webpack_require__(17);
const compression = __webpack_require__(18);
async function bootstrap() {
    const logger = new common_1.Logger('Bootstrap');
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.use((0, helmet_1.default)());
    app.use(compression());
    app.enableCors({
        origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        credentials: true,
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
    }));
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Bybit Trading Bot API')
        .setDescription('Advanced algorithmic trading bot for cryptocurrency markets')
        .setVersion('1.0')
        .addTag('trading', 'Trading operations')
        .addTag('portfolio', 'Portfolio management')
        .addTag('analysis', 'Market analysis')
        .addTag('auth', 'Authentication')
        .addBearerAuth()
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api/docs', app, document);
    app.setGlobalPrefix('api/v1');
    const port = process.env.PORT || 3000;
    await app.listen(port);
    logger.log(`🚀 Application is running on: http://localhost:${port}`);
    logger.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
}
bootstrap().catch((error) => {
    common_1.Logger.error('❌ Error starting application', error);
    process.exit(1);
});

})();

/******/ })()
;