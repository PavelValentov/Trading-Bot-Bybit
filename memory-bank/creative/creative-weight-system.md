# CREATIVE PHASE: СИСТЕМА ВЕСОВЫХ КОЭФФИЦИЕНТОВ

## ДЕТАЛЬНАЯ СТРУКТУРА ВЕСОВ

### Технические индикаторы (базовые веса внутри TA категории)

```python
class TechnicalIndicatorWeights:
    def __init__(self):
        self.base_weights = {
            # Momentum индикаторы
            'rsi': 0.12,               # Надежный осциллятор
            'momentum': 0.08,          # Простой но эффективный
            'stochastic': 0.08,        # Дополнительный momentum
            
            # Trend индикаторы  
            'macd': 0.15,             # Классический trend+momentum
            'moving_averages': 0.18,   # Основа технического анализа
            'adx': 0.10,              # Сила тренда
            'ichimoku': 0.08,         # Комплексный анализ
            
            # Volatility индикаторы
            'bollinger_bands': 0.12,   # Волатильность + поддержка/сопротивление
            'atr': 0.05,              # Измерение волатильности
            
            # Volume индикаторы
            'obv': 0.06,              # Объемный анализ
            'mfi': 0.08,              # Money flow
            'vwap': 0.07,             # Объем-взвешенная цена
            
            # Support/Resistance
            'support_resistance': 0.10, # Ключевые уровни
            'fibonacci': 0.06,         # Коррекционные уровни
            
            # Sentiment индикаторы
            'fear_greed': 0.05,       # Рыночные эмоции
            'btc_dominance': 0.04     # Альткоин сезон
        }
        
        # Проверка суммы весов
        assert abs(sum(self.base_weights.values()) - 1.0) < 0.001
    
    def get_regime_adjusted_weights(self, regime):
        """Корректировка весов индикаторов под рыночный режим"""
        
        adjustments = {
            'bull_trend': {
                'moving_averages': 1.2,    # MA важнее в тренде
                'momentum': 1.3,           # Momentum сильнее  
                'rsi': 0.8,               # RSI может давать ложные сигналы
                'support_resistance': 0.9  # Уровни могут пробиваться
            },
            'bear_trend': {
                'rsi': 1.2,               # RSI надежнее в падении
                'bollinger_bands': 1.1,    # Волатильность растет
                'vwap': 1.2,              # Важность fair value
                'momentum': 0.8            # Momentum может обманывать
            },
            'sideways': {
                'support_resistance': 1.4, # Уровни критичны в диапазоне
                'rsi': 1.3,               # Осцилляторы работают лучше
                'stochastic': 1.2,        # Дополнительное подтверждение
                'moving_averages': 0.7    # MA менее надежны в флете
            },
            'high_volatility': {
                'atr': 1.5,               # Измерение волатильности важно
                'bollinger_bands': 1.3,    # Границы волатильности
                'fear_greed': 1.2,        # Эмоции важны
                'macd': 0.8               # Может давать ложные сигналы
            }
        }
        
        regime_adjustments = adjustments.get(regime, {})
        adjusted_weights = {}
        
        for indicator, base_weight in self.base_weights.items():
            adjustment = regime_adjustments.get(indicator, 1.0)
            adjusted_weights[indicator] = base_weight * adjustment
            
        # Нормализация
        total = sum(adjusted_weights.values())
        return {ind: weight/total for ind, weight in adjusted_weights.items()}
```

### Фундаментальные источники

```python
class FundamentalSourceWeights:
    def __init__(self):
        self.base_weights = {
            # Прямые источники анализа
            'bybit_news': 0.15,        # Официальные новости биржи
            'glassnode': 0.20,         # On-chain метрики
            'santiment': 0.15,         # Настроения и метрики
            'messari': 0.15,           # Профессиональная аналитика
            
            # Новостные агрегаторы
            'cointelegraph': 0.10,     # Основные новости
            'newsnow': 0.08,           # Агрегация новостей
            
            # Социальные сети
            'twitter': 0.07,           # Влиятельные аккаунты
            'reddit': 0.05,            # Комьюнити мнения
            'discord': 0.03,           # Проектные каналы
            'telegram': 0.02           # Сигнальные каналы
        }
    
    def get_time_adjusted_weights(self, time_context):
        """Корректировка весов по времени суток/недели"""
        
        adjustments = {}
        
        # Азиатская сессия - больше внимания к on-chain
        if time_context.get('session') == 'asian':
            adjustments.update({
                'glassnode': 1.2,
                'twitter': 0.8    # Twitter менее активен
            })
        
        # Американская сессия - больше внимания к новостям
        elif time_context.get('session') == 'us':
            adjustments.update({
                'cointelegraph': 1.3,
                'messari': 1.2,
                'reddit': 1.2
            })
        
        # Выходные - социальные сети важнее
        if time_context.get('is_weekend'):
            adjustments.update({
                'twitter': 1.3,
                'reddit': 1.4,
                'bybit_news': 0.7  # Меньше официальных новостей
            })
            
        return self._apply_adjustments(adjustments)
```

### Макроэкономические индикаторы

```python
class MacroIndicatorWeights:
    def __init__(self):
        self.base_weights = {
            # Монетарная политика (40%)
            'fed_rate': 0.20,          # Ключевая ставка ФРС
            'fed_rhetoric': 0.10,      # Риторика центробанков
            'qe_qt': 0.10,            # Количественное смягчение
            
            # Инфляция и экономика (30%)
            'cpi': 0.15,              # Индекс потребительских цен
            'ppi': 0.08,              # Индекс цен производителей
            'gdp': 0.07,              # Рост экономики
            
            # Фондовые рынки (20%)
            'sp500': 0.10,            # Основной индекс
            'nasdaq': 0.05,           # Технологический сектор
            'vix': 0.05,              # Индекс страха
            
            # Валюты и сырье (10%)
            'dxy': 0.05,              # Индекс доллара
            'gold': 0.03,             # Золото как safe haven
            'oil': 0.02               # Нефть и инфляция
        }
    
    def get_cycle_adjusted_weights(self, economic_cycle):
        """Корректировка под экономический цикл"""
        
        cycle_adjustments = {
            'expansion': {
                'gdp': 1.3,            # GDP важнее в росте
                'sp500': 1.2,          # Риск-он настроения
                'vix': 0.8,            # Меньше страхов
                'gold': 0.7            # Меньший интерес к safe haven
            },
            'contraction': {
                'fed_rate': 1.4,       # Монетарная политика критична
                'vix': 1.5,            # Страх растет
                'gold': 1.3,           # Safe haven актуален
                'sp500': 0.8           # Фондовый рынок менее важен
            },
            'recovery': {
                'qe_qt': 1.4,          # Стимулы важны
                'cpi': 1.2,            # Инфляционные ожидания
                'nasdaq': 1.3,         # Технологический рост
                'dxy': 1.1             # Валютная политика
            }
        }
        
        return self._apply_cycle_adjustments(cycle_adjustments.get(economic_cycle, {}))
```

## СИСТЕМА ВАЛИДАЦИИ ВЕСОВ

```python
class WeightValidationSystem:
    def __init__(self):
        self.constraints = {
            'sum_equals_one': True,
            'min_weight': 0.01,
            'max_weight': 0.8,
            'max_change_per_update': 0.1
        }
        
    def validate_weights(self, weights, previous_weights=None):
        """Полная валидация системы весов"""
        
        validation_results = {
            'valid': True,
            'errors': [],
            'warnings': []
        }
        
        # Проверка суммы весов
        weight_sum = sum(weights.values())
        if abs(weight_sum - 1.0) > 0.001:
            validation_results['errors'].append(
                f"Сумма весов {weight_sum:.3f} != 1.0"
            )
            validation_results['valid'] = False
        
        # Проверка минимальных/максимальных весов
        for source, weight in weights.items():
            if weight < self.constraints['min_weight']:
                validation_results['errors'].append(
                    f"Вес {source} ({weight:.3f}) меньше минимального ({self.constraints['min_weight']})"
                )
                validation_results['valid'] = False
                
            if weight > self.constraints['max_weight']:
                validation_results['errors'].append(
                    f"Вес {source} ({weight:.3f}) больше максимального ({self.constraints['max_weight']})"
                )
                validation_results['valid'] = False
        
        # Проверка скорости изменения весов
        if previous_weights:
            for source, weight in weights.items():
                prev_weight = previous_weights.get(source, 0)
                change = abs(weight - prev_weight)
                
                if change > self.constraints['max_change_per_update']:
                    validation_results['warnings'].append(
                        f"Большое изменение веса {source}: {change:.3f}"
                    )
        
        return validation_results
    
    def auto_fix_weights(self, weights):
        """Автоматическое исправление весов"""
        
        # Применение минимальных ограничений
        fixed_weights = {}
        for source, weight in weights.items():
            fixed_weights[source] = max(self.constraints['min_weight'], weight)
        
        # Применение максимальных ограничений  
        for source, weight in fixed_weights.items():
            fixed_weights[source] = min(self.constraints['max_weight'], weight)
        
        # Перенормализация
        total = sum(fixed_weights.values())
        fixed_weights = {source: weight / total for source, weight in fixed_weights.items()}
        
        return fixed_weights
```

## СИСТЕМА ОБЪЯСНЕНИЙ ВЕСОВ

```python
class WeightExplanationSystem:
    def __init__(self):
        self.explanation_templates = {
            'regime_based': "Веса скорректированы для режима '{regime}': {details}",
            'performance_based': "Адаптация по производительности: {details}",
            'time_based': "Временная корректировка: {details}",
            'constraint_applied': "Применены ограничения: {details}"
        }
    
    def generate_explanation(self, weights, context):
        """Генерация объяснения текущих весов"""
        
        explanations = []
        
        # Объяснение режима
        if 'regime' in context:
            regime_details = self._explain_regime_impact(context['regime'], weights)
            explanations.append(
                self.explanation_templates['regime_based'].format(
                    regime=context['regime'],
                    details=regime_details
                )
            )
        
        # Объяснение адаптации производительности
        if 'performance_changes' in context:
            perf_details = self._explain_performance_changes(context['performance_changes'])
            explanations.append(
                self.explanation_templates['performance_based'].format(details=perf_details)
            )
        
        # Объяснение доминирующих весов
        dominant_sources = self._identify_dominant_sources(weights)
        explanations.append(f"Доминирующие источники: {', '.join(dominant_sources)}")
        
        return "\n".join(explanations)
    
    def _explain_regime_impact(self, regime, weights):
        """Объяснение влияния рыночного режима на веса"""
        
        regime_explanations = {
            'bull_trend': "Увеличен вес технического анализа и momentum индикаторов",
            'bear_trend': "Повышен вес фундаментального анализа и макро факторов",
            'sideways': "Приоритет техническому анализу уровней поддержки/сопротивления", 
            'high_volatility': "Увеличен вес макроэкономических факторов и risk-off индикаторов",
            'low_volatility': "Сбалансированные веса с акцентом на технический анализ"
        }
        
        return regime_explanations.get(regime, "Стандартное распределение весов")
```

## ПЛАН ПОЭТАПНОГО ВНЕДРЕНИЯ

### Фаза 1: Базовая система (2 недели)
```python
# Простые статические веса с ручной настройкой
basic_weights = {
    'technical_analysis': 0.40,
    'fundamental_analysis': 0.30, 
    'macro_analysis': 0.20,
    'sentiment_analysis': 0.10
}
```

### Фаза 2: Адаптация по производительности (3 недели)
```python
# Добавление системы корректировки по результатам
performance_adapter = PerformanceBasedAdapter()
adaptive_weights = performance_adapter.adapt_weights(basic_weights, performance_data)
```

### Фаза 3: Рыночные режимы (4 недели)
```python
# Внедрение классификатора режимов
regime_classifier = MarketRegimeClassifier()
regime_weights = RegimeSpecificWeights()
current_regime = regime_classifier.classify_regime(market_data)
context_weights = regime_weights.get_regime_weights(current_regime)
```

### Фаза 4: Полная система (2 недели)
```python
# Интеграция всех компонентов
advanced_system = AdvancedWeightSystem()
final_weights = advanced_system.get_current_weights(market_data, performance_data)
```

## МЕТРИКИ ОЦЕНКИ СИСТЕМЫ ВЕСОВ

```python
class WeightSystemMetrics:
    def __init__(self):
        self.metrics = {
            'weight_stability': [],    # Стабильность весов во времени
            'performance_improvement': [], # Улучшение результатов
            'regime_accuracy': [],     # Точность классификации режимов
            'adaptation_speed': []     # Скорость адаптации к изменениям
        }
    
    def calculate_performance_metrics(self, weight_history, trading_results):
        """Расчет метрик производительности системы весов"""
        
        # Стабильность весов (низкая волатильность = хорошо)
        weight_volatility = self._calculate_weight_volatility(weight_history)
        
        # Улучшение производительности vs baseline
        baseline_performance = self._calculate_baseline_performance(trading_results)
        adaptive_performance = self._calculate_adaptive_performance(trading_results)
        improvement = (adaptive_performance - baseline_performance) / baseline_performance
        
        # Скорость адаптации (как быстро система реагирует на изменения)
        adaptation_speed = self._calculate_adaptation_speed(weight_history, trading_results)
        
        return {
            'weight_stability': 1.0 - weight_volatility,  # Высокая стабильность = хорошо
            'performance_improvement': improvement,
            'adaptation_speed': adaptation_speed,
            'overall_score': self._calculate_overall_score(weight_volatility, improvement, adaptation_speed)
        }
```

