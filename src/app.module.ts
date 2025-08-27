import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';

// Controllers
import { AppController } from './app.controller';

// Common modules
import { CommonModule } from './common/common.module';
import { DatabaseModule } from './configs/database.module';

// Feature modules (will be added as we implement services)
// import { AuthModule } from './auth/auth.module';
// import { TradingModule } from './trading/trading.module';
// import { PortfolioModule } from './portfolio/portfolio.module';

// Guards and filters
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    
    // Database
    DatabaseModule,
    
    // Common utilities
    CommonModule,
    
    // Feature modules - will be uncommented as we implement them
    // AuthModule,
    // TradingModule,
    // PortfolioModule,
  ],
  controllers: [AppController],
  providers: [
    // Global guards
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    
    // Global filters
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    
    // Global interceptors
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule {}
