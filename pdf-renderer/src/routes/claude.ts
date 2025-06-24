import express from 'express';
import axios from 'axios';

const router = express.Router();

// Интерфейсы для типизации
interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

interface ClaudeRequest {
    messages: ChatMessage[];
    systemPrompt?: string;
    maxTokens?: number;
}

interface DSLGenerationRequest {
    conversationHistory: ChatMessage[];
    expectedLanguage?: 'russian' | 'english' | 'arabic';
}

interface FeedbackRequest {
    currentDSL: any;
    userFeedback: string;
}

// Интерфейс ответа Claude API
interface ClaudeResponse {
    content: Array<{
        text: string;
        type: string;
    }>;
    id: string;
    model: string;
    role: string;
    stop_reason: string;
    stop_sequence: null;
    type: string;
    usage: {
        input_tokens: number;
        output_tokens: number;
    };
}

// Конфигурация Claude API
const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';
const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;

if (!CLAUDE_API_KEY) {
    console.warn('⚠️ CLAUDE_API_KEY не найден в переменных окружения');
}

// Базовый запрос к Claude API
async function callClaudeAPI(messages: ChatMessage[], systemPrompt: string, maxTokens = 4000): Promise<string> {
    try {
        console.log('🤖 Отправляем запрос в Claude API...');

        const response = await axios.post<ClaudeResponse>(CLAUDE_API_URL, {
            model: 'claude-3-sonnet-20240229',
            max_tokens: maxTokens,
            messages: messages,
            system: systemPrompt
        }, {
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': CLAUDE_API_KEY,
                'anthropic-version': '2023-06-01'
            }
        });

        console.log('✅ Получен ответ от Claude');
        return response.data.content[0].text;
    } catch (error: any) {
        console.error('❌ Ошибка Claude API:', error);

        if (error.response) {
            const statusCode = error.response.status || 500;
            const errorMessage = error.response.data?.error?.message || error.message || 'Unknown error';
            throw new Error(`Claude API Error: ${statusCode} - ${errorMessage}`);
        } else if (error.request) {
            throw new Error(`Network Error: ${error.message || 'No response from server'}`);
        } else {
            throw new Error(`Request Error: ${error.message || 'Unknown error'}`);
        }
    }
}

// Эндпоинт для отправки сообщений
router.post('/chat', async (req, res) => {
    try {
        const { messages, systemPrompt }: ClaudeRequest = req.body;

        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({ error: 'Необходим массив сообщений' });
        }

        const defaultSystemPrompt = `Ты - эксперт по созданию PDF отчётов. Твоя задача:

1. Анализировать запросы пользователей на создание отчётов
2. Задавать уточняющие вопросы для лучшего понимания требований  
3. Предлагать структуру и содержание отчёта
4. Быть дружелюбным и профессиональным

ВАЖНО: Отвечай на том языке, на котором пишет пользователь:
- Если пользователь пишет на арабском - отвечай на арабском
- Если на английском - отвечай на английском
- Если на русском - отвечай на русском

Используй эмодзи для лучшего восприятия.

Если пользователь просит создать отчёт, обязательно уточни:
- Тип отчёта (маркетинг, продажи, финансы, аналитика)
- Период отчёта
- Целевую аудиторию
- Ключевые метрики или данные
- Язык отчёта

Предлагай конкретные варианты и будь готов создать DSL структуру для PDF генератора.`;

        const response = await callClaudeAPI(
            messages,
            systemPrompt || defaultSystemPrompt
        );

        res.json({ response });
    } catch (error: any) {
        console.error('❌ Ошибка в /chat:', error);
        res.status(500).json({
            error: error.message || 'Внутренняя ошибка сервера'
        });
    }
});

// Эндпоинт для генерации DSL
router.post('/generate-dsl', async (req, res) => {
    try {
        const { conversationHistory, expectedLanguage }: DSLGenerationRequest = req.body;

        if (!conversationHistory || !Array.isArray(conversationHistory)) {
            return res.status(400).json({ error: 'Необходима история разговора' });
        }

        // Определяем язык из последнего сообщения пользователя или используем переданный
        const lastUserMessage = conversationHistory
            .filter(msg => msg.role === 'user')
            .pop()?.content || '';

        const detectedLang = expectedLanguage || detectLanguage(lastUserMessage);

        // Создаем языко-специфичные инструкции
        const languageInstruction = detectedLang === 'arabic' ?
            '\n\n🚨 КРИТИЧЕСКИ ВАЖНО: Пользователь написал на арабском или выбрал арабский отчет. ВСЕ тексты в DSL (заголовки, описания, контент, подписи графиков, заключение) должны быть ТОЛЬКО на арабском языке! НЕ используй русский язык для заголовков!' :
            detectedLang === 'english' ?
                '\n\n🚨 CRITICAL: User wrote in English or selected English report. ALL texts in DSL (titles, descriptions, content, chart labels, conclusion) must be ONLY in English! DO NOT use Russian for titles!' :
                '\n\n🚨 КРИТИЧЕСКИ ВАЖНО: Пользователь написал на русском. ВСЕ тексты в DSL должны быть ТОЛЬКО на русском языке!';

        const systemPrompt = `Ты - эксперт по созданию DSL (Domain Specific Language) структур для PDF генератора.

На основе разговора с пользователем создай JSON структуру для генерации PDF отчёта.

${languageInstruction}

ПРАВИЛА ГЕНЕРАЦИИ ЗАГОЛОВКОВ:
1. НЕ используй "ИИ Отчёт" как заголовок!
2. Используй правильный заголовок на нужном языке:
   - Для маркетингового отчета:
     * Арабский: "تقرير التسويق"
     * Английский: "Marketing Report"
     * Русский: "Маркетинговый отчёт"
   - Для отчета по продажам:
     * Арабский: "تقرير المبيعات"
     * Английский: "Sales Report"
     * Русский: "Отчёт по продажам"
   - Для финансового отчета:
     * Арабский: "التقرير المالي"
     * Английский: "Financial Report"
     * Русский: "Финансовый отчёт"
   - Для аналитического отчета:
     * Арабский: "تقرير التحليلات"
     * Английский: "Analytics Report"
     * Русский: "Аналитический отчёт"
   - Для общего отчета:
     * Арабский: "التقرير العام"
     * Английский: "General Report"
     * Русский: "Общий отчёт"

ВАЖНО: Используй следующие правила для шрифтов и направления текста:
- Для арабского текста: font: "DejaVuSans", direction: "rtl", align: "right"
- Для английского/русского: font: "DejaVuSans", direction: "ltr"
- Для графиков с арабским: rtl: true, textDirection: "rtl", font: {family: "DejaVuSans"}

Структура DSL должна включать:
- template: тип шаблона
- defaultDirection: направление text (ltr/rtl) 
- defaultFont: "DejaVuSans"
- pages: массив страниц с элементами

ПРОВЕРКА ПЕРЕД ОТПРАВКОЙ:
✅ Заголовок отчета НЕ "ИИ Отчёт", а правильный перевод
✅ Все тексты на одном языке (заданном пользователем)
✅ Правильные настройки шрифта и направления

Ответь ТОЛЬКО в формате JSON:
{
    "dsl": { DSL структура },
    "explanation": "Объяснение структуры отчёта на языке пользователя",
    "suggestions": ["предложение 1", "предложение 2", "предложение 3"]
}`;

        const conversationText = conversationHistory
            .map(msg => `${msg.role}: ${msg.content}`)
            .join('\n\n');

        const prompt = `Анализируй этот разговор и создай DSL структуру:

${conversationText}

${languageInstruction}

Создай подробную DSL структуру для PDF отчёта. НЕ используй "ИИ Отчёт" как заголовок!`;

        const response = await callClaudeAPI([
            { role: 'user', content: prompt }
        ], systemPrompt);

        // Пытаемся извлечь JSON из ответа
        try {
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const result = JSON.parse(jsonMatch[0]);
                res.json(result);
            } else {
                // Создаём fallback DSL
                res.json(createFallbackDSL(conversationHistory));
            }
        } catch (parseError) {
            console.warn('⚠️ Не удалось распарсить JSON, используем fallback');
            res.json(createFallbackDSL(conversationHistory));
        }

    } catch (error: any) {
        console.error('❌ Ошибка в /generate-dsl:', error);
        res.status(500).json({
            error: error.message || 'Внутренняя ошибка сервера'
        });
    }
});

// Эндпоинт для обработки фидбека
router.post('/feedback', async (req, res) => {
    try {
        const { currentDSL, userFeedback }: FeedbackRequest = req.body;

        if (!currentDSL || !userFeedback) {
            return res.status(400).json({ error: 'Необходимы currentDSL и userFeedback' });
        }

        const systemPrompt = `Ты - эксперт по улучшению PDF отчётов на основе фидбека пользователей.

Получи текущую DSL структуру и фидбек пользователя, затем предложи улучшения.

ВАЖНО: Соблюдай правила для шрифтов:
- Для арабского текста: font: "DejaVuSans", direction: "rtl", align: "right"
- Для графиков с арабским: rtl: true, textDirection: "rtl", font: {family: "DejaVuSans"}

КРИТИЧЕСКИ ВАЖНО: Сохраняй язык оригинального отчета! Не меняй язык контента.

Ответь ТОЛЬКО в JSON формате:
{
    "dsl": { обновлённая DSL структура },
    "explanation": "Объяснение внесённых изменений на языке отчета",
    "suggestions": ["дополнительное предложение 1", "предложение 2"]
}`;

        const prompt = `Текущая DSL структура:
${JSON.stringify(currentDSL, null, 2)}

Фидбек пользователя:
${userFeedback}

Улучши DSL структуру согласно фидбеку, сохраняя оригинальный язык отчета.`;

        const response = await callClaudeAPI([
            { role: 'user', content: prompt }
        ], systemPrompt);

        try {
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const result = JSON.parse(jsonMatch[0]);
                res.json(result);
            } else {
                res.json({
                    dsl: currentDSL,
                    explanation: 'Не удалось обработать фидбек, структура осталась прежней',
                    suggestions: ['Попробуйте переформулировать запрос']
                });
            }
        } catch (parseError) {
            res.json({
                dsl: currentDSL,
                explanation: 'Не удалось обработать фидбек, структура осталась прежней',
                suggestions: ['Попробуйте переформулировать запрос']
            });
        }

    } catch (error: any) {
        console.error('❌ Ошибка в /feedback:', error);
        res.status(500).json({
            error: error.message || 'Внутренняя ошибка сервера'
        });
    }
});

// Функция для получения локализованного типа отчёта
function getLocalizedReportType(reportType: string, language: string): string {
    const translations: Record<string, Record<string, string>> = {
        arabic: {
            marketing: 'تقرير تسويقي',
            sales: 'تقرير المبيعات',
            financial: 'تقرير مالي',
            analytics: 'تقرير تحليلي',
            general: 'تقرير عام',
            'ai-generated': 'تقرير ذكاء اصطناعي'
        },
        english: {
            marketing: 'marketing report',
            sales: 'sales report',
            financial: 'financial report',
            analytics: 'analytics report',
            general: 'general report',
            'ai-generated': 'AI-generated report'
        },
        russian: {
            marketing: 'маркетинговый отчёт',
            sales: 'отчёт по продажам',
            financial: 'финансовый отчёт',
            analytics: 'аналитический отчёт',
            general: 'общий отчёт',
            'ai-generated': 'ИИ-сгенерированный отчёт'
        }
    };

    const langTranslations = translations[language] || translations.russian;
    return langTranslations[reportType] || langTranslations.general || reportType;
}

// Улучшенная функция для создания fallback DSL
function createFallbackDSL(conversationHistory: ChatMessage[]) {
    const lastUserMessage = conversationHistory
        .filter(msg => msg.role === 'user')
        .pop()?.content || 'Базовый отчёт';

    const language = detectLanguage(lastUserMessage);
    const reportType = detectReportType(lastUserMessage);
    const isRTL = language === 'arabic';

    console.log(`🔧 Создаём fallback DSL: язык=${language}, тип=${reportType}, RTL=${isRTL}`);

    // ВАЖНО: Используем правильные заголовки для каждого языка
    const title = extractTitle(reportType, language);

    // Получаем локализованный тип отчёта для объяснения
    const localizedReportType = getLocalizedReportType(reportType, language);

    // Получаем описание на правильном языке
    const description = language === 'arabic' ?
        'تقرير احترافي مع تحليل مفصل ورسوم بيانية ورؤى لاتخاذ القرارات التجارية' :
        language === 'english' ?
            'Professional report with detailed analysis, charts, and insights for business decision-making' :
            'Профессиональный отчёт с подробной аналитикой, графиками и инсайтами';

    // Используем функцию generateMainContent для получения основного контента
    const mainContent = generateMainContent(reportType, language);

    // Функция для создания текстового элемента с гарантированными параметрами
    const createTextElement = (text: string, position: {x: number, y: number}, extraStyle: any = {}) => {
        const hasArabic = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/.test(text);
        const elementIsRTL = hasArabic || isRTL;

        return {
            type: 'text',
            content: text,
            position: position,
            style: {
                font: 'DejaVuSans',
                direction: elementIsRTL ? 'rtl' : 'ltr',
                align: elementIsRTL ? 'right' : 'left',
                ...extraStyle,
                ...(hasArabic ? { align: extraStyle.align === 'center' ? 'center' : 'right' } : {})
            }
        };
    };

    // Создаем график с правильными настройками для RTL
    const createChartElement = (position: {x: number, y: number}) => {
        const chart = generateSampleChart(reportType, language);

        // Добавляем RTL настройки для арабских графиков
        if (isRTL) {
            chart.options = {
                ...chart.options,
                rtl: true,
                font: { family: 'DejaVuSans' }
            };
            chart.textDirection = 'rtl';
        }

        return {
            type: 'chart',
            content: chart,
            position: position,
            style: {
                width: 495,
                height: 250,
                backgroundColor: '#FFFFFF',
                borderColor: '#BDC3C7'
            }
        };
    };

    const dsl = {
        template: 'default',
        defaultFont: 'DejaVuSans',
        defaultDirection: isRTL ? 'rtl' : 'ltr',
        pages: [{
            elements: [
                // Заголовок на правильном языке
                createTextElement(title, { x: 50, y: 100 }, {
                    fontSize: 24,
                    color: '#2C3E50',
                    width: 495,
                    align: 'center'
                }),

                // Описание на правильном языке
                createTextElement(description, { x: 50, y: 170 }, {
                    fontSize: 12,
                    color: '#34495E',
                    width: 495,
                    lineBreak: true
                }),

                // Основной контент на правильном языке
                createTextElement(mainContent, { x: 50, y: 220 }, {
                    fontSize: 11,
                    color: '#2C3E50',
                    width: 495,
                    lineBreak: true
                }),

                // График с правильными подписями
                createChartElement({ x: 50, y: 430 }),

                // Заключение на правильном языке
                createTextElement(getConclusion(language), { x: 50, y: 700 }, {
                    fontSize: 11,
                    color: '#7F8C8D',
                    width: 495,
                    lineBreak: true
                })
            ],
            style: {
                size: 'a4',
                margin: { top: 70, bottom: 70, left: 50, right: 50 }
            }
        }]
    };

    // Дополнительная проверка DSL
    const validatedDSL = ensureDSLFontsAndDirection(dsl);

    return {
        dsl: validatedDSL,
        explanation: language === 'arabic' ?
            `تم إنشاء ${localizedReportType} باللغة العربية` :
            language === 'english' ?
                `Created ${localizedReportType} in English` :
                `Создан ${localizedReportType} на русском языке`,
        suggestions: language === 'arabic' ? [
            'إضافة المزيد من الرسوم البيانية والمخططات',
            'تضمين أقسام إضافية',
            'تغيير نمط التصميم',
            'إضافة جداول البيانات'
        ] : language === 'english' ? [
            'Add more charts and diagrams',
            'Include additional sections',
            'Change design style',
            'Add data tables'
        ] : [
            'Добавить больше графиков и диаграмм',
            'Включить дополнительные разделы',
            'Изменить стиль оформления',
            'Добавить таблицы с данными'
        ]
    };
}

// Функция для гарантированной проверки DSL
function ensureDSLFontsAndDirection(dsl: any): any {
    console.log('🔍 Проверяем DSL на корректность шрифтов и направления...');

    if (!dsl.pages || !Array.isArray(dsl.pages)) {
        return dsl;
    }

    for (const page of dsl.pages) {
        if (!page.elements || !Array.isArray(page.elements)) {
            continue;
        }

        for (const element of page.elements) {
            if (element.type === 'text' && element.content) {
                const content = String(element.content);
                const hasArabic = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/.test(content);

                // Гарантируем наличие style
                if (!element.style) {
                    element.style = {};
                }

                // Устанавливаем правильные параметры
                if (hasArabic) {
                    element.style.font = 'DejaVuSans';
                    element.style.direction = 'rtl';

                    // Исправляем выравнивание для арабского текста
                    if (!element.style.align || element.style.align === 'left') {
                        element.style.align = element.style.align === 'center' ? 'center' : 'right';
                    }

                    console.log(`🔧 Проверен арабский элемент: "${content.substring(0, 30)}..." -> font=DejaVuSans, direction=rtl, align=${element.style.align}`);
                } else {
                    // Для не-арабского текста
                    if (!element.style.font) {
                        element.style.font = 'DejaVuSans';
                    }
                    if (!element.style.direction) {
                        element.style.direction = 'ltr';
                    }

                    console.log(`✅ Проверен элемент: "${content.substring(0, 30)}..." -> font=${element.style.font}, direction=${element.style.direction}`);
                }
            }

            // Проверяем графики
            if (element.type === 'chart' && element.content) {
                const chart = element.content;

                // Проверяем заголовок графика
                if (chart.title) {
                    const hasArabic = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/.test(chart.title);

                    if (!chart.options) {
                        chart.options = {};
                    }

                    if (hasArabic) {
                        chart.options.rtl = true;
                        chart.options.font = { family: 'DejaVuSans' };
                        chart.textDirection = 'rtl';
                        console.log(`🔧 Проверен заголовок графика: "${chart.title}" -> rtl=true, font=DejaVuSans, textDirection=rtl`);
                    }
                }

                // Проверяем подписи данных
                if (chart.data && chart.data.labels) {
                    const hasArabicLabels = chart.data.labels.some((label: string) =>
                        /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/.test(label)
                    );

                    if (hasArabicLabels) {
                        if (!chart.options) {
                            chart.options = {};
                        }
                        chart.options.rtl = true;
                        chart.options.font = { family: 'DejaVuSans' };
                        chart.textDirection = 'rtl';
                        console.log(`🔧 Проверены подписи графика с арабским текстом -> rtl=true, font=DejaVuSans, textDirection=rtl`);
                    }
                }
            }
        }
    }

    console.log('✅ Проверка DSL завершена');
    return dsl;
}

// Функция generateMainContent
function generateMainContent(reportType: string, language: 'russian' | 'english' | 'arabic'): string {
    const contentMap: Record<string, Record<string, string>> = {
        arabic: {
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
        english: {
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
        russian: {
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

    const cleanReportType = reportType.replace(/-en$|-ar$/, '');
    const langContent = contentMap[language] || contentMap.russian;
    return langContent[cleanReportType] || langContent.general || '';
}

// Утилитарные функции
function detectLanguage(text: string): 'russian' | 'english' | 'arabic' {
    if (/[\u0600-\u06FF]/.test(text)) return 'arabic';
    if (/[а-яё]/i.test(text)) return 'russian';
    return 'english';
}

function detectReportType(text: string): string {
    const lower = text.toLowerCase();
    if (lower.includes('маркетинг') || lower.includes('marketing') || lower.includes('تسويق')) return 'marketing';
    if (lower.includes('продаж') || lower.includes('sales') || lower.includes('مبيعات')) return 'sales';
    if (lower.includes('финанс') || lower.includes('financial') || lower.includes('مالي')) return 'financial';
    if (lower.includes('аналитик') || lower.includes('analytics') || lower.includes('تحليل')) return 'analytics';
    return 'general';
}

// Улучшенная функция extractTitle - НЕ возвращает "ИИ Отчёт"
function extractTitle(reportType: string, language: string): string {
    // Возвращаем заголовок на правильном языке
    const titles: Record<string, Record<string, string>> = {
        arabic: {
            marketing: 'تقرير التسويق',
            sales: 'تقرير المبيعات',
            financial: 'التقرير المالي',
            analytics: 'تقرير التحليلات',
            general: 'التقرير العام'
        },
        english: {
            marketing: 'Marketing Report',
            sales: 'Sales Report',
            financial: 'Financial Report',
            analytics: 'Analytics Report',
            general: 'General Report'
        },
        russian: {
            marketing: 'Маркетинговый отчёт',
            sales: 'Отчёт по продажам',
            financial: 'Финансовый отчёт',
            analytics: 'Аналитический отчёт',
            general: 'Общий отчёт'
        }
    };

    const langTitles = titles[language] || titles.russian;
    return langTitles[reportType] || langTitles.general;
}

function generateContent(reportType: string, language: string): string {
    const content: Record<string, Record<string, string>> = {
        russian: {
            marketing: 'Маркетинговый отчёт с анализом кампаний и ROI',
            sales: 'Отчёт по продажам с динамикой и прогнозами',
            financial: 'Финансовый отчёт с показателями эффективности',
            analytics: 'Аналитический отчёт с трендами и инсайтами',
            general: 'Общий отчёт с ключевыми показателями'
        },
        english: {
            marketing: 'Marketing report with campaign analysis and ROI',
            sales: 'Sales report with dynamics and forecasts',
            financial: 'Financial report with performance metrics',
            analytics: 'Analytics report with trends and insights',
            general: 'General report with key indicators'
        },
        arabic: {
            marketing: 'تقرير تسويقي مع تحليل الحملات والعائد على الاستثمار',
            sales: 'تقرير المبيعات مع الديناميكيات والتوقعات',
            financial: 'تقرير مالي مع مقاييس الأداء',
            analytics: 'تقرير تحليلي مع الاتجاهات والرؤى',
            general: 'تقرير عام مع المؤشرات الرئيسية'
        }
    };

    const langContent = content[language] || content.russian;
    return langContent[reportType] || langContent.general;
}

function generateSampleChart(reportType: string, language: string): any {
    const isRTL = language === 'arabic';

    const chart = {
        type: 'line',
        title: language === 'arabic' ? 'ديناميكية المبيعات' :
            language === 'english' ? 'Sales Dynamics' :
                'Динамика продаж',
        data: {
            labels: language === 'arabic' ? ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو'] :
                language === 'english' ? ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'] :
                    ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн'],
            datasets: [{
                label: language === 'arabic' ? 'المبيعات (ألف روبل)' :
                    language === 'english' ? 'Sales (k RUB)' :
                        'Продажи (тыс. руб.)',
                data: [100, 120, 140, 110, 160, 180],
                backgroundColor: 'rgba(52, 152, 219, 0.2)',
                borderColor: '#3498DB',
                borderWidth: 2
            }]
        },
        options: {
            responsive: false,
            animation: false
        }
    };

    return chart;
}

// Функция для получения заключения на нужном языке
function getConclusion(language: string): string {
    const conclusions: Record<string, string> = {
        russian: 'Заключение:\n\nДанный отчёт был автоматически сгенерирован на основе ваших требований. Для получения более детальной информации обратитесь к специалистам.',
        english: 'Conclusion:\n\nThis report was automatically generated based on your requirements. For more detailed information, please contact our specialists.',
        arabic: 'الخلاصة:\n\nتم إنشاء هذا التقرير تلقائيًا بناءً على متطلباتكم. للحصول على معلومات أكثر تفصيلاً، يرجى الاتصال بالمختصين.'
    };

    return conclusions[language] || conclusions.russian;
}

export default router;