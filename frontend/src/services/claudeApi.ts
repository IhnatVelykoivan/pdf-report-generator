import {
    detectLanguage,
    getReportTitle,
    type SupportedLanguage
} from '../config/languages';

export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

export interface DSLGenerationResult {
    dsl: any;
    explanation: string;
    suggestions: string[];
}

export class ClaudeApiService {
    private readonly baseUrl: string;

    constructor() {
        this.baseUrl = import.meta.env.VITE_PDF_API_URL || 'http://localhost:3001';
        console.log('🔗 Claude API через бэк-энд:', this.baseUrl);
    }

    // Основной метод для отправки сообщений через наш бэк-энд
    async sendMessage(messages: ChatMessage[], systemPrompt?: string): Promise<string> {
        try {
            console.log('🚀 Отправляем запрос через бэк-энд...');

            const response = await fetch(`${this.baseUrl}/api/claude/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    messages,
                    systemPrompt
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                throw new Error(`Backend Error: ${response.status} - ${errorData?.error || response.statusText}`);
            }

            const data = await response.json();
            console.log('✅ Получен ответ через бэк-энд');

            return data.response;
        } catch (error) {
            console.error('❌ Ошибка Claude API (через бэк-энд):', error);
            throw error;
        }
    }

    // Анализ требований пользователя и генерация умного ответа
    async analyzeUserRequest(userMessage: string, conversationHistory: ChatMessage[] = []): Promise<string> {
        const messages: ChatMessage[] = [
            ...conversationHistory,
            { role: 'user', content: userMessage }
        ];

        return await this.sendMessage(messages);
    }

    // Генерация DSL структуры на основе разговора
    async generateDSLFromConversation(conversationHistory: ChatMessage[]): Promise<DSLGenerationResult> {
        try {
            console.log('📝 Генерируем DSL через бэк-енд...');

            // Определяем ожидаемый язык из последнего сообщения пользователя
            const lastUserMessage = conversationHistory
                .filter(msg => msg.role === 'user')
                .pop()?.content || '';

            const expectedLang = detectLanguage(lastUserMessage);
            console.log(`🌐 Ожидаемый язык для DSL: ${expectedLang}`);

            const response = await fetch(`${this.baseUrl}/api/claude/generate-dsl`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    conversationHistory,
                    expectedLanguage: expectedLang
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                throw new Error(`Backend Error: ${response.status} - ${errorData?.error || response.statusText}`);
            }

            const result = await response.json();

            // Валидируем язык результата
            if (!this.validateDSLLanguage(result.dsl, expectedLang)) {
                console.warn('⚠️ DSL сгенерирован не на том языке, используем fallback');
                return this.createFallbackDSL(conversationHistory);
            }

            console.log('✅ DSL создан через бэк-енд на правильном языке:', result);

            return result;
        } catch (error) {
            console.error('❌ Ошибка генерации DSL:', error);
            return this.createFallbackDSL(conversationHistory);
        }
    }

    // Функция для валидации языка DSL
    private validateDSLLanguage(dsl: any, expectedLang: SupportedLanguage): boolean {
        if (!dsl.pages || !Array.isArray(dsl.pages)) {
            return false;
        }

        // Собираем весь текст из DSL
        let allText = '';

        for (const page of dsl.pages) {
            if (page.elements) {
                for (const element of page.elements) {
                    if (element.type === 'text' && element.content) {
                        allText += element.content + ' ';
                    }
                    if (element.type === 'chart' && element.content) {
                        if (element.content.title) {
                            allText += element.content.title + ' ';
                        }
                        if (element.content.data?.labels) {
                            allText += element.content.data.labels.join(' ') + ' ';
                        }
                    }
                }
            }
        }

        // Определяем язык контента
        const detectedLang = detectLanguage(allText);

        console.log(`🔍 Валидация языка DSL: ожидается ${expectedLang}, обнаружен ${detectedLang}`);

        return detectedLang === expectedLang;
    }

    // Запрос фидбека и улучшений
    async requestFeedback(currentDSL: any, userFeedback: string): Promise<DSLGenerationResult> {
        try {
            console.log('🔄 Обрабатываем фидбек через бэк-энд...');

            const response = await fetch(`${this.baseUrl}/api/claude/feedback`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    currentDSL,
                    userFeedback
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                throw new Error(`Backend Error: ${response.status} - ${errorData?.error || response.statusText}`);
            }

            const result = await response.json();
            console.log('✅ Фидбек обработан через бэк-енд:', result);

            return result;
        } catch (error) {
            console.error('❌ Ошибка обработки фидбека:', error);

            // Возвращаем текущую структуру если что-то пошло не так
            return {
                dsl: currentDSL,
                explanation: 'Не удалось обработать фидбек, структура осталась прежней',
                suggestions: ['Попробуйте переформулировать запрос']
            };
        }
    }

    // Создание резервной DSL структуры (если бэк-энд недоступен)
    private createFallbackDSL(conversationHistory: ChatMessage[]): DSLGenerationResult {
        const lastUserMessage = conversationHistory
            .filter(msg => msg.role === 'user')
            .pop()?.content || 'Базовый отчёт';

        const language = detectLanguage(lastUserMessage);
        const reportType = this.detectReportType(lastUserMessage);
        const isRTL = language === 'ar';

        console.log(`🔧 Создаём fallback DSL: язык=${language}, тип=${reportType}`);

        return {
            dsl: {
                template: 'default',
                defaultDirection: isRTL ? 'rtl' : 'ltr',
                defaultFont: 'DejaVuSans',
                pages: [{
                    elements: [
                        {
                            type: 'text',
                            content: getReportTitle(reportType, language),
                            position: { x: 50, y: 100 },
                            style: {
                                font: 'DejaVuSans',
                                fontSize: 24,
                                color: '#2C3E50',
                                width: 495,
                                align: 'center',
                                direction: isRTL ? 'rtl' : 'ltr'
                            }
                        },
                        {
                            type: 'text',
                            content: this.generateContent(reportType, language),
                            position: { x: 50, y: 170 },
                            style: {
                                font: 'DejaVuSans',
                                fontSize: 12,
                                color: '#34495E',
                                width: 495,
                                lineBreak: true,
                                direction: isRTL ? 'rtl' : 'ltr',
                                align: isRTL ? 'right' : 'left'
                            }
                        },
                        {
                            type: 'text',
                            content: this.generateMainContent(reportType, language),
                            position: { x: 50, y: 220 },
                            style: {
                                font: 'DejaVuSans',
                                fontSize: 11,
                                color: '#2C3E50',
                                width: 495,
                                lineBreak: true,
                                direction: isRTL ? 'rtl' : 'ltr',
                                align: isRTL ? 'right' : 'left'
                            }
                        }
                    ]
                }]
            },
            explanation: language === 'ar' ?
                `تم إنشاء تقرير ${reportType} باللغة العربية` :
                language === 'en' ?
                    `Created ${reportType} report in English` :
                    `Создан ${reportType} отчёт на русском языке`,
            suggestions: language === 'ar' ? [
                'إضافة المزيد من الرسوم البيانية',
                'تضمين أقسام إضافية',
                'تغيير نمط التصميم'
            ] : language === 'en' ? [
                'Add more charts and diagrams',
                'Include additional sections',
                'Change design style'
            ] : [
                'Добавить графики и диаграммы',
                'Включить больше разделов',
                'Изменить стиль оформления'
            ]
        };
    }

    // Генерация основного контента
    private generateMainContent(reportType: string, language: SupportedLanguage): string {
        const contentMap = {
            ar: {
                marketing: `تقرير تحليل التسويق

1. نظرة عامة على الأنشطة التسويقية
   • تحليل الحملات التسويقية الحالية
   • تقييم فعالية قنوات الإعلان
   • بحث الجمهور المستهدف

2. مؤشرات الأداء الرئيسية
   • عائد الاستثمار للأنشطة التسويقية
   • التحويل عبر قنوات الاستحواذ
   • تكلفة اكتساب العملاء

3. التوصيات
   • تحسين ميزانية التسويق
   • التركيز على القنوات الأكثر فعالية
   • تحسين جودة المحتوى`,

                sales: `تقرير المبيعات

1. تحليل المبيعات
   • إجمالي حجم المبيعات للفترة
   • مقارنة مع الفترات السابقة
   • تحليل الموسمية

2. فعالية الفريق
   • أداء المديرين
   • تحويل العملاء المحتملين إلى مبيعات
   • متوسط قيمة المعاملة

3. الخطط والتوقعات
   • أهداف الفترة القادمة
   • استراتيجيات زيادة المبيعات
   • الموارد المطلوبة`,

                financial: `التقرير المالي

1. المؤشرات المالية
   • الإيرادات والأرباح
   • النفقات حسب الفئات
   • التدفقات النقدية

2. تحليل الربحية
   • هوامش المنتجات
   • الكفاءة التشغيلية
   • نقطة التعادل

3. التخطيط المالي
   • الميزانية للفترة القادمة
   • خطط الاستثمار
   • إدارة المخاطر`,

                analytics: `تقرير التحليلات

1. جمع البيانات والتحليل
   • مصادر البيانات
   • منهجية التحليل
   • المقاييس الرئيسية

2. الاتجاهات المحددة
   • الأنماط الرئيسية
   • الارتباطات الإحصائية
   • النماذج التنبؤية

3. الاستنتاجات والتوصيات
   • التوصيات العملية
   • خطة العمل
   • النتائج المتوقعة`,

                general: `التقرير العام

1. المقدمة
   • غرض التقرير
   • المنهجية
   • الأسئلة الرئيسية

2. الجزء الرئيسي
   • تحليل الوضع الحالي
   • المشاكل المحددة
   • فرص التحسين

3. الخلاصة
   • النتائج الرئيسية
   • التوصيات
   • الخطوات التالية`
            },
            en: {
                marketing: `MARKETING ANALYTICS REPORT

1. MARKETING ACTIVITIES OVERVIEW
   • Current marketing campaigns analysis
   • Advertising channels effectiveness evaluation
   • Target audience research

2. KEY PERFORMANCE INDICATORS
   • Marketing activities ROI
   • Conversion by acquisition channels
   • Customer acquisition cost

3. RECOMMENDATIONS
   • Marketing budget optimization
   • Focus on most effective channels
   • Content quality improvement`,

                sales: `SALES REPORT

1. SALES ANALYSIS
   • Total sales volume for the period
   • Comparison with previous periods
   • Seasonality analysis

2. TEAM EFFECTIVENESS
   • Managers performance
   • Lead to sales conversion
   • Average transaction value

3. PLANS AND FORECASTS
   • Goals for the next period
   • Sales growth strategies
   • Required resources`,

                financial: `FINANCIAL REPORT

1. FINANCIAL INDICATORS
   • Revenue and profit
   • Expenses by categories
   • Cash flows

2. PROFITABILITY ANALYSIS
   • Product margins
   • Operational efficiency
   • Break-even point

3. FINANCIAL PLANNING
   • Budget for the next period
   • Investment plans
   • Risk management`,

                analytics: `ANALYTICS REPORT

1. DATA COLLECTION AND ANALYSIS
   • Data sources
   • Analysis methodology
   • Key metrics

2. IDENTIFIED TRENDS
   • Main patterns
   • Statistical correlations
   • Predictive models

3. CONCLUSIONS AND RECOMMENDATIONS
   • Practical recommendations
   • Action plan
   • Expected results`,

                general: `GENERAL REPORT

1. INTRODUCTION
   • Report purpose
   • Methodology
   • Key questions

2. MAIN PART
   • Current situation analysis
   • Identified problems
   • Improvement opportunities

3. CONCLUSION
   • Main findings
   • Recommendations
   • Next steps`
            },
            ru: {
                marketing: `АНАЛИТИЧЕСКИЙ ОТЧЁТ ПО МАРКЕТИНГУ

1. ОБЗОР МАРКЕТИНГОВОЙ ДЕЯТЕЛЬНОСТИ
   • Анализ текущих маркетинговых кампаний
   • Оценка эффективности рекламных каналов
   • Исследование целевой аудитории

2. КЛЮЧЕВЫЕ ПОКАЗАТЕЛИ
   • ROI маркетинговых активностей
   • Конверсия по каналам привлечения
   • Стоимость привлечения клиента

3. РЕКОМЕНДАЦИИ
   • Оптимизация рекламного бюджета
   • Фокус на наиболее эффективные каналы
   • Улучшение качества контента`,

                sales: `ОТЧЁТ ПО ПРОДАЖАМ

1. АНАЛИЗ ПРОДАЖ
   • Общий объём продаж за период
   • Сравнение с предыдущими периодами
   • Анализ сезонности

2. ЭФФЕКТИВНОСТЬ КОМАНДЫ
   • Производительность менеджеров
   • Конверсия лидов в продажи
   • Средний чек

3. ПЛАНЫ И ПРОГНОЗЫ
   • Цели на следующий период
   • Стратегии увеличения продаж
   • Необходимые ресурсы`,

                financial: `ФИНАНСОВЫЙ ОТЧЁТ

1. ФИНАНСОВЫЕ ПОКАЗАТЕЛИ
   • Выручка и прибыль
   • Расходы по категориям
   • Денежные потоки

2. АНАЛИЗ РЕНТАБЕЛЬНОСТИ
   • Маржинальность продуктов
   • Операционная эффективность
   • Точка безубыточности

3. ФИНАНСОВОЕ ПЛАНИРОВАНИЕ
   • Бюджет на следующий период
   • Инвестиционные планы
   • Управление рисками`,

                analytics: `АНАЛИТИЧЕСКИЙ ОТЧЁТ

1. СБОР И АНАЛИЗ ДАННЫХ
   • Источники данных
   • Методология анализа
   • Ключевые метрики

2. ВЫЯВЛЕННЫЕ ТРЕНДЫ
   • Основные закономерности
   • Статистические корреляции
   • Прогнозные модели

3. ВЫВОДЫ И РЕКОМЕНДАЦИИ
   • Практические рекомендации
   • План действий
   • Ожидаемые результаты`,

                general: `ОБЩИЙ ОТЧЁТ

1. ВВЕДЕНИЕ
   • Цель отчёта
   • Методология
   • Основные вопросы

2. ОСНОВНАЯ ЧАСТЬ
   • Анализ текущей ситуации
   • Выявленные проблемы
   • Возможности для улучшения

3. ЗАКЛЮЧЕНИЕ
   • Основные выводы
   • Рекомендации
   • Дальнейшие шаги`
            }
        };

        const cleanReportType = reportType.replace(/-en$|-ar$/, '') as keyof typeof contentMap.ru;
        return contentMap[language]?.[cleanReportType] || contentMap[language]?.general || contentMap.ru.general;
    }

    // Утилитарные методы
    private detectReportType(text: string): string {
        const lower = text.toLowerCase();
        if (lower.includes('маркетинг') || lower.includes('marketing')) return 'marketing';
        if (lower.includes('продаж') || lower.includes('sales')) return 'sales';
        if (lower.includes('финанс') || lower.includes('financial')) return 'financial';
        if (lower.includes('аналитик') || lower.includes('analytics')) return 'analytics';
        return 'general';
    }

    private generateContent(reportType: string, language: SupportedLanguage): string {
        const content = {
            ru: {
                marketing: 'Маркетинговый отчёт с анализом кампаний и ROI',
                sales: 'Отчёт по продажам с динамикой и прогнозами',
                financial: 'Финансовый отчёт с показателями эффективности',
                analytics: 'Аналитический отчёт с трендами и инсайтами',
                general: 'Общий отчёт с ключевыми показателями'
            },
            en: {
                marketing: 'Marketing report with campaign analysis and ROI',
                sales: 'Sales report with dynamics and forecasts',
                financial: 'Financial report with performance metrics',
                analytics: 'Analytics report with trends and insights',
                general: 'General report with key indicators'
            },
            ar: {
                marketing: 'تقرير تسويقي مع تحليل الحملات والعائد على الاستثمار',
                sales: 'تقرير المبيعات مع الديناميكيات والتوقعات',
                financial: 'تقرير مالي مع مقاييس الأداء',
                analytics: 'تقرير تحليلي مع الاتجاهات والرؤى',
                general: 'تقرير عام مع المؤشرات الرئيسية'
            }
        };

        return content[language]?.[reportType as keyof typeof content.ru] ||
            content.ru.general;
    }
}

export const claudeApiService = new ClaudeApiService();