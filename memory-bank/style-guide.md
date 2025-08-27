# РУКОВОДСТВО ПО СТИЛЮ ПРОЕКТА

## ЯЗЫКОВАЯ ПОЛИТИКА 🌐

### ОСНОВНОЕ ПРАВИЛО
**Документация на русском, код на английском**

### 🇷🇺 РУССКИЙ ЯЗЫК
**Применяется для:**
- Memory Bank документы
- Техническая документация (спецификации, архитектура)
- Планирование и задачи
- Бизнес-требования и контекст
- README файлы проектов
- Git commit messages
- Обсуждения и коммуникация в команде

### 🇺🇸 АНГЛИЙСКИЙ ЯЗЫК  
**Применяется для:**
- Весь программный код (переменные, функции, классы)
- Комментарии в коде и JSDoc
- API документация (OpenAPI/Swagger)
- Названия файлов и папок кода
- Database schemas (таблицы, столбцы)
- Configuration files
- Test descriptions
- Error messages и логи
- Environment variables

## СТИЛЬ КОДА

### TypeScript/JavaScript Conventions
```typescript
// ✅ Правильно - английские названия
class TradingService {
  private readonly apiClient: ApiClient;
  
  /**
   * Executes trading order on exchange
   * @param order Trading order details
   * @returns Order execution result
   */
  async executeOrder(order: TradingOrder): Promise<ExecutionResult> {
    // Validate order parameters before execution
    this.validateOrder(order);
    
    try {
      // Send order to exchange API
      const result = await this.apiClient.placeOrder(order);
      return result;
    } catch (error) {
      this.logger.error('Failed to execute trading order', { error, order });
      throw new TradingExecutionError('Order execution failed');
    }
  }
}
```

### Database Naming
```sql
-- ✅ Правильно - английские названия
CREATE TABLE trading_accounts (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    account_name VARCHAR(100),
    api_key_encrypted TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_trading_accounts_user_id ON trading_accounts(user_id);
```

### API Endpoints
```typescript
// ✅ Правильно - английские названия
@Controller('/api/v1/trading')
export class TradingController {
  @Post('/orders')
  async createOrder(@Body() createOrderDto: CreateOrderDto) {
    // Implementation
  }
  
  @Get('/portfolio/:accountId')
  async getPortfolio(@Param('accountId') accountId: string) {
    // Implementation
  }
}
```

## СТИЛЬ ДОКУМЕНТАЦИИ

### Memory Bank Documents
```markdown
## ЗАДАЧА: Реализация торгового сервиса

### ОПИСАНИЕ
Создание микросервиса для выполнения торговых операций с интеграцией к Bybit API.

### ТРЕБОВАНИЯ
- Поддержка spot и futures торговли
- Управление рисками на уровне позиций
- Логирование всех торговых операций

### FILE REFERENCES
#### Созданные файлы:
- `/src/services/trading/trading.service.ts` - Основной сервис торговли
- `/src/services/trading/dto/create-order.dto.ts` - DTO для создания ордеров
```

### Git Commit Messages (Русский)
```bash
# ✅ Правильно - русские commit messages
git commit -m "feat: Добавлен сервис аутентификации с JWT токенами

✅ Реализована базовая аутентификация пользователей
✅ Добавлена генерация и валидация JWT токенов  
✅ Создана middleware для проверки авторизации
✅ Добавлены unit тесты для AuthService

Closes #12"
```

### Code Comments (Английский)
```typescript
/**
 * Risk management service for trading operations
 * Validates position sizes and enforces trading limits
 */
@Injectable()
export class RiskService {
  /**
   * Validates if trading order meets risk requirements
   * @param order - Trading order to validate
   * @param account - Trading account information
   * @returns Validation result with approval status
   */
  async validateOrder(
    order: TradingOrder, 
    account: TradingAccount
  ): Promise<RiskValidationResult> {
    // Check position size limits
    const positionSizeValid = await this.checkPositionSize(order, account);
    
    // Validate account balance
    const balanceValid = await this.checkAccountBalance(order, account);
    
    // Return combined validation result
    return {
      approved: positionSizeValid && balanceValid,
      reasons: this.getValidationReasons(positionSizeValid, balanceValid)
    };
  }
}
```

## ФАЙЛОВАЯ СТРУКТУРА

### Названия файлов (Английский)
```
src/
├── services/
│   ├── auth/
│   │   ├── auth.service.ts
│   │   ├── auth.controller.ts
│   │   └── dto/
│   │       ├── login.dto.ts
│   │       └── register.dto.ts
│   ├── trading/
│   │   ├── trading.service.ts
│   │   ├── trading.controller.ts
│   │   └── interfaces/
│   │       └── trading-order.interface.ts
├── common/
│   ├── decorators/
│   ├── filters/
│   └── guards/
└── database/
    ├── migrations/
    └── schemas/
```

### README файлы (Русский)
```markdown
# Сервис Аутентификации

## Описание
Микросервис для аутентификации пользователей торговой системы.

## Функциональность
- JWT-based аутентификация
- Multi-factor authentication
- Session management
- Password reset functionality

## API Endpoints
- `POST /auth/login` - Вход в систему
- `POST /auth/register` - Регистрация нового пользователя
- `POST /auth/refresh` - Обновление токена
```

## КОНФИГУРАЦИЯ

### Environment Variables (Английский)
```bash
# Database configuration
DATABASE_URL=postgresql://user:pass@localhost:5432/trading
REDIS_URL=redis://localhost:6379

# External APIs
BYBIT_API_KEY=your_api_key
BYBIT_SECRET=your_secret

# JWT configuration
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=24h
```

### Config Files (Английский)
```typescript
export const databaseConfig = {
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT) || 5432,
  username: process.env.DATABASE_USER || 'trading',
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME || 'trading_db',
  synchronize: false,
  logging: process.env.NODE_ENV === 'development'
};
```

## ИСКЛЮЧЕНИЯ

### Допустимые английские термины в русской документации:
- Технические термины: API, endpoint, service, controller, DTO
- Названия технологий: Next.js, PostgreSQL, Redis, Docker
- Установленные термины: bug, feature, deploy, commit, merge
- HTTP методы: GET, POST, PUT, DELETE
- Status codes: 200, 404, 500

### Примеры корректного использования:
```markdown
## Реализация REST API для торгового сервиса

### Endpoints:
- `GET /api/v1/portfolio` - получение данных портфеля
- `POST /api/v1/orders` - создание нового ордера

### Технический стек:
- Backend: Nest.js с TypeScript
- Database: PostgreSQL + Redis cache
- Message Queue: Redis Pub/Sub
```

## КОНТРОЛЬ КАЧЕСТВА

### Code Review Checklist:
- [ ] Код написан на английском языке
- [ ] Комментарии в коде на английском
- [ ] Названия переменных и функций на английском
- [ ] Документация в Memory Bank на русском
- [ ] Commit messages на русском языке
- [ ] README файлы на русском языке

### Automated Checks:
- ESLint правила для проверки языка в комментариях
- Spell checker для английского в коде
- Spell checker для русского в документации

## ОБНОВЛЕНО
$(date '+%Y-%m-%d %H:%M:%S')
