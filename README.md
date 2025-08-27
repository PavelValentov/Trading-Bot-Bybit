# 🚀 Bybit Trading Bot - Advanced Algorithmic Trading System

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.5+-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](https://www.docker.com/)

Профессиональный алгоритмический торговый бот для криптовалютной биржи Bybit с интеллектуальным анализом рынка и автоматическим принятием торговых решений.

---

## 📋 ТЕХНИЧЕСКОЕ И ПРОДУКТОВОЕ ЗАДАНИЕ

### 🎯 **Для заказчика и аналитиков**

Перед началом разработки необходимо ознакомиться с детальной документацией проекта:

#### 📚 **[Полная документация проекта](./documentation/index.md)**

### 🎯 **Основные разделы:**

#### 🌟 [Продуктовая спецификация](./documentation/product-specification/)
- **[Продуктовое видение и цели](./documentation/product-specification/product-vision.md)** - Общее видение продукта, целевая аудитория, конкурентные преимущества
- **[Функциональные требования](./documentation/product-specification/functional-requirements.md)** - Детальные требования к функциональности
- **[Пользовательские истории](./documentation/product-specification/user-stories.md)** - Сценарии использования системы
- **[Бизнес-логика торговли](./documentation/product-specification/trading-logic.md)** - Алгоритмы принятия торговых решений

#### 🔧 [Техническая спецификация](./documentation/technical-requirements/)
- **[Архитектура системы](./documentation/technical-requirements/system-architecture.md)** - Микросервисная архитектура, взаимодействие компонентов
- **[Технический стек](./documentation/technical-requirements/tech-stack.md)** - Используемые технологии и обоснование выбора
- **[API интеграции](./documentation/technical-requirements/api-integrations.md)** - Интеграция с Bybit и внешними сервисами
- **[Схемы баз данных](./documentation/technical-requirements/database-schemas.md)** - Структура данных PostgreSQL, MongoDB, Redis
- **[Безопасность системы](./documentation/technical-requirements/security-requirements.md)** - Требования к безопасности

#### 📊 [Управление проектом](./documentation/project-management/)
- **[План реализации](./documentation/project-management/implementation-plan.md)** - Поэтапный план разработки с таймингами
- **[Временные рамки и этапы](./documentation/project-management/timeline-milestones.md)** - Детальные сроки и контрольные точки
- **[Ресурсы и команда](./documentation/project-management/resources-team.md)** - Состав команды и роли
- **[Бюджет и стоимость](./documentation/project-management/budget-costs.md)** - Стоимость разработки по этапам
- **[Риски и митигации](./documentation/project-management/risks-mitigations.md)** - Анализ рисков проекта

#### 📈 [Бизнес-анализ](./documentation/business-analysis/)
- **[Требования к заказчику](./documentation/business-analysis/client-requirements.md)** - Обязательства и требования со стороны заказчика
- **[Процессы взаимодействия](./documentation/business-analysis/collaboration-process.md)** - Процессы коммуникации и сотрудничества
- **[Критерии приемки](./documentation/business-analysis/acceptance-criteria.md)** - Критерии готовности и приемки проекта
- **[ROI и эффективность](./documentation/business-analysis/roi-analysis.md)** - Анализ окупаемости и эффективности

---

## 💰 СТОИМОСТЬ И СРОКИ ПРОЕКТА

### 📅 **Общие параметры проекта:**
- **Длительность:** 16-20 недель (4-5 месяцев)
- **Команда:** 4-6 специалистов
- **Общая стоимость:** $145,000 - $200,000
- **Методология:** Agile + MVP-driven development

### 💵 **Стоимость по этапам:**

| Этап | Длительность | Команда | Стоимость | Результат |
|------|-------------|---------|-----------|-----------|
| **MVP** | 4-5 недель | 4 чел. | $25,000 - $35,000 | Базовая торговая система |
| **Аналитика** | 4-5 недель | 5 чел. | $30,000 - $40,000 | 17+ индикаторов + новости |
| **AI/ML** | 4-5 недель | 6 чел. | $40,000 - $55,000 | Машинное обучение |
| **Enterprise** | 4-5 недель | 5 чел. | $35,000 - $45,000 | Продакшн-готовое решение |
| **Тестирование** | 2-4 недели | 3-4 чел. | $15,000 - $25,000 | Полное тестирование |

### 📊 **Дополнительные расходы (ежемесячно):**
- **Инфраструктура AWS/GCP:** $2,000 - $5,000
- **API лицензии и данные:** $1,000 - $3,000
- **Поддержка и сопровождение:** $10,000 - $15,000

---

## 🎯 КЛЮЧЕВЫЕ ОСОБЕННОСТИ СИСТЕМЫ

### 🤖 **Интеллектуальная торговая система**
- **Гибридный алгоритм** принятия решений (ML + экспертные правила)
- **17+ технических индикаторов** (RSI, MACD, Bollinger Bands, Ichimoku и др.)
- **Фундаментальный анализ** новостей и социальных сетей
- **Макроэкономические данные** (ставки ФРС, инфляция, DXY)
- **Адаптивная система весов** для различных рыночных условий

### 📊 **Источники данных**
- **Технический анализ:** Momentum, RSI, MACD, Bollinger Bands, Moving Averages, ADX, Stochastic, CCI, MFI, OBV, VWAP, ATR, Support & Resistance, Fibonacci, Ichimoku
- **Фундаментальный анализ:** CoinTelegraph API, NewsNow, Twitter/X API, Reddit API, Telegram, Discord API
- **Макроэкономика:** Fed/ECB/BoJ данные, CPI, PPI, Non-Farm Payrolls, DXY, US Treasuries, S&P 500, VIX
- **Блокчейн аналитика:** Glassnode API, Santiment API, LunarCrush API, Messari API

### 🏗️ **Архитектура**
- **15 микросервисов** с четким разделением ответственности
- **Event-driven архитектура** для real-time обработки
- **Высокая доступность** и отказоустойчивость
- **Горизонтальное масштабирование**

---

## 📞 ОБСУЖДЕНИЕ С ЗАКАЗЧИКОМ

### 🎯 **Следующие шаги:**

1. **📖 Изучение документации** - ознакомление с техническим и продуктовым заданием
2. **�� Обсуждение требований** - встреча для обсуждения функциональности и подходов
3. **⏰ Согласование сроков** - планирование временных рамок и контрольных точек
4. **💰 Утверждение бюджета** - согласование стоимости и условий оплаты
5. **✍️ Подписание ТЗ** - финализация технического задания
6. **🚀 Начало разработки** - запуск первого спринта

### 📋 **Готовность заказчика:**

Для успешного начала проекта заказчику необходимо:
- **Назначить ответственных** за продукт и торговую экспертизу
- **Предоставить API доступы** к Bybit (testnet для начала)
- **Определить торговые параметры** и риск-лимиты
- **Выделить время команды** для еженедельных демо и планирования

---

## 🛠️ ТЕКУЩИЙ СТАТУС РАЗРАБОТКИ

### ✅ **Завершено (инфраструктура):**
- [x] Базовая архитектура проекта
- [x] Docker инфраструктура (PostgreSQL, MongoDB, Redis)
- [x] Nest.js приложение с микросервисной структурой
- [x] Система логирования и мониторинга
- [x] CI/CD готовность

### 🔄 **В процессе:**
- [ ] Обсуждение с заказчиком технического задания
- [ ] Согласование требований и сроков
- [ ] Финализация архитектурных решений

### ⏳ **Планируется:**
- [ ] Auth Service - система аутентификации
- [ ] Trading Service - основной торговый сервис  
- [ ] Decision Engine - алгоритм принятия решений
- [ ] Technical Analysis - система технических индикаторов

---

## 📁 Структура данных Docker контейнеров

### Служебные папки для персистентного хранения данных

Проект использует локальные папки для хранения данных из Docker контейнеров:

```
/data/                          # Корневая папка данных
├── mongodb/                    # MongoDB персистентные данные
├── postgres/                   # PostgreSQL персистентные данные
└── redis/                      # Redis персистентные данные
```

#### Назначение папок:

##### 🍃 **MongoDB данные** (`./data/mongodb/`)
- **Содержимое:** Market data, news, indicators, ML models
- **Mount в контейнере:** `/data/db`
- **Важность:** КРИТИЧЕСКАЯ - исторические данные и модели
- **Типичный размер:** 10-100GB

##### 🐘 **PostgreSQL данные** (`./data/postgres/`)
- **Содержимое:** Users, portfolios, orders, positions, risk data
- **Mount в контейнере:** `/var/lib/postgresql/data`
- **Важность:** КРИТИЧЕСКАЯ - транзакционные данные
- **Типичный размер:** 1-10GB

##### 🔴 **Redis данные** (`./data/redis/`)
- **Содержимое:** Cache, sessions, pub/sub messages
- **Mount в контейнере:** `/data`
- **Важность:** СРЕДНЯЯ - восстанавливаемые данные
- **Типичный размер:** 100MB-1GB

#### Docker Compose интеграция:

```yaml
# Автоматический маппинг в docker-compose.yml
services:
  postgres:
    volumes:
      - ./data/postgres:/var/lib/postgresql/data
      
  mongodb:
    volumes:
      - ./data/mongodb:/data/db
      
  redis:
    volumes:
      - ./data/redis:/data
```

#### ⚠️ Важные правила:

- **НЕ удалять** папки во время работы контейнеров
- **НЕ редактировать** файлы БД напрямую
- **Делать backup** перед критическими изменениями
- **Мониторить размер** папок данных

#### Управление данными:

```bash
# Просмотр размера данных
du -sh ./data/*

# Backup всех данных
tar -czf backup-$(date +%Y%m%d).tar.gz ./data/

# Очистка данных (ОСТОРОЖНО!)
docker-compose down
rm -rf ./data/mongodb/* ./data/postgres/* ./data/redis/*
docker-compose up -d
```

**⚡ Эти папки критичны для работы торговой системы - данные сохраняются между перезапусками контейнеров!**

---

## 🏗️ Архитектура проекта

### Технологический стек

#### Backend
- **Framework:** Nest.js (Node.js + TypeScript)
- **Архитектура:** Микросервисы + Event-driven
- **API:** REST + GraphQL + WebSocket
- **Документация:** Swagger/OpenAPI

#### Базы данных
- **PostgreSQL:** Транзакционные данные (users, orders, portfolios)
- **MongoDB:** Временные ряды (market data, news, indicators)
- **Redis:** Кэширование, сессии, pub/sub

#### Внешние интеграции
- **Bybit API:** Торговые операции и рыночные данные
- **News APIs:** CoinTelegraph, NewsNow, Twitter/X
- **Macro Data:** Alpha Vantage, FRED API
- **Blockchain Data:** Glassnode, Santiment, Messari

#### Инфраструктура
- **Контейнеризация:** Docker + Docker Compose
- **Мониторинг:** Prometheus + Grafana
- **Логирование:** Winston + ELK Stack
- **Deployment:** AWS/GCP ready

### Микросервисы архитектура

Система состоит из 15 специализированных микросервисов:

#### Core Services
- **API Gateway** - точка входа и маршрутизация
- **Auth Service** - аутентификация и авторизация
- **Decision Engine** - центральный алгоритм принятия решений
- **Trading Service** - выполнение торговых операций

#### Data Collection Services  
- **Market Data Service** - сбор рыночных данных
- **News Service** - агрегация новостей
- **Macro Data Service** - макроэкономические данные

#### Analysis Services
- **Technical Analysis** - технические индикаторы
- **Fundamental Analysis** - фундаментальный анализ
- **ML Analysis** - машинное обучение и предсказания

#### Business Services
- **Portfolio Service** - управление портфелем
- **Risk Service** - управление рисками
- **Weight System** - система весовых коэффициентов

#### Infrastructure Services
- **Config Service** - управление конфигурацией
- **Metrics Service** - сбор и анализ метрик

---

## 🚀 Быстрый старт

### Предварительные требования

- Node.js 18+
- Docker и Docker Compose
- Git

### Установка

```bash
# Клонирование репозитория
git clone git@github.com:PavelValentov/Trading-Bot-Bybit.git
cd Trading-Bot-Bybit

# Установка зависимостей
npm install

# Настройка переменных окружения
cp .env.example .env
# Отредактируйте .env файл с вашими настройками

# Запуск инфраструктуры
docker-compose up -d

# Сборка проекта
npm run build

# Запуск в режиме разработки
npm run start:dev
```

### Доступные endpoints

- **API Documentation:** http://localhost:3000/api/docs
- **Health Check:** http://localhost:3000/api/v1/health
- **Grafana Monitoring:** http://localhost:3015 (admin/admin)
- **Prometheus Metrics:** http://localhost:9090

---

## �� Система мониторинга

### Метрики производительности
- **Latency:** Время принятия торговых решений
- **Throughput:** Количество обработанных сигналов
- **Accuracy:** Точность торговых прогнозов
- **Uptime:** Доступность системы

### Бизнес метрики
- **PnL:** Прибыль и убытки по торговым операциям  
- **Win Rate:** Процент прибыльных сделок
- **Sharpe Ratio:** Риск-скорректированная доходность
- **Max Drawdown:** Максимальная просадка

---

## �� Безопасность

### Аутентификация и авторизация
- JWT токены с ротацией
- Multi-factor authentication (MFA)
- Role-based access control (RBAC)

### Защита данных
- Шифрование API ключей в базе данных
- HTTPS/TLS для всех подключений
- Rate limiting и DDoS защита
- Audit logging всех операций

---

## 📞 Поддержка и контакты

### Для заказчиков
- **Email:** trading-bot-support@company.com
- **Slack:** #trading-bot-project
- **Документация:** [./documentation/](./documentation/)

### Для разработчиков
- **GitHub Issues:** [Issues](https://github.com/PavelValentov/Trading-Bot-Bybit/issues)
- **API Documentation:** [Swagger UI](http://localhost:3000/api/docs)
- **Architecture Docs:** [./memory-bank/](./memory-bank/)

---

## 📄 Лицензия

Этот проект лицензирован под MIT License - подробности в файле [LICENSE](LICENSE).

---

**⚡ Готов к обсуждению проекта с заказчиком! Свяжитесь с нами для детального планирования и начала разработки.**
