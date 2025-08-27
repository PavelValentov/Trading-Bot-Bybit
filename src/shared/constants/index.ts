// API Routes
export const API_ROUTES = {
  AUTH: {
    LOGIN: 'auth/login',
    REGISTER: 'auth/register',
    REFRESH: 'auth/refresh',
    PROFILE: 'auth/profile',
  },
  TRADING: {
    ORDERS: 'trading/orders',
    POSITIONS: 'trading/positions',
    HISTORY: 'trading/history',
  },
  PORTFOLIO: {
    CURRENT: 'portfolio/current',
    HISTORY: 'portfolio/history',
    METRICS: 'portfolio/metrics',
  },
  ANALYSIS: {
    TECHNICAL: 'analysis/technical',
    FUNDAMENTAL: 'analysis/fundamental',
    MACRO: 'analysis/macro',
  },
} as const;

// Trading Constants
export const TRADING_CONSTANTS = {
  DEFAULT_SYMBOLS: ['BTCUSDT', 'ETHUSDT', 'SOLUSDT'],
  TIMEFRAMES: {
    '1m': '1m',
    '5m': '5m',
    '15m': '15m',
    '1h': '1h',
    '4h': '4h',
    '1d': '1d',
  },
  ORDER_TYPES: {
    MARKET: 'MARKET',
    LIMIT: 'LIMIT',
    STOP: 'STOP',
    STOP_LIMIT: 'STOP_LIMIT',
  },
  ORDER_SIDES: {
    BUY: 'BUY',
    SELL: 'SELL',
  },
} as const;

// Risk Management Constants
export const RISK_CONSTANTS = {
  MAX_POSITION_SIZE: 0.1, // 10% of portfolio
  MAX_DAILY_LOSS: 0.05, // 5% daily loss limit
  MAX_DRAWDOWN: 0.15, // 15% maximum drawdown
  DEFAULT_STOP_LOSS: 0.02, // 2% stop loss
  DEFAULT_TAKE_PROFIT: 0.04, // 4% take profit
} as const;

// Technical Indicators Constants
export const INDICATOR_CONSTANTS = {
  RSI: {
    PERIOD: 14,
    OVERSOLD: 30,
    OVERBOUGHT: 70,
  },
  MACD: {
    FAST_PERIOD: 12,
    SLOW_PERIOD: 26,
    SIGNAL_PERIOD: 9,
  },
  BOLLINGER_BANDS: {
    PERIOD: 20,
    STD_DEV: 2,
  },
  MOVING_AVERAGES: {
    SHORT: 20,
    MEDIUM: 50,
    LONG: 200,
  },
} as const;

// Market Regimes
export const MARKET_REGIMES = {
  BULL_TREND: 'bull_trend',
  BEAR_TREND: 'bear_trend',
  SIDEWAYS: 'sideways',
  HIGH_VOLATILITY: 'high_volatility',
  LOW_VOLATILITY: 'low_volatility',
} as const;

// Redis Keys
export const REDIS_KEYS = {
  PRICES: 'prices',
  INDICATORS: 'indicators',
  DECISIONS: 'decisions',
  PORTFOLIO: 'portfolio',
  SESSIONS: 'sessions',
} as const;
