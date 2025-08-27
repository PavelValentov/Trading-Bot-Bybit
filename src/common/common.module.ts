import { Module, Global } from '@nestjs/common';
import { LoggingInterceptor } from './interceptors/logging.interceptor';
import { AllExceptionsFilter } from './filters/all-exceptions.filter';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LoggerService } from './services/logger.service';

@Global()
@Module({
  providers: [
    LoggerService,
    LoggingInterceptor,
    AllExceptionsFilter,
    JwtAuthGuard,
  ],
  exports: [
    LoggerService,
  ],
})
export class CommonModule {}
