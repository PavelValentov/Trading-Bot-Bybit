# ТЕХНИЧЕСКИЙ КОНТЕКСТ ПРОЕКТА

## ТЕХНОЛОГИЧЕСКИЙ СТЕК

### FRONTEND
- **Framework:** Next.js
- **Цель:** Административный интерфейс для управления ботом

### BACKEND
- **Framework:** Nest.js
- **Архитектура:** Микросервисы
- **Цель:** API и бизнес-логика торговли

### БАЗЫ ДАННЫХ
- **MongoDB:** Хранение исторических данных, логов торгов
- **PostgreSQL + Prisma:** Основная реляционная БД для настроек, пользователей
- **Redis:** Кэширование, сессии, очереди задач

### БЕЗОПАСНОСТЬ
- **JWT:** Токенная авторизация
- **Цель:** Защищенный доступ к торговым функциям

### ДОКУМЕНТАЦИЯ
- **Swagger:** API документация
- **Цель:** Документирование всех endpoints

### ДЕПЛОЙМЕНТ
- **Docker Compose:** Локальная разработка
- **Ubuntu Server:** Продакшн среда
- **Цель:** Изолированная и масштабируемая инфраструктура

## ИНТЕГРАЦИИ

### ТОРГОВЫЕ API
- **Bybit API:** Основная торговая площадка
- **Статус:** Требует изучения документации

### ИСТОЧНИКИ ДАННЫХ
**Технические индикаторы:**
- Множественные источники рыночных данных
- **Статус:** Требует определения конкретных провайдеров

**Новостные API:**
- 11+ источников новостей и социальных сетей
- **Статус:** Требует получения API ключей и изучения документации

**Макроэкономические данные:**
- Экономические индикаторы и правительственные данные
- **Статус:** Требует определения источников (FRED, Yahoo Finance, др.)

## АРХИТЕКТУРНЫЕ РЕШЕНИЯ

### МИКРОСЕРВИСНАЯ АРХИТЕКТУРА
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Frontend       │    │  Gateway API    │    │  Auth Service   │
│  (Next.js)      │◄──►│  (Nest.js)      │◄──►│  (JWT)          │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Trading        │    │  Data Collection│    │  Analysis       │
│  Service        │    │  Service        │    │  Service        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
        │                     │                     │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Redis Cache    │    │  MongoDB        │    │  PostgreSQL     │
│                 │    │  (Time Series)  │    │  (Config/Users) │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## ТЕХНИЧЕСКИЕ ВЫЗОВЫ
1. **Реал-тайм обработка:** Обработка множественных потоков данных
2. **Надежность:** Отказоустойчивость торговых операций
3. **Безопасность:** Защита торговых ключей и средств
4. **Масштабируемость:** Возможность добавления новых источников данных
5. **Латентность:** Минимальные задержки в принятии торговых решений

## ТРЕБОВАНИЯ К ИНФРАСТРУКТУРЕ
- **ОЗУ:** Минимум 8GB для всех сервисов
- **CPU:** Многоядерный процессор для параллельной обработки
- **Сеть:** Стабильное соединение с низкой латентностью
- **Хранилище:** SSD для быстрого доступа к данным

## СТАТУС ТЕХНИЧЕСКОЙ ГОТОВНОСТИ
🔴 **НЕ ГОТОВ К РЕАЛИЗАЦИИ**
- Отсутствует детальная архитектура
- Не определены конкретные API endpoints
- Нет схемы базы данных
- Отсутствуют алгоритмы принятия решений

## DOCKER DATA PERSISTENCE АРХИТЕКТУРА

### СЛУЖЕБНЫЕ ПАПКИ ДАННЫХ
**Дата добавления:** $(date '+%Y-%m-%d %H:%M:%S')

#### 🗄️ DATA PERSISTENCE STRATEGY:

##### Локальные папки для данных:
```
~/code/trading/Bybit-Bot/data/
├── mongodb/     # MongoDB container data
├── postgres/    # PostgreSQL container data  
└── redis/       # Redis container data
```

#### 🔗 DOCKER VOLUME MAPPING:

##### Container to Host mapping:
```yaml
# docker-compose.yml volume configuration

services:
  mongodb:
    volumes:
      - ./data/mongodb:/data/db
    # MongoDB stores: collections, indexes, databases
    
  postgres:
    volumes:
      - ./data/postgres:/var/lib/postgresql/data
    # PostgreSQL stores: tables, indexes, WAL, configs
    
  redis:
    volumes:
      - ./data/redis:/data
    # Redis stores: RDB snapshots, AOF files
```

#### 📊 DATA DISTRIBUTION BY SERVICE:

##### PostgreSQL data (`./data/postgres/`):
- **Users table** - user accounts, API keys, settings
- **Portfolios table** - account balances, performance metrics  
- **Orders table** - trading orders history
- **Positions table** - current and historical positions
- **Risk management** - risk limits, violations log
- **Configuration** - system settings, parameters

##### MongoDB data (`./data/mongodb/`):
- **Market data** - price history, volume, OHLCV
- **News collection** - aggregated news, sentiment scores
- **Technical indicators** - RSI, MACD, Bollinger Bands calculations
- **ML models** - trained models, weights, predictions
- **Logs collection** - application logs, events
- **Configuration** - dynamic system configuration

##### Redis data (`./data/redis/`):
- **Cache keys** - frequently accessed data
- **Sessions** - user authentication sessions
- **Pub/Sub channels** - real-time event messaging
- **Rate limiting** - API call counters
- **Distributed locks** - coordination between services

#### ⚡ PERFORMANCE CHARACTERISTICS:

##### Access patterns:
- **PostgreSQL**: Transactional, ACID compliance required
- **MongoDB**: Document queries, time-series optimization
- **Redis**: In-memory operations, persistence for durability

##### Data sizes (expected):
- **PostgreSQL**: 1-10GB (transactional data)
- **MongoDB**: 10-100GB (historical market data)
- **Redis**: 100MB-1GB (cache and sessions)

#### 🔧 TECHNICAL INTEGRATION:

##### Docker Compose services:
```yaml
# Production-ready configuration
volumes:
  # Bind mounts for development
  - type: bind
    source: ./data/postgres
    target: /var/lib/postgresql/data
    
  # Named volumes for production
  postgres_data:
    driver: local
    driver_opts:
      type: none
      device: /opt/trading-bot/data/postgres
      o: bind
```

##### Environment-specific configs:
```bash
# Development
DATA_PATH=./data

# Production  
DATA_PATH=/opt/trading-bot/data
```

#### 🛡️ SECURITY & BACKUP:

##### Security measures:
- **Host-only access** - data folders accessible only on Docker host
- **Container isolation** - each service accesses only its data
- **No external exposure** - data folders not exposed to network
- **Encrypted backups** - all production backups must be encrypted

##### Backup strategy:
```bash
# Automated backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
tar -czf "backup_${DATE}.tar.gz" \
    ./data/postgres \
    ./data/mongodb \
    ./data/redis
```

#### 📈 MONITORING & ALERTING:

##### Disk usage monitoring:
```bash
# Monitor data folder sizes
watch "du -sh ./data/*"

# Alert thresholds:
# Warning: > 5GB
# Critical: > 20GB  
# Emergency: > 50GB
```

##### Health checks:
- **PostgreSQL**: Connection test, table accessibility
- **MongoDB**: Collection queries, index status
- **Redis**: Memory usage, persistence status

#### 🎯 АРХИТЕКТУРНАЯ ВАЖНОСТЬ:

Эти папки обеспечивают:
- **Data durability** - данные сохраняются между перезапусками
- **Development consistency** - одинаковая структура в dev/prod
- **Backup simplicity** - простота создания резервных копий
- **Disaster recovery** - быстрое восстановление данных
- **Horizontal scaling** - возможность миграции данных

**Критическая инфраструктура для торговой системы реального времени.**
