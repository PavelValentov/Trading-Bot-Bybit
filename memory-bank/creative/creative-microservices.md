# CREATIVE PHASE: МИКРОСЕРВИСНАЯ АРХИТЕКТУРА

## ДЕТАЛЬНАЯ КАРТА СЕРВИСОВ

### CORE DOMAIN SERVICES (Критические бизнес-сервисы)

#### 1. Decision Engine Service
```yaml
service_name: decision-engine-service
port: 3001
protocol: HTTP + gRPC
database: PostgreSQL + Redis Cache
responsibility: |
  Принятие торговых решений на основе всех входящих сигналов
  
key_apis:
  - POST /decisions/analyze
  - GET /decisions/current/{symbol}
  - WebSocket /decisions/stream
  
events_consumed:
  - technical.signal.generated
  - fundamental.signal.generated
  - macro.signal.generated
  - sentiment.signal.generated
  
events_produced:
  - decision.made
  - decision.updated
  - decision.cancelled

dependencies:
  - weight-system-service (gRPC)
  - risk-service (gRPC)
  
performance_requirements:
  - latency: < 50ms
  - throughput: 1000 decisions/sec
  - availability: 99.9%
```

#### 2. Trading Service
```yaml
service_name: trading-service
port: 3002
protocol: HTTP + WebSocket
database: PostgreSQL
responsibility: |
  Исполнение торговых операций, управление ордерами
  
key_apis:
  - POST /orders/create
  - GET /orders/{orderId}/status
  - POST /orders/{orderId}/cancel
  - WebSocket /orders/stream
  
events_consumed:
  - decision.made
  - risk.limit.exceeded
  
events_produced:
  - order.created
  - order.filled
  - order.cancelled
  - order.failed

external_apis:
  - bybit_api: "торговые операции"
  
dependencies:
  - portfolio-service (HTTP)
  - auth-service (gRPC)
  
performance_requirements:
  - latency: < 20ms для создания ордера
  - throughput: 500 orders/sec
  - availability: 99.95%
```

#### 3. Risk Management Service
```yaml
service_name: risk-service
port: 3003
protocol: gRPC
database: PostgreSQL + Redis
responsibility: |
  Управление рисками, проверка лимитов, risk controls
  
key_apis:
  - CheckPositionRisk(position) -> RiskAssessment
  - ValidateOrder(order) -> ValidationResult
  - GetRiskMetrics() -> RiskMetrics
  
events_consumed:
  - order.created
  - portfolio.updated
  - market.volatility.changed
  
events_produced:
  - risk.limit.exceeded
  - risk.warning.issued
  - risk.metrics.updated

dependencies:
  - portfolio-service (gRPC)
  - market-data-service (HTTP)
  
performance_requirements:
  - latency: < 10ms для проверки риска
  - throughput: 2000 checks/sec
  - availability: 99.99%
```

#### 4. Portfolio Service
```yaml
service_name: portfolio-service
port: 3004
protocol: HTTP + gRPC
database: PostgreSQL
responsibility: |
  Управление портфелем, подсчет позиций, P&L
  
key_apis:
  - GET /portfolio/current
  - GET /portfolio/positions
  - GET /portfolio/pnl
  - POST /portfolio/update
  
events_consumed:
  - order.filled
  - market.price.updated
  
events_produced:
  - portfolio.updated
  - position.opened
  - position.closed
  - pnl.calculated

dependencies:
  - market-data-service (HTTP)
  
performance_requirements:
  - latency: < 30ms
  - throughput: 1000 updates/sec
  - consistency: Strong consistency for positions
```

### DATA COLLECTION SERVICES (Сбор данных)

#### 5. Market Data Service
```yaml
service_name: market-data-service
port: 3005
protocol: HTTP + WebSocket
database: MongoDB (time series)
responsibility: |
  Сбор и нормализация рыночных данных с бирж
  
key_apis:
  - GET /market/{symbol}/price
  - GET /market/{symbol}/ohlcv
  - WebSocket /market/stream
  
events_produced:
  - market.price.updated
  - market.volume.spike
  - market.volatility.changed

external_apis:
  - bybit_ws: "реал-тайм данные"
  - bybit_rest: "исторические данные"
  
performance_requirements:
  - latency: < 5ms для кэшированных данных
  - throughput: 10000 price updates/sec
  - data_retention: 2 года исторических данных
```

#### 6. News Collection Service
```yaml
service_name: news-collection-service
port: 3006
protocol: HTTP
database: MongoDB
responsibility: |
  Сбор новостей из множественных источников
  
key_apis:
  - GET /news/latest
  - GET /news/by-symbol/{symbol}
  - POST /news/analyze
  
events_produced:
  - news.received
  - news.analyzed
  - news.sentiment.calculated

external_apis:
  - cointelegraph_api
  - twitter_api
  - reddit_api
  - telegram_api
  
data_flow:
  1. Poll external APIs every 30 seconds
  2. Normalize news format
  3. Store in MongoDB
  4. Emit news.received event
  5. Trigger sentiment analysis
```

#### 7. Macro Data Service
```yaml
service_name: macro-data-service
port: 3007
protocol: HTTP
database: MongoDB
responsibility: |
  Сбор макроэкономических данных и индикаторов
  
key_apis:
  - GET /macro/indicators/current
  - GET /macro/fed-rate
  - GET /macro/cpi
  
events_produced:
  - macro.indicator.updated
  - macro.data.received
  - economic.event.scheduled

external_apis:
  - fred_api: "Fed данные"
  - yahoo_finance_api: "DXY, VIX, S&P500"
  - economic_calendar_api
  
update_frequency:
  - real_time: "VIX, DXY, major indices"
  - daily: "overnight rates, economic indicators"
  - scheduled: "CPI, NFP, Fed meetings"
```

### ANALYSIS SERVICES (Анализ данных)

#### 8. Technical Analysis Service
```yaml
service_name: technical-analysis-service
port: 3008
protocol: HTTP
database: Redis (indicators cache) + MongoDB (history)
responsibility: |
  Расчет технических индикаторов и генерация сигналов
  
key_apis:
  - POST /analysis/calculate
  - GET /indicators/{symbol}/current
  - GET /indicators/{symbol}/history
  
events_consumed:
  - market.price.updated
  - market.volume.spike
  
events_produced:
  - technical.signal.generated
  - indicator.calculated
  - pattern.detected

indicators_supported:
  - RSI, MACD, Bollinger Bands
  - Moving Averages (SMA, EMA)
  - Momentum, Stochastic
  - ADX, CCI, MFI
  - OBV, VWAP, ATR
  - Support/Resistance, Fibonacci
  - Ichimoku Cloud
  
calculation_engine:
  - library: "TA-Lib + custom implementations"
  - caching: "Redis для последних 1000 свечей"
  - batch_processing: "пересчет всех индикаторов"
```

#### 9. Fundamental Analysis Service
```yaml
service_name: fundamental-analysis-service
port: 3009
protocol: HTTP
database: MongoDB
responsibility: |
  Анализ новостей и фундаментальных факторов
  
key_apis:
  - POST /analysis/news
  - GET /analysis/sentiment/{symbol}
  - POST /analysis/batch
  
events_consumed:
  - news.received
  - social.sentiment.updated
  
events_produced:
  - fundamental.signal.generated
  - sentiment.calculated
  - news.impact.assessed

analysis_components:
  - nlp_engine: "обработка текстов новостей"
  - sentiment_analyzer: "определение тональности"
  - impact_classifier: "оценка влияния на цену"
  - correlation_engine: "связь новостей с движениями"
  
ml_models:
  - sentiment_model: "BERT-based для финансовых новостей"
  - impact_model: "XGBoost для предсказания влияния"
  - classification_model: "категоризация новостей"
```

#### 10. ML Analysis Service
```yaml
service_name: ml-analysis-service
port: 3010
protocol: HTTP + gRPC
database: MongoDB (models) + Redis (predictions cache)
responsibility: |
  Машинное обучение и предсказательная аналитика
  
key_apis:
  - POST /ml/predict
  - GET /ml/models/current
  - POST /ml/retrain
  
events_consumed:
  - technical.signal.generated
  - fundamental.signal.generated
  - market.pattern.detected
  
events_produced:
  - ml.prediction.generated
  - model.retrained
  - pattern.learned

ml_models:
  - price_prediction: "LSTM для предсказания цены"
  - signal_classification: "Random Forest для классификации сигналов"
  - ensemble_model: "Комбинация моделей"
  
training_pipeline:
  - feature_engineering: "создание фичей из raw данных"
  - model_selection: "автоматический выбор лучшей модели"
  - backtesting: "валидация на исторических данных"
  - deployment: "обновление production модели"
```

#### 11. Weight System Service
```yaml
service_name: weight-system-service
port: 3011
protocol: gRPC
database: PostgreSQL + Redis
responsibility: |
  Управление весами сигналов и их адаптация
  
key_apis:
  - GetCurrentWeights() -> WeightConfig
  - UpdateWeights(performance) -> WeightConfig
  - GetRegimeWeights(regime) -> WeightConfig
  
events_consumed:
  - signal.performance.updated
  - market.regime.changed
  - trading.result.updated
  
events_produced:
  - weights.updated
  - regime.detected
  - weight.anomaly.detected

weight_management:
  - static_weights: "базовые экспертные веса"
  - adaptive_weights: "адаптация по производительности"
  - regime_weights: "веса для рыночных режимов"
  - constraint_engine: "применение ограничений"
```

### INFRASTRUCTURE SERVICES (Инфраструктурные сервисы)

#### 12. API Gateway
```yaml
service_name: api-gateway
port: 3000
protocol: HTTP + WebSocket
responsibility: |
  Единая точка входа, маршрутизация, авторизация, rate limiting
  
features:
  - request_routing: "маршрутизация к микросервисам"
  - authentication: "JWT токены"
  - rate_limiting: "защита от DDoS"
  - request_logging: "аудит всех запросов"
  - response_caching: "кэширование ответов"
  
routes:
  - /api/v1/trading/* -> trading-service
  - /api/v1/portfolio/* -> portfolio-service
  - /api/v1/analysis/* -> analysis-services
  - /api/v1/market/* -> market-data-service
  
middleware:
  - auth_middleware: "проверка токенов"
  - cors_middleware: "CORS заголовки"
  - compression_middleware: "сжатие ответов"
  - metrics_middleware: "сбор метрик"
```

#### 13. Auth Service
```yaml
service_name: auth-service
port: 3012
protocol: gRPC + HTTP
database: PostgreSQL
responsibility: |
  Аутентификация, авторизация, управление пользователями
  
key_apis:
  - POST /auth/login
  - POST /auth/refresh
  - ValidateToken(token) -> UserInfo (gRPC)
  
features:
  - jwt_tokens: "access + refresh токены"
  - role_based_access: "permissions по ролям"
  - mfa_support: "двухфакторная аутентификация"
  - session_management: "управление сессиями"
  
security:
  - bcrypt: "хэширование паролей"
  - jwt_rsa: "RSA подписи токенов"
  - rate_limiting: "защита от brute force"
```

#### 14. Config Service
```yaml
service_name: config-service
port: 3013
protocol: HTTP
database: PostgreSQL
responsibility: |
  Централизованное управление конфигурациями
  
key_apis:
  - GET /config/{service}/{key}
  - POST /config/{service}/{key}
  - GET /config/reload
  
features:
  - environment_configs: "конфиги по окружениям"
  - hot_reload: "обновление без перезапуска"
  - config_validation: "валидация значений"
  - audit_trail: "история изменений"
  
config_types:
  - trading_parameters: "размеры позиций, стопы"
  - analysis_settings: "периоды индикаторов"
  - integration_settings: "API ключи, URLs"
  - performance_tuning: "таймауты, лимиты"
```

#### 15. Metrics & Monitoring Service
```yaml
service_name: metrics-service
port: 3014
protocol: HTTP
database: InfluxDB (time series)
responsibility: |
  Сбор метрик, мониторинг здоровья системы
  
key_apis:
  - POST /metrics/push
  - GET /metrics/query
  - GET /health
  
metrics_collected:
  - business_metrics: "количество сделок, P&L, Sharpe ratio"
  - technical_metrics: "latency, throughput, error rate"
  - infrastructure_metrics: "CPU, memory, disk, network"
  
integrations:
  - prometheus: "сбор метрик"
  - grafana: "визуализация"
  - alertmanager: "алерты"
  
alerting:
  - trading_alerts: "неуспешные сделки, лимиты"
  - technical_alerts: "высокая latency, errors"
  - business_alerts: "необычная активность"
```

## ПАТТЕРНЫ КОММУНИКАЦИИ

### 1. Синхронная коммуникация (gRPC)
```protobuf
// Критические операции с низкой латентностью
service RiskService {
  rpc CheckPositionRisk(PositionRequest) returns (RiskAssessment);
  rpc ValidateOrder(OrderRequest) returns (ValidationResult);
}

service WeightSystemService {
  rpc GetCurrentWeights(WeightRequest) returns (WeightResponse);
  rpc UpdateWeights(PerformanceData) returns (WeightResponse);
}
```

### 2. Асинхронная коммуникация (Events)
```typescript
// Redis Pub/Sub для событий
interface EventBus {
  publish(topic: string, event: any): Promise<void>;
  subscribe(topic: string, handler: (event: any) => void): void;
}

// Примеры событий
const events = {
  'market.price.updated': MarketPriceEvent,
  'news.received': NewsEvent,
  'decision.made': TradingDecisionEvent,
  'order.filled': OrderFilledEvent
};
```

### 3. HTTP REST API
```typescript
// Публичные API и CRUD операции
@Controller('/api/v1/portfolio')
export class PortfolioController {
  @Get('/current')
  async getCurrentPortfolio(): Promise<Portfolio> {}
  
  @Get('/positions')
  async getPositions(): Promise<Position[]> {}
  
  @Post('/update')
  async updatePortfolio(@Body() update: PortfolioUpdate): Promise<void> {}
}
```

### 4. WebSocket для реал-тайм
```typescript
// Реал-тайм обновления для UI
@WebSocketGateway(3001, { namespace: 'trading' })
export class TradingGateway {
  @SubscribeMessage('subscribe_portfolio')
  handlePortfolioSubscription(client: Socket): void {
    // Подписка на обновления портфеля
  }
  
  @SubscribeMessage('subscribe_decisions')
  handleDecisionSubscription(client: Socket): void {
    // Подписка на торговые решения
  }
}
```

## СХЕМА РАЗВЕРТЫВАНИЯ

### Docker Compose Structure
```yaml
version: '3.8'
services:
  # Core Services
  api-gateway:
    build: ./services/api-gateway
    ports:
      - "3000:3000"
    depends_on:
      - redis
      - auth-service
    environment:
      - REDIS_URL=redis://redis:6379
      - AUTH_SERVICE_URL=http://auth-service:3012
    
  decision-engine:
    build: ./services/decision-engine
    ports:
      - "3001:3001"
    depends_on:
      - postgres
      - redis
      - weight-system
    environment:
      - DB_URL=postgresql://user:pass@postgres:5432/trading
      - REDIS_URL=redis://redis:6379
      - WEIGHT_SERVICE_URL=weight-system:3011
  
  trading-service:
    build: ./services/trading
    ports:
      - "3002:3002"
    depends_on:
      - postgres
      - portfolio-service
    environment:
      - DB_URL=postgresql://user:pass@postgres:5432/trading
      - BYBIT_API_KEY=${BYBIT_API_KEY}
      - BYBIT_SECRET=${BYBIT_SECRET}
  
  # Data Collection Services
  market-data:
    build: ./services/market-data
    ports:
      - "3005:3005"
    depends_on:
      - mongodb
      - redis
    environment:
      - MONGO_URL=mongodb://mongodb:27017/trading
      - REDIS_URL=redis://redis:6379
  
  # Analysis Services
  technical-analysis:
    build: ./services/technical-analysis
    ports:
      - "3008:3008"
    depends_on:
      - mongodb
      - redis
    environment:
      - MONGO_URL=mongodb://mongodb:27017/trading
      - REDIS_URL=redis://redis:6379
  
  # Infrastructure
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
  
  postgres:
    image: postgres:15-alpine
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_DB=trading
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
  
  mongodb:
    image: mongo:6
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
  
  # Monitoring
  prometheus:
    image: prom/prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
  
  grafana:
    image: grafana/grafana
    ports:
      - "3015:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana_data:/var/lib/grafana

volumes:
  redis_data:
  postgres_data:
  mongodb_data:
  grafana_data:
```

## МОНИТОРИНГ И НАБЛЮДАЕМОСТЬ

### 1. Distributed Tracing
```typescript
// OpenTelemetry для трейсинга запросов
import { trace } from '@opentelemetry/api';

@Injectable()
export class DecisionEngineService {
  async makeDecision(signals: TradingSignals): Promise<TradingDecision> {
    const span = trace.getActiveSpan();
    span?.setAttributes({
      'decision.symbols': signals.symbols,
      'decision.signal_count': signals.length
    });
    
    try {
      // Логика принятия решения
      const decision = await this.processSignals(signals);
      
      span?.setAttributes({
        'decision.action': decision.action,
        'decision.confidence': decision.confidence
      });
      
      return decision;
    } catch (error) {
      span?.recordException(error);
      throw error;
    }
  }
}
```

### 2. Metrics Collection
```typescript
// Prometheus метрики
import { register, Counter, Histogram, Gauge } from 'prom-client';

export class TradingMetrics {
  private static readonly decisionsTotal = new Counter({
    name: 'trading_decisions_total',
    help: 'Total number of trading decisions made',
    labelNames: ['action', 'symbol', 'confidence_range']
  });
  
  private static readonly decisionLatency = new Histogram({
    name: 'trading_decision_duration_seconds',
    help: 'Duration of decision making process',
    buckets: [0.01, 0.05, 0.1, 0.5, 1.0, 2.0]
  });
  
  private static readonly activePositions = new Gauge({
    name: 'trading_active_positions',
    help: 'Number of currently active positions',
    labelNames: ['symbol']
  });
  
  static recordDecision(action: string, symbol: string, confidence: number): void {
    const confidenceRange = confidence > 80 ? 'high' : confidence > 50 ? 'medium' : 'low';
    this.decisionsTotal.inc({ action, symbol, confidence_range: confidenceRange });
  }
}
```

### 3. Health Checks
```typescript
// Health check endpoints для всех сервисов
@Controller('/health')
export class HealthController {
  constructor(
    private readonly dbService: DatabaseService,
    private readonly redisService: RedisService,
    private readonly externalApiService: ExternalApiService
  ) {}
  
  @Get('/')
  async getHealth(): Promise<HealthStatus> {
    const checks = await Promise.allSettled([
      this.checkDatabase(),
      this.checkRedis(),
      this.checkExternalApis()
    ]);
    
    return {
      status: checks.every(check => check.status === 'fulfilled') ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      checks: {
        database: this.getCheckResult(checks[0]),
        redis: this.getCheckResult(checks[1]),
        external_apis: this.getCheckResult(checks[2])
      }
    };
  }
  
  private async checkDatabase(): Promise<boolean> {
    try {
      await this.dbService.query('SELECT 1');
      return true;
    } catch {
      return false;
    }
  }
}
```

## ОБРАБОТКА ОШИБОК И ОТКАЗОУСТОЙЧИВОСТЬ

### 1. Circuit Breaker Pattern
```typescript
// Защита от каскадных сбоев
import CircuitBreaker from 'opossum';

export class ExternalApiService {
  private readonly circuitBreaker: CircuitBreaker<any[], any>;
  
  constructor() {
    this.circuitBreaker = new CircuitBreaker(this.makeApiCall.bind(this), {
      timeout: 3000,
      errorThresholdPercentage: 50,
      resetTimeout: 30000
    });
    
    this.circuitBreaker.fallback(() => {
      return { error: 'Service temporarily unavailable' };
    });
  }
  
  async callExternalApi(params: any): Promise<any> {
    return this.circuitBreaker.fire(params);
  }
}
```

### 2. Retry Logic
```typescript
// Retry с exponential backoff
import { retry } from 'ts-retry-promise';

export class ResilientApiClient {
  async makeResilientCall<T>(apiCall: () => Promise<T>): Promise<T> {
    return retry(
      apiCall,
      {
        retries: 3,
        delay: (attempt) => Math.pow(2, attempt) * 1000, // exponential backoff
        until: (result) => result !== null && result !== undefined
      }
    );
  }
}
```

### 3. Graceful Degradation
```typescript
// Деградация функциональности при сбоях
export class DecisionEngineService {
  async makeDecision(signals: TradingSignals): Promise<TradingDecision> {
    try {
      // Попытка полного анализа
      return await this.fullAnalysis(signals);
    } catch (mlServiceError) {
      // Откат к простым правилам при сбое ML сервиса
      console.warn('ML service unavailable, falling back to rule-based decisions');
      return await this.ruleBasedDecision(signals);
    }
  }
  
  private async ruleBasedDecision(signals: TradingSignals): Promise<TradingDecision> {
    // Упрощенная логика без ML
    const technicalSignal = signals.technical;
    if (technicalSignal.rsi < 30 && technicalSignal.macd === 'bullish') {
      return { action: 'BUY', confidence: 60 };
    }
    return { action: 'HOLD', confidence: 50 };
  }
}
```

