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
            // Axios error with response
            const statusCode = error.response.status || 500;
            const errorMessage = error.response.data?.error?.message || error.message || 'Unknown error';
            throw new Error(`Claude API Error: ${statusCode} - ${errorMessage}`);
        } else if (error.request) {
            // Axios error without response
            throw new Error(`Network Error: ${error.message || 'No response from server'}`);
        } else {
            // Other error
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

Отвечай на русском языке. Используй эмодзи для лучшего восприятия.

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
        const { conversationHistory }: DSLGenerationRequest = req.body;

        if (!conversationHistory || !Array.isArray(conversationHistory)) {
            return res.status(400).json({ error: 'Необходима история разговора' });
        }

        const systemPrompt = `Ты - эксперт по созданию DSL (Domain Specific Language) структур для PDF генератора.

На основе разговора с пользователем создай JSON структуру для генерации PDF отчёта.

Структура DSL должна включать:
- template: тип шаблона
- defaultDirection: направление text (ltr/rtl)
- pages: массив страниц с элементами

Каждый элемент страницы может быть:
- text: текстовый блок
- chart: график или диаграмма  
- table: таблица
- image: изображение

Обязательно учитывай:
1. Язык текста (русский/английский/арабский)
2. Тип отчёта (маркетинг/продажи/финансы)
3. Требования пользователя

Ответь ТОЛЬКО в формате JSON:
{
    "dsl": { DSL структура },
    "explanation": "Объяснение структуры отчёта",
    "suggestions": ["предложение 1", "предложение 2"]
}`;

        const conversationText = conversationHistory
            .map(msg => `${msg.role}: ${msg.content}`)
            .join('\n\n');

        const prompt = `Анализируй этот разговор и создай DSL структуру:

${conversationText}

Создай подробную DSL структуру для PDF отчёта.`;

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

Ответь ТОЛЬКО в JSON формате:
{
    "dsl": { обновлённая DSL структура },
    "explanation": "Объяснение внесённых изменений",
    "suggestions": ["дополнительное предложение 1", "предложение 2"]
}`;

        const prompt = `Текущая DSL структура:
${JSON.stringify(currentDSL, null, 2)}

Фидбек пользователя:
${userFeedback}

Улучши DSL структуру согласно фидбеку.`;

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

// Утилитарная функция для создания fallback DSL
function createFallbackDSL(conversationHistory: ChatMessage[]) {
    const lastUserMessage = conversationHistory
        .filter(msg => msg.role === 'user')
        .pop()?.content || 'Базовый отчёт';

    const language = detectLanguage(lastUserMessage);
    const reportType = detectReportType(lastUserMessage);

    return {
        dsl: {
            template: 'default',
            defaultDirection: language === 'arabic' ? 'rtl' : 'ltr',
            pages: [{
                elements: [
                    {
                        type: 'text',
                        content: extractTitle(lastUserMessage),
                        position: { x: 100, y: 100 },
                        style: {
                            font: language === 'arabic' ? 'NotoSansArabic' : 'DejaVuSans',
                            fontSize: 24,
                            color: '#2C3E50',
                            width: 400,
                            align: 'center'
                        }
                    },
                    {
                        type: 'text',
                        content: generateContent(reportType, language),
                        position: { x: 80, y: 200 },
                        style: {
                            font: language === 'arabic' ? 'NotoSansArabic' : 'DejaVuSans',
                            fontSize: 12,
                            color: '#34495E',
                            width: 450,
                            lineBreak: true
                        }
                    }
                ]
            }]
        },
        explanation: `Создан ${reportType} отчёт на ${language === 'russian' ? 'русском' : language === 'english' ? 'английском' : 'арабском'} языке`,
        suggestions: [
            'Добавить графики и диаграммы',
            'Включить больше разделов',
            'Изменить стиль оформления'
        ]
    };
}

// Утилитарные функции
function detectLanguage(text: string): 'russian' | 'english' | 'arabic' {
    if (/[\u0600-\u06FF]/.test(text)) return 'arabic';
    if (/[а-яё]/i.test(text)) return 'russian';
    return 'english';
}

function detectReportType(text: string): string {
    const lower = text.toLowerCase();
    if (lower.includes('маркетинг') || lower.includes('marketing')) return 'marketing';
    if (lower.includes('продаж') || lower.includes('sales')) return 'sales';
    if (lower.includes('финанс') || lower.includes('financial')) return 'financial';
    if (lower.includes('аналитик') || lower.includes('analytics')) return 'analytics';
    return 'general';
}

function extractTitle(text: string): string {
    const words = text.split(' ').slice(0, 6);
    return words.join(' ') + (text.split(' ').length > 6 ? '...' : '');
}

function generateContent(reportType: string, language: string): string {
    const content = {
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

    return content[language as keyof typeof content]?.[reportType as keyof typeof content.russian] ||
        content.russian.general;
}

export default router;