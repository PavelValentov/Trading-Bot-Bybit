# 🔌 API ИНТЕГРАЦИИ
## Bybit Trading Bot - Внешние API и интеграции

**Дата:** 2025-08-27 17:00:00  
**Версия:** 1.0

---

## 🎯 ОБЗОР ИНТЕГРАЦИЙ

### 📊 **Категории API:**
- **Торговые API** - исполнение ордеров и получение рыночных данных
- **Новостные API** - агрегация финансовых новостей
- **Макроэкономические API** - данные по процентным ставкам, индексам
- **Социальные API** - sentiment анализ из социальных сетей
- **Blockchain API** - on-chain метрики и данные

---

## 📈 ТОРГОВЫЕ API

### 🏆 **Bybit API (Основной)**

#### **REST API Endpoints:**
```typescript
const BYBIT_ENDPOINTS = {
  // Trading endpoints
  PLACE_ORDER: '/v5/order/create',
  CANCEL_ORDER: '/v5/order/cancel',
  GET_POSITIONS: '/v5/position/list',
  GET_BALANCE: '/v5/account/wallet-balance',
  
  // Market data endpoints  
  GET_ORDERBOOK: '/v5/market/orderbook',
  GET_KLINES: '/v5/market/kline',
  GET_TICKERS: '/v5/market/tickers',
  GET_INSTRUMENTS: '/v5/market/instruments-info'
};
```

#### **WebSocket Streams:**
```typescript
class BybitWebSocket {
  private streams = {
    // Public streams
    orderbook: 'orderbook.1.BTCUSDT',
    trades: 'publicTrade.BTCUSDT', 
    klines: 'kline.4h.BTCUSDT',
    tickers: 'tickers.BTCUSDT',
    
    // Private streams
    positions: 'position',
    orders: 'order',
    executions: 'execution',
    wallet: 'wallet'
  };
  
  connect() {
    this.ws = new WebSocket('wss://stream.bybit.com/v5/public/spot');
    this.privateWs = new WebSocket('wss://stream.bybit.com/v5/private');
  }
}
```

#### **Rate Limits:**
- **REST API:** 100 requests/second для trading
- **WebSocket:** 240 connections максимум
- **Order rate:** 20 orders/second per symbol

#### **Authentication:**
```typescript
class BybitAuth {
  private createSignature(params: any, timestamp: number): string {
    const queryString = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('&');
    
    const signString = timestamp + this.apiKey + queryString;
    return crypto.createHmac('sha256', this.secret).update(signString).digest('hex');
  }
  
  private getHeaders(params: any): Headers {
    const timestamp = Date.now();
    return {
      'X-BAPI-API-KEY': this.apiKey,
      'X-BAPI-SIGN': this.createSignature(params, timestamp),
      'X-BAPI-TIMESTAMP': timestamp.toString(),
      'X-BAPI-RECV-WINDOW': '5000'
    };
  }
}
```

### 📊 **CCXT Library Integration:**

#### **Multi-Exchange Support:**
```typescript
import ccxt from 'ccxt';

class ExchangeManager {
  private exchanges = {
    bybit: new ccxt.bybit({
      apiKey: process.env.BYBIT_API_KEY,
      secret: process.env.BYBIT_SECRET,
      sandbox: process.env.NODE_ENV === 'development'
    })
  };
  
  async fetchOHLCV(symbol: string, timeframe: string): Promise<OHLCV[]> {
    return await this.exchanges.bybit.fetchOHLCV(symbol, timeframe);
  }
  
  async createOrder(symbol: string, type: string, side: string, amount: number, price?: number) {
    return await this.exchanges.bybit.createOrder(symbol, type, side, amount, price);
  }
}
```

---

## 📰 НОВОСТНЫЕ API

### 📱 **CoinTelegraph API**

#### **Endpoints:**
```typescript
const COINTELEGRAPH_API = {
  BASE_URL: 'https://cointelegraph.com/api/v1',
  ENDPOINTS: {
    LATEST_NEWS: '/news/latest',
    SEARCH_NEWS: '/news/search',
    CATEGORIES: '/news/categories'
  }
};

class CoinTelegraphService {
  async getLatestNews(limit: number = 50): Promise<NewsArticle[]> {
    const response = await axios.get(`${COINTELEGRAPH_API.BASE_URL}${COINTELEGRAPH_API.ENDPOINTS.LATEST_NEWS}`, {
      params: { limit },
      headers: { 'X-API-KEY': process.env.COINTELEGRAPH_API_KEY }
    });
    
    return response.data.articles.map(this.transformArticle);
  }
  
  private transformArticle(raw: any): NewsArticle {
    return {
      id: raw.id,
      title: raw.title,
      content: raw.content,
      published_at: raw.published_at,
      author: raw.author,
      tags: raw.tags,
      sentiment: null, // Будет заполнено ML моделью
      relevance_score: this.calculateRelevance(raw.tags)
    };
  }
}
```

### 📡 **NewsNow API**

#### **Configuration:**
```typescript
class NewsNowService {
  private config = {
    baseUrl: 'https://api.newsnow.co.uk/v1',
    categories: ['cryptocurrency', 'bitcoin', 'blockchain', 'finance'],
    languages: ['en'],
    maxAge: '24h'
  };
  
  async fetchNews(): Promise<NewsArticle[]> {
    const articles = [];
    
    for (const category of this.config.categories) {
      const response = await axios.get(`${this.config.baseUrl}/search`, {
        params: {
          q: category,
          language: 'en',
          maxAge: this.config.maxAge,
          limit: 100
        },
        headers: { 'Authorization': `Bearer ${process.env.NEWSNOW_API_KEY}` }
      });
      
      articles.push(...response.data.articles);
    }
    
    return this.deduplicateArticles(articles);
  }
}
```

### 🐦 **Twitter/X API v2**

#### **Tweet Monitoring:**
```typescript
class TwitterService {
  private client = new TwitterApi(process.env.TWITTER_BEARER_TOKEN);
  
  async monitorCryptoInfluencers(): Promise<Tweet[]> {
    const influencers = [
      '@elonmusk', '@michael_saylor', '@VitalikButerin',
      '@APompliano', '@DocumentingBTC', '@PlanB_Network'
    ];
    
    const tweets = [];
    
    for (const handle of influencers) {
      const userTweets = await this.client.v2.userTimelineByUsername(
        handle.substring(1), {
          max_results: 10,
          'tweet.fields': ['created_at', 'public_metrics', 'context_annotations']
        }
      );
      
      tweets.push(...userTweets.data);
    }
    
    return this.filterCryptoRelevantTweets(tweets);
  }
  
  private filterCryptoRelevantTweets(tweets: Tweet[]): Tweet[] {
    const cryptoKeywords = ['bitcoin', 'btc', 'ethereum', 'eth', 'crypto', 'blockchain'];
    
    return tweets.filter(tweet => 
      cryptoKeywords.some(keyword => 
        tweet.text.toLowerCase().includes(keyword)
      )
    );
  }
}
```

### 📱 **Reddit API**

#### **Subreddit Monitoring:**
```typescript
class RedditService {
  private snoowrap = new Snoowrap({
    userAgent: 'TradingBot/1.0',
    clientId: process.env.REDDIT_CLIENT_ID,
    clientSecret: process.env.REDDIT_CLIENT_SECRET,
    refreshToken: process.env.REDDIT_REFRESH_TOKEN
  });
  
  async getCryptoSubredditPosts(): Promise<RedditPost[]> {
    const subreddits = ['cryptocurrency', 'bitcoin', 'ethereum', 'trading'];
    const posts = [];
    
    for (const subreddit of subreddits) {
      const hotPosts = await this.snoowrap.getSubreddit(subreddit).getHot({ limit: 25 });
      posts.push(...hotPosts);
    }
    
    return posts.map(this.transformRedditPost);
  }
  
  private calculateSentimentScore(post: any): number {
    // Простой sentiment на основе upvotes/downvotes ratio
    const ratio = post.ups / (post.ups + post.downs || 1);
    const engagement = Math.log(post.num_comments + 1);
    
    return (ratio - 0.5) * 2 * Math.min(engagement / 5, 1);
  }
}
```

---

## 💹 МАКРОЭКОНОМИЧЕСКИЕ API

### 🏦 **Alpha Vantage API**

#### **Economic Indicators:**
```typescript
class AlphaVantageService {
  private apiKey = process.env.ALPHA_VANTAGE_API_KEY;
  private baseUrl = 'https://www.alphavantage.co/query';
  
  async getFederalFundsRate(): Promise<EconomicData[]> {
    const response = await axios.get(this.baseUrl, {
      params: {
        function: 'FEDERAL_FUNDS_RATE',
        interval: 'monthly',
        apikey: this.apiKey
      }
    });
    
    return response.data.data.map(point => ({
      date: point.date,
      value: parseFloat(point.value),
      indicator: 'FEDERAL_FUNDS_RATE'
    }));
  }
  
  async getCPIData(): Promise<EconomicData[]> {
    const response = await axios.get(this.baseUrl, {
      params: {
        function: 'CPI',
        interval: 'monthly',
        apikey: this.apiKey
      }
    });
    
    return response.data.data;
  }
  
  async getDXYData(): Promise<MarketData[]> {
    const response = await axios.get(this.baseUrl, {
      params: {
        function: 'TIME_SERIES_DAILY',
        symbol: 'DXY',
        apikey: this.apiKey
      }
    });
    
    return Object.entries(response.data['Time Series (Daily)']).map(([date, data]: any) => ({
      date,
      open: parseFloat(data['1. open']),
      high: parseFloat(data['2. high']),
      low: parseFloat(data['3. low']),
      close: parseFloat(data['4. close']),
      volume: parseFloat(data['5. volume'])
    }));
  }
}
```

### 📊 **FRED API (Federal Reserve Economic Data)**

#### **Economic Calendar:**
```typescript
class FREDService {
  private apiKey = process.env.FRED_API_KEY;
  private baseUrl = 'https://api.stlouisfed.org/fred/series/observations';
  
  async getUnemploymentRate(): Promise<EconomicData[]> {
    const response = await axios.get(this.baseUrl, {
      params: {
        series_id: 'UNRATE',
        api_key: this.apiKey,
        file_type: 'json',
        limit: 12 // Последние 12 месяцев
      }
    });
    
    return response.data.observations;
  }
  
  async getInflationRate(): Promise<EconomicData[]> {
    return this.getSeriesData('CPIAUCSL'); // Consumer Price Index
  }
  
  async getGDPGrowth(): Promise<EconomicData[]> {
    return this.getSeriesData('GDP'); // Gross Domestic Product
  }
}
```

---

## ⛓️ BLOCKCHAIN DATA APIs

### 💎 **Glassnode API**

#### **On-Chain Metrics:**
```typescript
class GlassnodeService {
  private apiKey = process.env.GLASSNODE_API_KEY;
  private baseUrl = 'https://api.glassnode.com/v1/metrics';
  
  async getExchangeInflows(asset: string = 'btc'): Promise<OnChainMetric[]> {
    const response = await axios.get(`${this.baseUrl}/transactions/transfers_volume_exchanges_net`, {
      params: {
        a: asset,
        i: '24h',
        api_key: this.apiKey
      }
    });
    
    return response.data;
  }
  
  async getWhaleTransactions(asset: string = 'btc'): Promise<OnChainMetric[]> {
    const response = await axios.get(`${this.baseUrl}/transactions/transfers_volume_sum_1k_10k`, {
      params: {
        a: asset,
        i: '1h',
        api_key: this.apiKey
      }
    });
    
    return response.data;
  }
  
  async getNUPL(asset: string = 'btc'): Promise<OnChainMetric[]> {
    // Net Unrealized Profit/Loss
    const response = await axios.get(`${this.baseUrl}/indicators/nupl`, {
      params: {
        a: asset,
        i: '24h',
        api_key: this.apiKey
      }
    });
    
    return response.data;
  }
}
```

### 📈 **Santiment API**

#### **Social and Development Metrics:**
```typescript
class SantimentService {
  private apiKey = process.env.SANTIMENT_API_KEY;
  private baseUrl = 'https://api.santiment.net/graphql';
  
  async getSocialVolume(slug: string = 'bitcoin'): Promise<SocialMetric[]> {
    const query = `
      query {
        getMetric(metric: "social_volume_total") {
          timeseriesData(
            slug: "${slug}"
            from: "${this.getYesterday()}"
            to: "${this.getToday()}"
            interval: "1h"
          ) {
            datetime
            value
          }
        }
      }
    `;
    
    const response = await axios.post(this.baseUrl, {
      query
    }, {
      headers: {
        'Authorization': `Apikey ${this.apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    return response.data.data.getMetric.timeseriesData;
  }
  
  async getDevelopmentActivity(slug: string = 'bitcoin'): Promise<DevelopmentMetric[]> {
    const query = `
      query {
        getMetric(metric: "dev_activity") {
          timeseriesData(
            slug: "${slug}"
            from: "${this.getLastWeek()}"
            to: "${this.getToday()}"
            interval: "1d"
          ) {
            datetime
            value
          }
        }
      }
    `;
    
    const response = await axios.post(this.baseUrl, { query }, {
      headers: { 'Authorization': `Apikey ${this.apiKey}` }
    });
    
    return response.data.data.getMetric.timeseriesData;
  }
}
```

---

## 🔧 API MANAGEMENT LAYER

### 🔄 **Rate Limiting & Circuit Breaker**

#### **Rate Limiter Implementation:**
```typescript
class APIRateLimiter {
  private limiters = new Map<string, RateLimiterRedis>();
  
  constructor(private redis: Redis) {
    // Настройка лимитов для каждого API
    this.setupLimiters();
  }
  
  private setupLimiters() {
    this.limiters.set('bybit', new RateLimiterRedis({
      storeClient: this.redis,
      keyPrefix: 'rl_bybit',
      points: 100, // 100 requests
      duration: 60, // per 60 seconds
    }));
    
    this.limiters.set('cointelegraph', new RateLimiterRedis({
      storeClient: this.redis,
      keyPrefix: 'rl_ct',
      points: 1000,
      duration: 3600, // per hour
    }));
  }
  
  async checkLimit(apiName: string, key: string = 'default'): Promise<boolean> {
    const limiter = this.limiters.get(apiName);
    if (!limiter) return true;
    
    try {
      await limiter.consume(key);
      return true;
    } catch (rejRes) {
      console.log(`Rate limit exceeded for ${apiName}: ${rejRes.msBeforeNext}ms until reset`);
      return false;
    }
  }
}
```

#### **Circuit Breaker Pattern:**
```typescript
class APICircuitBreaker {
  private breakers = new Map<string, CircuitBreaker>();
  
  constructor() {
    this.setupBreakers();
  }
  
  private setupBreakers() {
    const options = {
      timeout: 5000, // 5 second timeout
      errorThresholdPercentage: 50, // Open circuit at 50% error rate
      resetTimeout: 30000 // Try again after 30 seconds
    };
    
    this.breakers.set('bybit', new CircuitBreaker(this.callBybitAPI.bind(this), options));
    this.breakers.set('news', new CircuitBreaker(this.callNewsAPI.bind(this), options));
  }
  
  async callAPI(service: string, endpoint: string, params: any): Promise<any> {
    const breaker = this.breakers.get(service);
    if (!breaker) throw new Error(`Unknown service: ${service}`);
    
    return await breaker.fire(endpoint, params);
  }
}
```

### 🔄 **Retry Logic & Fallbacks**

#### **Exponential Backoff:**
```typescript
class APIRetryManager {
  async callWithRetry<T>(
    apiCall: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<T> {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await apiCall();
      } catch (error) {
        if (attempt === maxRetries) {
          throw error;
        }
        
        const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
        await this.sleep(delay);
      }
    }
  }
  
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

#### **Fallback Data Sources:**
```typescript
class DataSourceManager {
  private primarySources = {
    prices: 'bybit',
    news: 'cointelegraph',
    macro: 'alphavantage'
  };
  
  private fallbackSources = {
    prices: ['binance', 'coinbase'],
    news: ['newsnow', 'twitter'],
    macro: ['fred', 'yahoo_finance']
  };
  
  async getData(type: string, params: any): Promise<any> {
    // Пробуем основной источник
    try {
      return await this.callPrimarySource(type, params);
    } catch (error) {
      console.log(`Primary source failed for ${type}, trying fallbacks`);
      
      // Пробуем fallback источники
      for (const fallback of this.fallbackSources[type]) {
        try {
          return await this.callFallbackSource(fallback, type, params);
        } catch (fallbackError) {
          console.log(`Fallback ${fallback} also failed`);
        }
      }
      
      throw new Error(`All sources failed for ${type}`);
    }
  }
}
```

---

## 📊 API MONITORING & ANALYTICS

### 📈 **Performance Metrics:**

#### **API Performance Tracking:**
```typescript
class APIMetrics {
  async trackAPICall(apiName: string, endpoint: string, duration: number, success: boolean) {
    const metrics = {
      api_name: apiName,
      endpoint: endpoint,
      duration_ms: duration,
      success: success,
      timestamp: new Date().toISOString()
    };
    
    // Отправляем метрики в Prometheus
    this.prometheusMetrics.apiCallDuration
      .labels(apiName, endpoint, success.toString())
      .observe(duration);
    
    this.prometheusMetrics.apiCallTotal
      .labels(apiName, endpoint, success.toString())
      .inc();
    
    // Сохраняем в базу для анализа
    await this.saveMetricsToDatabase(metrics);
  }
  
  async getAPIHealthDashboard(): Promise<APIHealthStatus[]> {
    return await this.database.query(`
      SELECT 
        api_name,
        COUNT(*) as total_calls,
        AVG(duration_ms) as avg_duration,
        SUM(CASE WHEN success THEN 1 ELSE 0 END) / COUNT(*) as success_rate
      FROM api_metrics 
      WHERE timestamp > NOW() - INTERVAL '1 hour'
      GROUP BY api_name
    `);
  }
}
```

### 🚨 **Error Handling & Alerting:**

#### **Smart Error Classification:**
```typescript
class APIErrorHandler {
  classifyError(error: any, apiName: string): ErrorClassification {
    if (error.code === 'ECONNREFUSED') {
      return {
        type: 'CONNECTION_ERROR',
        severity: 'HIGH',
        autoRetry: true,
        alertTeam: true
      };
    }
    
    if (error.response?.status === 429) {
      return {
        type: 'RATE_LIMIT',
        severity: 'MEDIUM',
        autoRetry: true,
        alertTeam: false
      };
    }
    
    if (error.response?.status >= 500) {
      return {
        type: 'SERVER_ERROR',
        severity: 'HIGH',
        autoRetry: true,
        alertTeam: true
      };
    }
    
    return {
      type: 'UNKNOWN_ERROR',
      severity: 'LOW',
      autoRetry: false,
      alertTeam: false
    };
  }
}
```

---

## 🔐 API SECURITY

### 🛡️ **Security Best Practices:**

#### **API Key Management:**
```typescript
class SecureAPIKeyManager {
  private vault: HashiCorpVault;
  
  async getAPIKey(service: string): Promise<string> {
    const encryptedKey = await this.vault.read(`secret/api-keys/${service}`);
    return this.decrypt(encryptedKey.data.key);
  }
  
  async rotateAPIKey(service: string, newKey: string): Promise<void> {
    const encryptedKey = this.encrypt(newKey);
    await this.vault.write(`secret/api-keys/${service}`, { key: encryptedKey });
    
    // Уведомляем все сервисы об обновлении ключа
    await this.notifyServicesOfKeyRotation(service);
  }
  
  private encrypt(data: string): string {
    const cipher = crypto.createCipher('aes-256-cbc', process.env.ENCRYPTION_KEY);
    return cipher.update(data, 'utf8', 'hex') + cipher.final('hex');
  }
}
```

#### **Request Validation:**
```typescript
class APIRequestValidator {
  validateBybitSignature(request: Request): boolean {
    const signature = request.headers['x-bapi-sign'];
    const timestamp = request.headers['x-bapi-timestamp'];
    const apiKey = request.headers['x-bapi-api-key'];
    
    const expectedSignature = this.generateBybitSignature(
      request.body,
      timestamp,
      apiKey
    );
    
    return signature === expectedSignature;
  }
  
  private generateBybitSignature(body: any, timestamp: string, apiKey: string): string {
    const params = typeof body === 'string' ? body : JSON.stringify(body);
    const signString = timestamp + apiKey + params;
    return crypto.createHmac('sha256', process.env.BYBIT_SECRET).update(signString).digest('hex');
  }
}
```

---

**🔌 Данная архитектура API интеграций обеспечивает надежное подключение к всем необходимым внешним источникам данных с proper error handling, security и monitoring.**
