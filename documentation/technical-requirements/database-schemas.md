# 💾 СХЕМЫ БАЗ ДАННЫХ
## Bybit Trading Bot - Детальные схемы данных

**Дата:** 2025-08-27 17:00:00  
**Версия:** 1.0

---

## 🎯 АРХИТЕКТУРА ДАННЫХ

### 📊 **Database-per-Service Pattern:**
- **PostgreSQL** - Транзакционные данные (users, orders, portfolios)
- **MongoDB** - Документы и временные ряды (market data, news, indicators)  
- **Redis** - Кэширование, сессии, real-time данные

---

## 🐘 POSTGRESQL SCHEMAS

### 👤 **Users & Authentication Schema**

```sql
-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role VARCHAR(20) DEFAULT 'trader' CHECK (role IN ('admin', 'trader', 'viewer')),
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    two_factor_enabled BOOLEAN DEFAULT false,
    two_factor_secret VARCHAR(32),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    last_login_at TIMESTAMP
);

-- User sessions
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- API keys for external integrations
CREATE TABLE user_api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    exchange VARCHAR(50) NOT NULL,
    api_key_encrypted TEXT NOT NULL,
    api_secret_encrypted TEXT NOT NULL,
    permissions JSON,
    is_testnet BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    last_used_at TIMESTAMP
);
```

### 💼 **Portfolio & Balances Schema**

```sql
-- User portfolios
CREATE TABLE portfolios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    exchange VARCHAR(50) NOT NULL,
    base_currency VARCHAR(10) DEFAULT 'USDT',
    total_value DECIMAL(18,8) DEFAULT 0,
    available_balance DECIMAL(18,8) DEFAULT 0,
    locked_balance DECIMAL(18,8) DEFAULT 0,
    unrealized_pnl DECIMAL(18,8) DEFAULT 0,
    realized_pnl_today DECIMAL(18,8) DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Asset balances per portfolio
CREATE TABLE portfolio_balances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    portfolio_id UUID REFERENCES portfolios(id) ON DELETE CASCADE,
    asset VARCHAR(20) NOT NULL,
    total_amount DECIMAL(18,8) DEFAULT 0,
    available_amount DECIMAL(18,8) DEFAULT 0,
    locked_amount DECIMAL(18,8) DEFAULT 0,
    average_cost DECIMAL(18,8) DEFAULT 0,
    unrealized_pnl DECIMAL(18,8) DEFAULT 0,
    updated_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(portfolio_id, asset)
);

-- Portfolio performance tracking
CREATE TABLE portfolio_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    portfolio_id UUID REFERENCES portfolios(id) ON DELETE CASCADE,
    total_value DECIMAL(18,8),
    total_pnl DECIMAL(18,8),
    daily_pnl DECIMAL(18,8),
    drawdown_percentage DECIMAL(8,4),
    sharpe_ratio DECIMAL(8,4),
    win_rate DECIMAL(8,4),
    snapshot_date DATE,
    created_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(portfolio_id, snapshot_date)
);
```

### 📊 **Trading & Orders Schema**

```sql
-- Trading orders
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    portfolio_id UUID REFERENCES portfolios(id) ON DELETE CASCADE,
    external_order_id VARCHAR(100),
    symbol VARCHAR(20) NOT NULL,
    side VARCHAR(10) NOT NULL CHECK (side IN ('buy', 'sell')),
    type VARCHAR(20) NOT NULL CHECK (type IN ('market', 'limit', 'stop_loss', 'take_profit')),
    quantity DECIMAL(18,8) NOT NULL,
    price DECIMAL(18,8),
    stop_price DECIMAL(18,8),
    filled_quantity DECIMAL(18,8) DEFAULT 0,
    average_fill_price DECIMAL(18,8),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'open', 'filled', 'cancelled', 'rejected')),
    time_in_force VARCHAR(10) DEFAULT 'GTC',
    reduce_only BOOLEAN DEFAULT false,
    commission DECIMAL(18,8) DEFAULT 0,
    commission_asset VARCHAR(10),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    filled_at TIMESTAMP,
    cancelled_at TIMESTAMP
);

-- Order fills/executions
CREATE TABLE order_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    execution_id VARCHAR(100) NOT NULL,
    quantity DECIMAL(18,8) NOT NULL,
    price DECIMAL(18,8) NOT NULL,
    commission DECIMAL(18,8) DEFAULT 0,
    commission_asset VARCHAR(10),
    executed_at TIMESTAMP DEFAULT NOW()
);

-- Trading positions
CREATE TABLE positions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    portfolio_id UUID REFERENCES portfolios(id) ON DELETE CASCADE,
    symbol VARCHAR(20) NOT NULL,
    side VARCHAR(10) NOT NULL CHECK (side IN ('long', 'short')),
    size DECIMAL(18,8) NOT NULL,
    entry_price DECIMAL(18,8) NOT NULL,
    mark_price DECIMAL(18,8),
    unrealized_pnl DECIMAL(18,8) DEFAULT 0,
    realized_pnl DECIMAL(18,8) DEFAULT 0,
    margin DECIMAL(18,8),
    leverage DECIMAL(4,2) DEFAULT 1.0,
    stop_loss_price DECIMAL(18,8),
    take_profit_price DECIMAL(18,8),
    auto_close_at TIMESTAMP,
    is_open BOOLEAN DEFAULT true,
    opened_at TIMESTAMP DEFAULT NOW(),
    closed_at TIMESTAMP,
    
    UNIQUE(portfolio_id, symbol, is_open) WHERE is_open = true
);
```

### 🛡️ **Risk Management Schema**

```sql
-- Risk rules per portfolio
CREATE TABLE risk_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    portfolio_id UUID REFERENCES portfolios(id) ON DELETE CASCADE,
    rule_name VARCHAR(100) NOT NULL,
    rule_type VARCHAR(50) NOT NULL,
    parameters JSON NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Risk violations log
CREATE TABLE risk_violations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    portfolio_id UUID REFERENCES portfolios(id) ON DELETE CASCADE,
    rule_id UUID REFERENCES risk_rules(id),
    violation_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    description TEXT,
    current_value DECIMAL(18,8),
    threshold_value DECIMAL(18,8),
    action_taken VARCHAR(100),
    resolved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Daily risk metrics
CREATE TABLE daily_risk_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    portfolio_id UUID REFERENCES portfolios(id) ON DELETE CASCADE,
    metric_date DATE NOT NULL,
    value_at_risk DECIMAL(18,8), -- VaR 95%
    max_drawdown DECIMAL(8,4),
    position_concentration DECIMAL(8,4),
    correlation_risk DECIMAL(8,4),
    volatility DECIMAL(8,4),
    sharpe_ratio DECIMAL(8,4),
    created_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(portfolio_id, metric_date)
);
```

---

## 🍃 MONGODB COLLECTIONS

### 📈 **Market Data Collections**

```javascript
// market_data collection - Time series data
{
  _id: ObjectId,
  symbol: "BTCUSDT",
  timeframe: "4h", // 1m, 5m, 15m, 1h, 4h, 1d
  timestamp: ISODate("2025-08-27T16:00:00Z"),
  open: 43250.50,
  high: 43420.80,
  low: 43180.20,
  close: 43380.75,
  volume: 1247.852,
  quote_volume: 54125847.23,
  trades_count: 8245,
  taker_buy_volume: 623.741,
  taker_buy_quote_volume: 27051234.56,
  created_at: ISODate("2025-08-27T16:00:05Z")
}

// Indexes for market_data
db.market_data.createIndex({ "symbol": 1, "timeframe": 1, "timestamp": -1 })
db.market_data.createIndex({ "timestamp": -1 })
db.market_data.createIndex({ "symbol": 1, "timestamp": -1 })

// orderbook collection - Real-time order book data
{
  _id: ObjectId,
  symbol: "BTCUSDT",
  timestamp: ISODate("2025-08-27T16:45:23.127Z"),
  bids: [
    { price: 43380.50, quantity: 2.547 },
    { price: 43380.25, quantity: 1.234 },
    // ... top 20 bids
  ],
  asks: [
    { price: 43380.75, quantity: 1.876 },
    { price: 43381.00, quantity: 3.421 },
    // ... top 20 asks
  ],
  best_bid: 43380.50,
  best_ask: 43380.75,
  spread: 0.25,
  spread_percentage: 0.000576
}

// trades collection - Individual trades
{
  _id: ObjectId,
  symbol: "BTCUSDT", 
  trade_id: "1234567890",
  price: 43380.75,
  quantity: 0.5247,
  side: "buy", // buy or sell
  timestamp: ISODate("2025-08-27T16:45:23.127Z"),
  is_maker: false
}
```

### 📊 **Technical Indicators Collections**

```javascript
// technical_indicators collection
{
  _id: ObjectId,
  symbol: "BTCUSDT",
  timeframe: "4h",
  timestamp: ISODate("2025-08-27T16:00:00Z"),
  indicators: {
    rsi: {
      value: 65.43,
      period: 14,
      signal: "neutral" // oversold, overbought, neutral
    },
    macd: {
      macd_line: 245.67,
      signal_line: 198.34,
      histogram: 47.33,
      signal: "bullish" // bullish, bearish, neutral
    },
    bollinger_bands: {
      upper: 44250.80,
      middle: 43380.75, // SMA 20
      lower: 42510.70,
      bandwidth: 0.04,
      position: "middle" // upper, middle, lower
    },
    moving_averages: {
      sma_20: 43380.75,
      sma_50: 42890.45,
      ema_20: 43420.30,
      ema_50: 43001.25,
      trend: "bullish" // bullish, bearish, neutral
    },
    volume_indicators: {
      obv: 1247852963.45,
      vwap: 43295.67,
      volume_sma_20: 1156.34
    }
  },
  calculated_at: ISODate("2025-08-27T16:00:05Z")
}

// Indexes for technical_indicators
db.technical_indicators.createIndex({ 
  "symbol": 1, 
  "timeframe": 1, 
  "timestamp": -1 
})
```

### 📰 **News & Sentiment Collections**

```javascript
// news_articles collection
{
  _id: ObjectId,
  article_id: "ct_2025_08_27_1234",
  source: "cointelegraph",
  title: "Bitcoin Reaches New All-Time High Amid Institutional Adoption",
  content: "Full article content...",
  summary: "Auto-generated summary...",
  author: "John Crypto",
  published_at: ISODate("2025-08-27T15:30:00Z"),
  tags: ["bitcoin", "institutional", "adoption", "price"],
  url: "https://cointelegraph.com/news/...",
  sentiment: {
    score: 0.75, // -1 to 1 scale
    classification: "bullish", // bullish, bearish, neutral
    confidence: 0.87,
    keywords: ["bullish", "adoption", "institutional", "growth"]
  },
  relevance: {
    symbols: ["BTCUSDT", "ETHUSD"],
    relevance_score: 0.92,
    market_impact: "high" // low, medium, high
  },
  processed_at: ISODate("2025-08-27T15:31:15Z"),
  created_at: ISODate("2025-08-27T15:31:20Z")
}

// social_sentiment collection - Twitter, Reddit aggregation
{
  _id: ObjectId,
  platform: "twitter", // twitter, reddit, telegram
  content_id: "tweet_1234567890",
  content: "Bitcoin to the moon! 🚀 #BTC #crypto",
  author: "@cryptotrader123",
  followers_count: 15247,
  engagement: {
    likes: 245,
    retweets: 67,
    replies: 23
  },
  sentiment: {
    score: 0.85,
    classification: "bullish"
  },
  mentioned_symbols: ["BTC", "bitcoin"],
  published_at: ISODate("2025-08-27T16:20:00Z"),
  processed_at: ISODate("2025-08-27T16:21:30Z")
}

// aggregated_sentiment collection - Hourly aggregates
{
  _id: ObjectId,
  timestamp: ISODate("2025-08-27T16:00:00Z"),
  symbols: ["BTCUSDT"],
  sentiment_sources: {
    news: {
      average_sentiment: 0.73,
      article_count: 15,
      bullish_count: 11,
      bearish_count: 2,
      neutral_count: 2
    },
    social: {
      twitter_sentiment: 0.68,
      reddit_sentiment: 0.71,
      telegram_sentiment: 0.65,
      total_mentions: 2547
    }
  },
  overall_sentiment: {
    score: 0.71,
    classification: "bullish",
    confidence: 0.84
  },
  calculated_at: ISODate("2025-08-27T16:00:15Z")
}
```

### 🤖 **ML Models & Predictions Collections**

```javascript
// ml_models collection
{
  _id: ObjectId,
  model_name: "lstm_price_predictor_v2",
  model_type: "LSTM",
  version: "2.1.0",
  symbol: "BTCUSDT",
  timeframe: "4h",
  features: [
    "open", "high", "low", "close", "volume",
    "rsi", "macd", "bollinger_bands", "sentiment_score"
  ],
  hyperparameters: {
    sequence_length: 60,
    hidden_units: 128,
    dropout_rate: 0.2,
    learning_rate: 0.001
  },
  performance_metrics: {
    accuracy: 0.67,
    precision: 0.65,
    recall: 0.70,
    f1_score: 0.675,
    sharpe_ratio: 1.45,
    backtest_period: "2023-01-01_to_2024-12-31"
  },
  model_file_path: "/models/lstm_v2_btcusdt_4h.h5",
  training_data_period: {
    start_date: ISODate("2022-01-01T00:00:00Z"),
    end_date: ISODate("2024-12-31T23:59:59Z")
  },
  created_at: ISODate("2025-08-27T10:00:00Z"),
  is_active: true
}

// predictions collection
{
  _id: ObjectId,
  model_id: ObjectId("..."),
  symbol: "BTCUSDT",
  timeframe: "4h",
  prediction_timestamp: ISODate("2025-08-27T20:00:00Z"), // Future timestamp
  current_timestamp: ISODate("2025-08-27T16:00:00Z"),
  prediction: {
    direction: "up", // up, down, sideways
    price_target: 44250.80,
    confidence: 0.73,
    probability_up: 0.73,
    probability_down: 0.27
  },
  input_features: {
    current_price: 43380.75,
    rsi: 65.43,
    macd_signal: "bullish",
    sentiment_score: 0.71,
    volume_trend: "increasing"
  },
  created_at: ISODate("2025-08-27T16:00:30Z")
}
```

### 📈 **Economic Data Collections**

```javascript
// economic_indicators collection
{
  _id: ObjectId,
  indicator_name: "federal_funds_rate",
  source: "fred", // fred, alphavantage, etc.
  country: "US",
  frequency: "monthly",
  unit: "percent",
  data_points: [
    {
      date: ISODate("2025-08-01T00:00:00Z"),
      value: 5.25,
      revision: null
    },
    {
      date: ISODate("2025-07-01T00:00:00Z"), 
      value: 5.50,
      revision: null
    }
  ],
  last_updated: ISODate("2025-08-27T12:00:00Z"),
  next_release: ISODate("2025-09-20T18:00:00Z")
}

// macro_correlations collection
{
  _id: ObjectId,
  symbol: "BTCUSDT",
  correlation_period: "30d",
  correlations: {
    sp500: -0.23,
    dxy: -0.67,
    gold: 0.45,
    vix: -0.34,
    us_10y_yield: -0.56
  },
  calculated_at: ISODate("2025-08-27T16:00:00Z")
}
```

---

## 🔴 REDIS DATA STRUCTURES

### ⚡ **Real-time Data Caching**

```redis
# Current prices (TTL: 60 seconds)
SET prices:BTCUSDT:current "43380.75"
EXPIRE prices:BTCUSDT:current 60

# Price history (sorted set by timestamp)
ZADD prices:BTCUSDT:1h 1724779200 43380.75
ZADD prices:BTCUSDT:1h 1724779260 43385.20

# Order book snapshots (TTL: 30 seconds)  
HSET orderbook:BTCUSDT:current best_bid 43380.50
HSET orderbook:BTCUSDT:current best_ask 43380.75
HSET orderbook:BTCUSDT:current spread 0.25
EXPIRE orderbook:BTCUSDT:current 30

# Technical indicators cache (TTL: 300 seconds)
HSET indicators:BTCUSDT:4h rsi 65.43
HSET indicators:BTCUSDT:4h macd_signal bullish
HSET indicators:BTCUSDT:4h sma_20 43380.75
EXPIRE indicators:BTCUSDT:4h 300
```

### 👤 **User Sessions & State**

```redis
# User sessions (TTL: 24 hours)
HSET session:user123 email "user@example.com"
HSET session:user123 role "trader"
HSET session:user123 portfolio_id "uuid-here"
HSET session:user123 last_activity 1724779200
EXPIRE session:user123 86400

# User preferences cache
HSET user:123:preferences trading_pairs "BTCUSDT,ETHUSD"
HSET user:123:preferences risk_level "medium"
HSET user:123:preferences notifications "email,push"

# Active trading sessions
SADD active_traders "user123"
SADD active_traders "user456"
```

### 🔄 **Event Streaming & Pub/Sub**

```redis
# Trading signals pub/sub
PUBLISH trading.signals '{"symbol": "BTCUSDT", "action": "BUY", "confidence": 0.75}'
PUBLISH trading.signals '{"symbol": "ETHUSD", "action": "SELL", "confidence": 0.68}'

# Risk alerts
PUBLISH risk.alerts '{"portfolio_id": "uuid", "type": "position_limit", "severity": "high"}'

# Market events
PUBLISH market.events '{"type": "volatility_spike", "symbol": "BTCUSDT", "volatility": 0.15}'

# News events
PUBLISH news.events '{"type": "bullish_news", "sentiment": 0.85, "symbols": ["BTCUSDT"]}'
```

### 🔐 **Distributed Locks & Rate Limiting**

```redis
# Distributed locks for critical operations
SET lock:portfolio:uuid123 "locked" NX EX 30
SET lock:order:execution:uuid456 "locked" NX EX 10

# Rate limiting per user
INCR rate_limit:user123:api_calls
EXPIRE rate_limit:user123:api_calls 60
# Allow max 100 calls per minute

# Circuit breaker states
HSET circuit_breaker:bybit_api status "closed"
HSET circuit_breaker:bybit_api failure_count 0
HSET circuit_breaker:bybit_api last_failure_time 0
```

### 📊 **Analytics & Metrics Cache**

```redis
# Performance metrics (TTL: 1 hour)
HSET portfolio:uuid123:metrics daily_pnl "1247.85"
HSET portfolio:uuid123:metrics total_pnl "15847.23"
HSET portfolio:uuid123:metrics win_rate "0.67"
HSET portfolio:uuid123:metrics sharpe_ratio "1.45"
EXPIRE portfolio:uuid123:metrics 3600

# System health metrics
HSET system:health api_response_time "45ms"
HSET system:health active_connections "247"
HSET system:health memory_usage "67%"
HSET system:health cpu_usage "23%"
```

---

## 🔧 DATA OPTIMIZATION STRATEGIES

### 📈 **Time Series Optimization**

#### **PostgreSQL Time Series:**
```sql
-- Partitioning for large tables
CREATE TABLE orders_2025_q1 PARTITION OF orders
FOR VALUES FROM ('2025-01-01') TO ('2025-04-01');

CREATE TABLE orders_2025_q2 PARTITION OF orders  
FOR VALUES FROM ('2025-04-01') TO ('2025-07-01');

-- Indexes for time-based queries
CREATE INDEX idx_orders_portfolio_created_at ON orders (portfolio_id, created_at DESC);
CREATE INDEX idx_positions_symbol_opened_at ON positions (symbol, opened_at DESC);
```

#### **MongoDB Time Series Collections:**
```javascript
// Create time series collection
db.createCollection("market_data_ts", {
  timeseries: {
    timeField: "timestamp",
    metaField: "symbol",
    granularity: "hours"
  }
});

// Compound indexes for efficient queries
db.market_data.createIndex({ 
  "symbol": 1, 
  "timeframe": 1, 
  "timestamp": -1 
}, { background: true });

// TTL index for old data cleanup
db.market_data.createIndex(
  { "timestamp": 1 }, 
  { expireAfterSeconds: 7776000 } // 90 days
);
```

### 🗜️ **Data Compression & Archival**

#### **Historical Data Archival:**
```sql
-- Archive old orders to separate table
CREATE TABLE orders_archive (LIKE orders INCLUDING ALL);

-- Move old data (older than 1 year)
INSERT INTO orders_archive 
SELECT * FROM orders 
WHERE created_at < NOW() - INTERVAL '1 year';

DELETE FROM orders 
WHERE created_at < NOW() - INTERVAL '1 year';
```

#### **MongoDB Data Lifecycle:**
```javascript
// Automatic archival using MongoDB Atlas
db.market_data.createIndex(
  { "timestamp": 1 },
  { 
    expireAfterSeconds: 2592000, // 30 days for detailed data
    partialFilterExpression: { "timeframe": { $in: ["1m", "5m"] } }
  }
);

// Keep longer-term data for higher timeframes
db.market_data.createIndex(
  { "timestamp": 1 },
  { 
    expireAfterSeconds: 31536000, // 1 year for 4h, 1d data
    partialFilterExpression: { "timeframe": { $in: ["4h", "1d"] } }
  }
);
```

---

## 📊 DATABASE MONITORING

### 🔍 **Performance Monitoring:**

#### **PostgreSQL Monitoring:**
```sql
-- Query performance monitoring
SELECT 
  query,
  calls,
  total_time,
  mean_time,
  rows
FROM pg_stat_statements
ORDER BY total_time DESC
LIMIT 10;

-- Table size monitoring
SELECT 
  tablename,
  pg_size_pretty(pg_total_relation_size(tablename::text)) as size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(tablename::text) DESC;
```

#### **MongoDB Monitoring:**
```javascript
// Collection statistics
db.market_data.stats();

// Query performance profiling
db.setProfilingLevel(2, { slowms: 100 });
db.system.profile.find().sort({ ts: -1 }).limit(5);

// Index usage statistics
db.market_data.aggregate([
  { $indexStats: {} }
]);
```

### 🚨 **Automated Alerts:**

#### **Database Health Checks:**
```typescript
class DatabaseMonitor {
  async checkPostgreSQLHealth(): Promise<HealthStatus> {
    const [connectionCount] = await this.pg.query(`
      SELECT count(*) as active_connections 
      FROM pg_stat_activity 
      WHERE state = 'active'
    `);
    
    const [dbSize] = await this.pg.query(`
      SELECT pg_size_pretty(pg_database_size(current_database())) as db_size
    `);
    
    return {
      active_connections: connectionCount.active_connections,
      database_size: dbSize.db_size,
      status: connectionCount.active_connections < 80 ? 'healthy' : 'warning'
    };
  }
  
  async checkMongoDBHealth(): Promise<HealthStatus> {
    const serverStatus = await this.mongodb.admin().serverStatus();
    
    return {
      connections: serverStatus.connections,
      memory_usage: serverStatus.mem,
      operations_per_second: serverStatus.opcounters,
      status: serverStatus.connections.current < 1000 ? 'healthy' : 'warning'
    };
  }
}
```

---

**💾 Данная архитектура баз данных обеспечивает efficient storage, quick access и scalability для всех типов данных торговой системы.**
