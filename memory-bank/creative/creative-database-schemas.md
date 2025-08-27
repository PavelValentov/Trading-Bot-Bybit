# CREATIVE PHASE: СХЕМЫ БАЗ ДАННЫХ

## POSTGRESQL СХЕМЫ (Транзакционные данные)

### 1. Authentication & User Management (auth-service)

```sql
-- База данных: auth_db
CREATE DATABASE auth_db;

-- Пользователи системы
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    salt VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    mfa_enabled BOOLEAN DEFAULT false,
    mfa_secret VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE,
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP WITH TIME ZONE
);

-- Роли пользователей
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    permissions JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Связь пользователей с ролями
CREATE TABLE user_roles (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role_id INTEGER REFERENCES roles(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    assigned_by UUID REFERENCES users(id),
    PRIMARY KEY (user_id, role_id)
);

-- Сессии пользователей
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    refresh_token_hash VARCHAR(255),
    ip_address INET,
    user_agent TEXT,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true
);

-- API ключи для внешних интеграций
CREATE TABLE api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    key_hash VARCHAR(255) NOT NULL,
    permissions JSONB NOT NULL DEFAULT '[]',
    rate_limit INTEGER DEFAULT 1000, -- requests per hour
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_used TIMESTAMP WITH TIME ZONE
);

-- Индексы для производительности
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_active ON users(is_active) WHERE is_active = true;
CREATE INDEX idx_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_sessions_token_hash ON user_sessions(token_hash);
CREATE INDEX idx_sessions_expires ON user_sessions(expires_at);
CREATE INDEX idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX idx_api_keys_hash ON api_keys(key_hash);

-- Триггеры для updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 2. Trading Operations (trading-service)

```sql
-- База данных: trading_db
CREATE DATABASE trading_db;

-- Торговые счета пользователей
CREATE TABLE trading_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL, -- reference to auth_db.users
    account_name VARCHAR(100) NOT NULL,
    exchange VARCHAR(50) NOT NULL, -- 'bybit', 'binance', etc.
    account_type VARCHAR(20) NOT NULL, -- 'demo', 'live'
    api_key_encrypted TEXT NOT NULL,
    api_secret_encrypted TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    balance_usd DECIMAL(18,8) DEFAULT 0,
    equity_usd DECIMAL(18,8) DEFAULT 0,
    margin_used DECIMAL(18,8) DEFAULT 0,
    margin_available DECIMAL(18,8) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_sync TIMESTAMP WITH TIME ZONE
);

-- Торговые ордера
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID REFERENCES trading_accounts(id) ON DELETE CASCADE,
    symbol VARCHAR(20) NOT NULL,
    side VARCHAR(4) NOT NULL CHECK (side IN ('BUY', 'SELL')),
    order_type VARCHAR(20) NOT NULL, -- 'MARKET', 'LIMIT', 'STOP', 'STOP_LIMIT'
    quantity DECIMAL(18,8) NOT NULL,
    price DECIMAL(18,8), -- NULL for market orders
    stop_price DECIMAL(18,8), -- for stop orders
    time_in_force VARCHAR(10) DEFAULT 'GTC', -- 'GTC', 'IOC', 'FOK'
    
    -- Order status tracking
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING', 
    -- 'PENDING', 'PARTIALLY_FILLED', 'FILLED', 'CANCELED', 'REJECTED', 'EXPIRED'
    
    filled_quantity DECIMAL(18,8) DEFAULT 0,
    avg_fill_price DECIMAL(18,8),
    
    -- External exchange data
    exchange_order_id VARCHAR(100),
    exchange_status VARCHAR(50),
    
    -- Risk management
    stop_loss DECIMAL(18,8),
    take_profit DECIMAL(18,8),
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    filled_at TIMESTAMP WITH TIME ZONE,
    
    -- Decision tracking
    decision_id UUID, -- reference to decision that created this order
    confidence_score DECIMAL(5,2),
    signal_sources JSONB DEFAULT '[]'
);

-- Исполненные сделки (fills)
CREATE TABLE trades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    account_id UUID REFERENCES trading_accounts(id) ON DELETE CASCADE,
    symbol VARCHAR(20) NOT NULL,
    side VARCHAR(4) NOT NULL,
    quantity DECIMAL(18,8) NOT NULL,
    price DECIMAL(18,8) NOT NULL,
    commission DECIMAL(18,8) DEFAULT 0,
    commission_asset VARCHAR(10),
    
    -- External trade data
    exchange_trade_id VARCHAR(100),
    
    -- P&L calculation
    realized_pnl DECIMAL(18,8),
    
    executed_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Партиционирование таблицы orders по времени
CREATE TABLE orders_2024_q1 PARTITION OF orders
    FOR VALUES FROM ('2024-01-01') TO ('2024-04-01');
CREATE TABLE orders_2024_q2 PARTITION OF orders
    FOR VALUES FROM ('2024-04-01') TO ('2024-07-01');
-- ... дополнительные партиции

-- Индексы для оптимизации запросов
CREATE INDEX idx_orders_account_id ON orders(account_id);
CREATE INDEX idx_orders_symbol ON orders(symbol);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_orders_symbol_status ON orders(symbol, status);

CREATE INDEX idx_trades_order_id ON trades(order_id);
CREATE INDEX idx_trades_account_id ON trades(account_id);
CREATE INDEX idx_trades_symbol ON trades(symbol);
CREATE INDEX idx_trades_executed_at ON trades(executed_at);

-- Триггеры для автоматического обновления
CREATE TRIGGER update_trading_accounts_updated_at BEFORE UPDATE ON trading_accounts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 3. Portfolio Management (portfolio-service)

```sql
-- База данных: portfolio_db
CREATE DATABASE portfolio_db;

-- Портфели пользователей
CREATE TABLE portfolios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID NOT NULL, -- reference to trading_db.trading_accounts
    name VARCHAR(100) NOT NULL,
    description TEXT,
    
    -- Portfolio metrics
    initial_balance DECIMAL(18,8) NOT NULL,
    current_balance DECIMAL(18,8) NOT NULL,
    total_pnl DECIMAL(18,8) DEFAULT 0,
    total_pnl_percentage DECIMAL(8,4) DEFAULT 0,
    
    -- Risk metrics
    max_drawdown DECIMAL(8,4) DEFAULT 0,
    sharpe_ratio DECIMAL(8,4),
    sortino_ratio DECIMAL(8,4),
    
    -- Performance tracking
    total_trades INTEGER DEFAULT 0,
    winning_trades INTEGER DEFAULT 0,
    losing_trades INTEGER DEFAULT 0,
    win_rate DECIMAL(5,2) DEFAULT 0,
    
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Текущие позиции
CREATE TABLE positions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    portfolio_id UUID REFERENCES portfolios(id) ON DELETE CASCADE,
    symbol VARCHAR(20) NOT NULL,
    side VARCHAR(4) NOT NULL CHECK (side IN ('LONG', 'SHORT')),
    
    -- Position details
    quantity DECIMAL(18,8) NOT NULL,
    entry_price DECIMAL(18,8) NOT NULL,
    current_price DECIMAL(18,8) NOT NULL,
    market_value DECIMAL(18,8) NOT NULL,
    
    -- P&L tracking
    unrealized_pnl DECIMAL(18,8) DEFAULT 0,
    unrealized_pnl_percentage DECIMAL(8,4) DEFAULT 0,
    
    -- Risk management
    stop_loss DECIMAL(18,8),
    take_profit DECIMAL(18,8),
    
    -- Metadata
    opened_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Position tracking
    opening_order_id UUID, -- reference to order that opened position
    
    UNIQUE(portfolio_id, symbol) -- One position per symbol per portfolio
);

-- История закрытых позиций
CREATE TABLE closed_positions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    portfolio_id UUID REFERENCES portfolios(id) ON DELETE CASCADE,
    symbol VARCHAR(20) NOT NULL,
    side VARCHAR(4) NOT NULL,
    
    -- Position details
    quantity DECIMAL(18,8) NOT NULL,
    entry_price DECIMAL(18,8) NOT NULL,
    exit_price DECIMAL(18,8) NOT NULL,
    
    -- P&L
    realized_pnl DECIMAL(18,8) NOT NULL,
    realized_pnl_percentage DECIMAL(8,4) NOT NULL,
    
    -- Timing
    opened_at TIMESTAMP WITH TIME ZONE NOT NULL,
    closed_at TIMESTAMP WITH TIME ZONE NOT NULL,
    hold_duration INTERVAL GENERATED ALWAYS AS (closed_at - opened_at) STORED,
    
    -- Order references
    opening_order_id UUID,
    closing_order_id UUID,
    
    -- Performance classification
    is_winner BOOLEAN GENERATED ALWAYS AS (realized_pnl > 0) STORED
);

-- Ежедневные снапшоты портфеля для анализа
CREATE TABLE portfolio_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    portfolio_id UUID REFERENCES portfolios(id) ON DELETE CASCADE,
    snapshot_date DATE NOT NULL,
    
    -- Balance metrics
    total_value DECIMAL(18,8) NOT NULL,
    cash_balance DECIMAL(18,8) NOT NULL,
    positions_value DECIMAL(18,8) NOT NULL,
    
    -- Daily changes
    daily_pnl DECIMAL(18,8) DEFAULT 0,
    daily_pnl_percentage DECIMAL(8,4) DEFAULT 0,
    
    -- Portfolio composition
    positions_count INTEGER DEFAULT 0,
    symbols JSONB DEFAULT '[]',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(portfolio_id, snapshot_date)
);

-- Индексы
CREATE INDEX idx_portfolios_account_id ON portfolios(account_id);
CREATE INDEX idx_positions_portfolio_id ON positions(portfolio_id);
CREATE INDEX idx_positions_symbol ON positions(symbol);
CREATE INDEX idx_closed_positions_portfolio_id ON closed_positions(portfolio_id);
CREATE INDEX idx_closed_positions_symbol ON closed_positions(symbol);
CREATE INDEX idx_closed_positions_closed_at ON closed_positions(closed_at);
CREATE INDEX idx_snapshots_portfolio_id ON portfolio_snapshots(portfolio_id);
CREATE INDEX idx_snapshots_date ON portfolio_snapshots(snapshot_date);

-- Триггеры
CREATE TRIGGER update_portfolios_updated_at BEFORE UPDATE ON portfolios
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
CREATE TRIGGER update_positions_updated_at BEFORE UPDATE ON positions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 4. Risk Management (risk-service)

```sql
-- База данных: risk_db
CREATE DATABASE risk_db;

-- Правила управления рисками
CREATE TABLE risk_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    rule_type VARCHAR(50) NOT NULL, -- 'POSITION_SIZE', 'DRAWDOWN', 'CORRELATION', 'VOLATILITY'
    
    -- Rule parameters
    parameters JSONB NOT NULL,
    -- Example: {"max_position_size": 0.1, "max_correlation": 0.8}
    
    is_active BOOLEAN DEFAULT true,
    priority INTEGER DEFAULT 0, -- Higher number = higher priority
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Лимиты по счетам
CREATE TABLE account_limits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID NOT NULL, -- reference to trading_accounts
    
    -- Position limits
    max_position_size_usd DECIMAL(18,8),
    max_position_percentage DECIMAL(5,2), -- % of portfolio
    max_positions_count INTEGER DEFAULT 10,
    
    -- Daily limits
    max_daily_loss_usd DECIMAL(18,8),
    max_daily_loss_percentage DECIMAL(5,2),
    max_daily_trades INTEGER DEFAULT 100,
    
    -- Drawdown limits
    max_drawdown_percentage DECIMAL(5,2) DEFAULT 10,
    
    -- Leverage limits
    max_leverage DECIMAL(5,2) DEFAULT 1.0,
    
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Нарушения лимитов
CREATE TABLE risk_violations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID NOT NULL,
    rule_id UUID REFERENCES risk_rules(id),
    
    violation_type VARCHAR(50) NOT NULL,
    severity VARCHAR(10) NOT NULL CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    
    -- Violation details
    current_value DECIMAL(18,8),
    limit_value DECIMAL(18,8),
    threshold_exceeded_by DECIMAL(18,8),
    
    description TEXT,
    
    -- Actions taken
    action_taken VARCHAR(100), -- 'BLOCK_TRADING', 'REDUCE_POSITION', 'ALERT_ONLY'
    resolved BOOLEAN DEFAULT false,
    resolved_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Риск-метрики в реальном времени
CREATE TABLE real_time_risk_metrics (
    account_id UUID PRIMARY KEY,
    
    -- Current exposure
    total_exposure_usd DECIMAL(18,8) DEFAULT 0,
    total_exposure_percentage DECIMAL(5,2) DEFAULT 0,
    
    -- Current positions
    positions_count INTEGER DEFAULT 0,
    long_positions_count INTEGER DEFAULT 0,
    short_positions_count INTEGER DEFAULT 0,
    
    -- Daily metrics
    daily_pnl DECIMAL(18,8) DEFAULT 0,
    daily_pnl_percentage DECIMAL(5,2) DEFAULT 0,
    daily_trades_count INTEGER DEFAULT 0,
    
    -- Risk indicators
    current_drawdown DECIMAL(5,2) DEFAULT 0,
    var_95 DECIMAL(18,8), -- Value at Risk 95%
    expected_shortfall DECIMAL(18,8),
    
    -- Correlations
    portfolio_correlation DECIMAL(5,4), -- Average correlation between positions
    market_beta DECIMAL(5,4), -- Beta to overall crypto market
    
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Индексы
CREATE INDEX idx_risk_rules_type ON risk_rules(rule_type);
CREATE INDEX idx_risk_rules_active ON risk_rules(is_active) WHERE is_active = true;
CREATE INDEX idx_account_limits_account_id ON account_limits(account_id);
CREATE INDEX idx_violations_account_id ON risk_violations(account_id);
CREATE INDEX idx_violations_severity ON risk_violations(severity);
CREATE INDEX idx_violations_created_at ON risk_violations(created_at);

-- Триггеры
CREATE TRIGGER update_risk_rules_updated_at BEFORE UPDATE ON risk_rules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
CREATE TRIGGER update_account_limits_updated_at BEFORE UPDATE ON account_limits
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## MONGODB СХЕМЫ (Документоориентированные данные)

### 1. Market Data (market-data-service)

```javascript
// База данных: market_data_db

// Коллекция: market_prices (time series optimized)
// Оптимизирована для высокочастотных price updates
db.createCollection("market_prices", {
   timeseries: {
      timeField: "timestamp",
      metaField: "symbol",
      granularity: "seconds" // MongoDB 5.0+ time series
   }
});

// Схема документа market_prices
{
  "_id": ObjectId,
  "symbol": "BTCUSDT",
  "timestamp": ISODate,
  "price": 45250.50,
  "volume": 1250.75,
  "bid": 45249.00,
  "ask": 45251.00,
  "high": 45300.00,
  "low": 45200.00,
  "change_24h": 2.5,
  "change_percentage_24h": 0.055,
  "source": "bybit",
  "raw_data": {
    // Сырые данные от биржи
  }
}

// Коллекция: ohlcv_data (свечные данные)
db.createCollection("ohlcv_data");

// Схема OHLCV с разными таймфреймами
{
  "_id": ObjectId,
  "symbol": "BTCUSDT",
  "timeframe": "4h", // 1m, 5m, 15m, 1h, 4h, 1d
  "open_time": ISODate,
  "close_time": ISODate,
  "open": 45000.00,
  "high": 45500.00,
  "low": 44800.00,
  "close": 45250.50,
  "volume": 12500.75,
  "quote_volume": 562537562.50,
  "trades_count": 25000,
  "taker_buy_volume": 6250.25,
  "taker_buy_quote_volume": 281268781.25,
  "created_at": ISODate,
  "updated_at": ISODate
}

// Коллекция: order_book_snapshots
{
  "_id": ObjectId,
  "symbol": "BTCUSDT",
  "timestamp": ISODate,
  "bids": [
    [45249.00, 0.5], // [price, quantity]
    [45248.50, 1.2],
    // ... top 20 bids
  ],
  "asks": [
    [45251.00, 0.8],
    [45251.50, 0.3],
    // ... top 20 asks
  ],
  "spread": 2.00,
  "spread_percentage": 0.0044
}

// Индексы для производительности
db.market_prices.createIndex({ "symbol": 1, "timestamp": -1 });
db.market_prices.createIndex({ "timestamp": -1 });
db.market_prices.createIndex({ "symbol": 1 });

db.ohlcv_data.createIndex({ "symbol": 1, "timeframe": 1, "open_time": -1 });
db.ohlcv_data.createIndex({ "symbol": 1, "timeframe": 1 });
db.ohlcv_data.createIndex({ "open_time": -1 });

db.order_book_snapshots.createIndex({ "symbol": 1, "timestamp": -1 });

// Шардинг для масштабирования
sh.enableSharding("market_data_db");
sh.shardCollection("market_data_db.market_prices", { "symbol": 1, "timestamp": 1 });
sh.shardCollection("market_data_db.ohlcv_data", { "symbol": 1, "open_time": 1 });
```

### 2. News & Sentiment (news-service, fundamental-analysis-service)

```javascript
// База данных: news_sentiment_db

// Коллекция: news_articles
{
  "_id": ObjectId,
  "source": "cointelegraph",
  "url": "https://...",
  "title": "Bitcoin reaches new all-time high",
  "content": "Full article content...",
  "author": "John Doe",
  "published_at": ISODate,
  "collected_at": ISODate,
  
  // Sentiment analysis
  "sentiment": {
    "score": 0.75, // -1 to 1
    "label": "positive", // positive, negative, neutral
    "confidence": 0.92,
    "aspects": {
      "bitcoin": 0.8,
      "market": 0.7,
      "price": 0.9
    }
  },
  
  // Impact analysis
  "impact": {
    "predicted_impact": "high", // low, medium, high
    "affected_symbols": ["BTC", "ETH"],
    "market_moving": true,
    "category": "price_prediction",
    "tags": ["bullish", "institutional", "adoption"]
  },
  
  // Text processing
  "processing": {
    "language": "en",
    "entities": [
      {
        "text": "Bitcoin",
        "type": "CRYPTOCURRENCY",
        "confidence": 0.99
      }
    ],
    "keywords": ["bitcoin", "price", "high", "market"],
    "summary": "Auto-generated summary..."
  },
  
  // Social metrics
  "social_metrics": {
    "shares": 150,
    "likes": 320,
    "comments": 45,
    "engagement_score": 7.5
  }
}

// Коллекция: social_sentiment (агрегированные данные)
{
  "_id": ObjectId,
  "symbol": "BTC",
  "platform": "twitter", // twitter, reddit, telegram
  "date": ISODate("2024-01-15"),
  "timeframe": "1h", // 1h, 4h, 1d
  
  "metrics": {
    "mentions_count": 1250,
    "positive_mentions": 750,
    "negative_mentions": 300,
    "neutral_mentions": 200,
    "sentiment_score": 0.36, // (positive - negative) / total
    "engagement_total": 15000,
    "reach_estimated": 500000
  },
  
  "trending_topics": [
    {
      "topic": "bull_market",
      "frequency": 145,
      "sentiment": 0.8
    }
  ],
  
  "influencer_sentiment": {
    "top_influencers": [
      {
        "handle": "@crypto_analyst",
        "followers": 100000,
        "sentiment": 0.7,
        "impact_score": 8.5
      }
    ],
    "weighted_sentiment": 0.65
  }
}

// Коллекция: news_impact_history (для ML обучения)
{
  "_id": ObjectId,
  "news_id": ObjectId, // reference to news_articles
  "symbol": "BTC",
  "predicted_impact": "high",
  "actual_impact": {
    "price_change_1h": 2.5,
    "price_change_4h": 5.2,
    "price_change_24h": 8.1,
    "volume_change_1h": 25.0,
    "volatility_increase": 15.5
  },
  "prediction_accuracy": 0.85,
  "created_at": ISODate
}

// Индексы
db.news_articles.createIndex({ "published_at": -1 });
db.news_articles.createIndex({ "source": 1, "published_at": -1 });
db.news_articles.createIndex({ "impact.affected_symbols": 1, "published_at": -1 });
db.news_articles.createIndex({ "sentiment.score": 1 });

// Full-text search
db.news_articles.createIndex({ 
  "title": "text", 
  "content": "text",
  "processing.keywords": "text"
});

db.social_sentiment.createIndex({ "symbol": 1, "date": -1, "timeframe": 1 });
db.social_sentiment.createIndex({ "platform": 1, "date": -1 });

db.news_impact_history.createIndex({ "symbol": 1, "created_at": -1 });
```

### 3. Technical Analysis (technical-analysis-service)

```javascript
// База данных: technical_analysis_db

// Коллекция: technical_indicators
{
  "_id": ObjectId,
  "symbol": "BTCUSDT",
  "timeframe": "4h",
  "timestamp": ISODate,
  
  // Momentum indicators
  "momentum": {
    "rsi_14": 65.5,
    "rsi_21": 62.3,
    "momentum_10": 1250.5,
    "stochastic_k": 72.5,
    "stochastic_d": 68.2,
    "williams_r": -25.5
  },
  
  // Trend indicators
  "trend": {
    "sma_20": 45100.0,
    "sma_50": 44800.0,
    "sma_200": 43500.0,
    "ema_12": 45150.0,
    "ema_26": 44950.0,
    "macd_line": 125.5,
    "macd_signal": 98.2,
    "macd_histogram": 27.3,
    "adx": 45.5,
    "parabolic_sar": 44750.0
  },
  
  // Volatility indicators
  "volatility": {
    "bb_upper": 46200.0,
    "bb_middle": 45250.0,
    "bb_lower": 44300.0,
    "bb_width": 4.2,
    "atr_14": 850.5,
    "keltner_upper": 46100.0,
    "keltner_lower": 44400.0
  },
  
  // Volume indicators
  "volume": {
    "obv": 125000000,
    "mfi_14": 58.5,
    "vwap": 45180.0,
    "volume_sma_20": 15000.0,
    "volume_ratio": 1.25
  },
  
  // Support/Resistance levels
  "levels": {
    "support_levels": [44000, 43500, 43000],
    "resistance_levels": [46000, 46500, 47000],
    "pivot_point": 45250.0,
    "fibonacci_levels": {
      "0.236": 44680.0,
      "0.382": 44520.0,
      "0.5": 44375.0,
      "0.618": 44230.0,
      "0.786": 44020.0
    }
  },
  
  // Ichimoku Cloud
  "ichimoku": {
    "tenkan_sen": 45100.0,
    "kijun_sen": 44900.0,
    "senkou_span_a": 45000.0,
    "senkou_span_b": 44200.0,
    "chikou_span": 45300.0,
    "cloud_color": "green" // green = bullish, red = bearish
  },
  
  "calculated_at": ISODate
}

// Коллекция: trading_signals
{
  "_id": ObjectId,
  "symbol": "BTCUSDT",
  "timeframe": "4h",
  "timestamp": ISODate,
  
  "signal": {
    "action": "BUY", // BUY, SELL, HOLD
    "confidence": 75.5, // 0-100
    "strength": "MEDIUM", // WEAK, MEDIUM, STRONG
    "type": "TECHNICAL" // TECHNICAL, FUNDAMENTAL, COMBINED
  },
  
  "contributing_factors": [
    {
      "indicator": "RSI",
      "value": 35.5,
      "signal": "OVERSOLD",
      "weight": 0.15,
      "contribution": 12.0
    },
    {
      "indicator": "MACD",
      "signal": "BULLISH_CROSSOVER",
      "weight": 0.20,
      "contribution": 18.5
    }
  ],
  
  "price_targets": {
    "entry": 45250.0,
    "stop_loss": 44500.0,
    "take_profit_1": 46200.0,
    "take_profit_2": 47000.0,
    "risk_reward_ratio": 2.5
  },
  
  "market_conditions": {
    "trend": "UPTREND",
    "volatility": "MEDIUM",
    "volume": "ABOVE_AVERAGE",
    "market_phase": "ACCUMULATION"
  },
  
  "generated_at": ISODate,
  "expires_at": ISODate // Сигнал действителен до
}

// Коллекция: pattern_detection
{
  "_id": ObjectId,
  "symbol": "BTCUSDT",
  "timeframe": "4h",
  "pattern": {
    "name": "ASCENDING_TRIANGLE",
    "type": "CONTINUATION", // REVERSAL, CONTINUATION
    "reliability": 0.75,
    "target_price": 47500.0,
    "breakout_level": 46000.0
  },
  "detection_points": [
    {
      "timestamp": ISODate,
      "price": 45100.0,
      "role": "HIGHER_LOW"
    }
  ],
  "status": "FORMING", // FORMING, CONFIRMED, INVALIDATED
  "detected_at": ISODate,
  "confirmed_at": ISODate
}

// Индексы
db.technical_indicators.createIndex({ "symbol": 1, "timeframe": 1, "timestamp": -1 });
db.technical_indicators.createIndex({ "timestamp": -1 });

db.trading_signals.createIndex({ "symbol": 1, "timestamp": -1 });
db.trading_signals.createIndex({ "signal.action": 1, "signal.confidence": -1 });
db.trading_signals.createIndex({ "expires_at": 1 });

db.pattern_detection.createIndex({ "symbol": 1, "pattern.name": 1, "status": 1 });
```

### 4. Machine Learning Models (ml-analysis-service)

```javascript
// База данных: ml_models_db

// Коллекция: ml_models
{
  "_id": ObjectId,
  "name": "price_prediction_lstm_v2",
  "type": "LSTM", // LSTM, XGBoost, RandomForest, Transformer
  "purpose": "PRICE_PREDICTION", // PRICE_PREDICTION, SIGNAL_CLASSIFICATION, SENTIMENT_ANALYSIS
  
  "model_config": {
    "architecture": {
      "layers": [
        {"type": "LSTM", "units": 50, "return_sequences": true},
        {"type": "LSTM", "units": 50},
        {"type": "Dense", "units": 25},
        {"type": "Dense", "units": 1}
    ],
    "optimizer": "adam",
    "loss": "mse",
    "metrics": ["mae"]
  },
  
  "training_config": {
    "epochs": 100,
    "batch_size": 32,
    "validation_split": 0.2,
    "early_stopping": true,
    "sequence_length": 60
  },
  
  "features": [
    "price", "volume", "rsi", "macd", "bb_position",
    "sentiment_score", "news_impact", "btc_dominance"
  ],
  
  "performance_metrics": {
    "training": {
      "mse": 0.0025,
      "mae": 0.0384,
      "r2_score": 0.92
    },
    "validation": {
      "mse": 0.0031,
      "mae": 0.0441,
      "r2_score": 0.89
    },
    "test": {
      "mse": 0.0035,
      "mae": 0.0467,
      "r2_score": 0.87,
      "directional_accuracy": 0.74
    }
  },
  
  "model_binary": BinData, // Сериализованная модель
  "scaler_binary": BinData, // Scaler для нормализации
  
  "status": "ACTIVE", // TRAINING, ACTIVE, DEPRECATED
  "version": "2.1.0",
  "created_at": ISODate,
  "trained_at": ISODate,
  "last_used": ISODate
}

// Коллекция: ml_predictions
{
  "_id": ObjectId,
  "model_id": ObjectId, // reference to ml_models
  "symbol": "BTCUSDT",
  "timeframe": "4h",
  "prediction_type": "PRICE", // PRICE, DIRECTION, PROBABILITY
  
  "input_features": {
    "current_price": 45250.0,
    "rsi": 65.5,
    "macd": 27.3,
    "sentiment_score": 0.75,
    // ... other features
  },
  
  "prediction": {
    "value": 46500.0, // Predicted price
    "confidence": 0.78,
    "probability_up": 0.72,
    "probability_down": 0.28,
    "time_horizon": "4h"
  },
  
  "prediction_range": {
    "lower_bound": 45800.0,
    "upper_bound": 47200.0,
    "confidence_interval": 0.95
  },
  
  "predicted_at": ISODate,
  "target_time": ISODate, // Время, на которое делается прогноз
  
  // Для последующей оценки точности
  "actual_value": null, // Заполняется позже
  "accuracy_score": null
}

// Коллекция: model_performance_tracking
{
  "_id": ObjectId,
  "model_id": ObjectId,
  "date": ISODate("2024-01-15"),
  
  "daily_metrics": {
    "predictions_count": 24,
    "avg_accuracy": 0.76,
    "mse": 0.0042,
    "directional_accuracy": 0.71,
    "profit_if_followed": 2.5 // % if all predictions were followed
  },
  
  "performance_by_symbol": {
    "BTCUSDT": {"accuracy": 0.78, "predictions": 6},
    "ETHUSDT": {"accuracy": 0.74, "predictions": 6}
  },
  
  "performance_by_timeframe": {
    "1h": {"accuracy": 0.68, "predictions": 12},
    "4h": {"accuracy": 0.82, "predictions": 6}
  }
}

// Индексы
db.ml_models.createIndex({ "name": 1, "version": 1 });
db.ml_models.createIndex({ "status": 1, "purpose": 1 });

db.ml_predictions.createIndex({ "model_id": 1, "predicted_at": -1 });
db.ml_predictions.createIndex({ "symbol": 1, "predicted_at": -1 });
db.ml_predictions.createIndex({ "target_time": 1 });

db.model_performance_tracking.createIndex({ "model_id": 1, "date": -1 });
```

## REDIS СТРУКТУРЫ (Кэширование и временные данные)

### 1. Real-time Price Cache

```redis
# Текущие цены (Hash)
HSET prices:BTCUSDT price 45250.50 volume 1250.75 timestamp 1705123456
HSET prices:ETHUSDT price 2580.25 volume 850.25 timestamp 1705123456

# Время жизни: 30 секунд
EXPIRE prices:BTCUSDT 30

# Price alerts (Sorted Set by price)
ZADD price_alerts:BTCUSDT:above 46000 "user:123:alert:456"
ZADD price_alerts:BTCUSDT:below 44000 "user:789:alert:012"

# Быстрый доступ к последним N свечам (List)
LPUSH candles:BTCUSDT:4h '{"open":45000,"high":45500,"low":44800,"close":45250,"volume":1250,"timestamp":1705123456}'
LTRIM candles:BTCUSDT:4h 0 100  # Храним последние 100 свечей

# Индикаторы кэш (Hash с TTL)
HSET indicators:BTCUSDT:4h rsi_14 65.5 macd_line 27.3 bb_upper 46200 timestamp 1705123456
EXPIRE indicators:BTCUSDT:4h 300  # 5 минут TTL
```

### 2. Session Management

```redis
# Пользовательские сессии (Hash)
HSET session:jwt_token_hash user_id "123e4567-e89b-12d3-a456-426614174000" \
                            expires_at 1705209856 \
                            ip_address "192.168.1.100" \
                            last_activity 1705123456

EXPIRE session:jwt_token_hash 86400  # 24 часа

# Rate limiting (для API)
INCR rate_limit:user:123:hour:1705123200
EXPIRE rate_limit:user:123:hour:1705123200 3600

# Active users count
SADD active_users:today user:123
EXPIRE active_users:today 86400
```

### 3. Decision Cache

```redis
# Кэш торговых решений (Hash)
HSET decision_cache:BTCUSDT action "BUY" \
                             confidence 75.5 \
                             timestamp 1705123456 \
                             expires_at 1705127056

EXPIRE decision_cache:BTCUSDT 3600  # 1 час

# Очередь принятых решений (List)
LPUSH decisions_queue '{"symbol":"BTCUSDT","action":"BUY","confidence":75.5,"timestamp":1705123456}'
LTRIM decisions_queue 0 1000  # Последние 1000 решений
```

### 4. Event Bus (Pub/Sub)

```redis
# Каналы для событий
PUBLISH market.price.updated '{"symbol":"BTCUSDT","price":45250.50,"timestamp":1705123456}'
PUBLISH news.received '{"source":"cointelegraph","title":"Bitcoin reaches new high","sentiment":0.8}'
PUBLISH decision.made '{"symbol":"BTCUSDT","action":"BUY","confidence":75.5}'
PUBLISH order.filled '{"order_id":"order_123","symbol":"BTCUSDT","quantity":0.1,"price":45250}'

# Паттерны подписки
PSUBSCRIBE market.*
PSUBSCRIBE news.*
PSUBSCRIBE decision.*
PSUBSCRIBE order.*
```

### 5. Lock Management

```redis
# Distributed locks для критических операций
SET lock:portfolio:update:user:123 "locked" EX 30 NX
# NX = only if not exists, EX = expire in seconds

# Если лок успешно установлен, выполняем операцию
# После завершения удаляем лок
DEL lock:portfolio:update:user:123

# Sequence numbers для ordering
INCR seq:orders
INCR seq:trades
```

### 6. Performance Metrics Cache

```redis
# Метрики производительности (Hash)
HSET metrics:trading:daily:2024-01-15 total_trades 150 \
                                        winning_trades 95 \
                                        total_pnl 1250.50 \
                                        win_rate 63.33

# Топ сигналов по производительности (Sorted Set)
ZADD top_signals:accuracy 0.85 "RSI_oversold"
ZADD top_signals:accuracy 0.78 "MACD_bullish_crossover"
ZADD top_signals:accuracy 0.72 "BB_bounce"

# Метрики системы (Hash с TTL)
HSET system_metrics cpu_usage 45.5 \
                     memory_usage 78.2 \
                     active_connections 125 \
                     timestamp 1705123456
EXPIRE system_metrics 60  # Обновляется каждую минуту
```

## ИНДЕКСИРОВАНИЕ И ОПТИМИЗАЦИЯ

### PostgreSQL Optimization

```sql
-- Партиционирование больших таблиц
CREATE TABLE orders_2024 PARTITION OF orders
    FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');

-- Частичные индексы для активных данных
CREATE INDEX idx_orders_active ON orders(symbol, status) 
    WHERE status IN ('PENDING', 'PARTIALLY_FILLED');

-- Покрывающие индексы для частых запросов
CREATE INDEX idx_trades_portfolio_pnl ON trades(account_id, symbol) 
    INCLUDE (realized_pnl, executed_at);

-- Статистика для оптимизатора
ANALYZE orders;
ANALYZE trades;
ANALYZE positions;
```

### MongoDB Optimization

```javascript
// Compound indexes для часто используемых запросов
db.market_prices.createIndex({ 
    "symbol": 1, 
    "timestamp": -1 
}, { 
    background: true 
});

// Sparse indexes для опциональных полей
db.news_articles.createIndex(
    { "impact.affected_symbols": 1 }, 
    { sparse: true }
);

// TTL indexes для автоматического удаления старых данных
db.market_prices.createIndex(
    { "timestamp": 1 }, 
    { expireAfterSeconds: 7776000 } // 90 дней
);

// Hints для принудительного использования индексов
db.market_prices.find({
    "symbol": "BTCUSDT",
    "timestamp": { $gte: ISODate("2024-01-01") }
}).hint({ "symbol": 1, "timestamp": -1 });
```

### Redis Optimization

```redis
# Конфигурация для производительности
CONFIG SET maxmemory 8gb
CONFIG SET maxmemory-policy allkeys-lru
CONFIG SET save "900 1 300 10 60 10000"  # Снапшоты

# Пipelining для batch операций
MULTI
HSET prices:BTCUSDT price 45250.50
HSET prices:ETHUSDT price 2580.25
HSET prices:SOLUSDT price 95.75
EXEC

# Использование connection pooling
# Минимум 10, максимум 100 соединений
```

