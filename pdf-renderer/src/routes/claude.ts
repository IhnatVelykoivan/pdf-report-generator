// pdf-renderer/src/routes/claude.ts

import express from 'express';
import axios from 'axios';
import { dslGenerator, type ChatMessage, type DSLGenerationResult } from '../engine/dsl/dslGenerator';
import {
    detectLanguage,
    type SupportedLanguage
} from '../utils/languageUtils';
import { autoFixDSL } from '../middleware/dslAutoFixer';

const router = express.Router();

// Конфигурация Claude API
const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';
const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;

// Проверяем наличие ключа
const isClaudeAvailable = !!CLAUDE_API_KEY;

if (!isClaudeAvailable) {
    console.warn('⚠️ CLAUDE_API_KEY не найден в переменных окружения');
    console.warn('⚠️ Чат с ИИ будет недоступен, но быстрые отчеты будут работать!');
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

// Базовый запрос к Claude API
async function callClaudeAPI(messages: ChatMessage[], systemPrompt: string, maxTokens = 4000): Promise<string> {
    if (!isClaudeAvailable) {
        throw new Error('Claude API недоступен. Установите CLAUDE_API_KEY в файле .env');
    }

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
        console.error('❌ Ошибка Claude API:', error.response?.data || error.message);

        if (error.response?.status === 401) {
            throw new Error('Неверный API ключ Claude. Проверьте CLAUDE_API_KEY в файле .env');
        }

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

// Эндпоинт для чата (остается для общения с пользователем)
router.post('/chat', async (req, res) => {
    try {
        const { messages, systemPrompt }: { messages: ChatMessage[], systemPrompt?: string } = req.body;

        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({ error: 'Необходим массив сообщений' });
        }

        // Проверяем доступность Claude
        if (!isClaudeAvailable) {
            // Возвращаем fallback ответ
            return res.json({
                response: `🤖 К сожалению, ИИ-ассистент временно недоступен.

Но вы можете:
1. Использовать быстрые кнопки для создания отчетов ниже ⬇️
2. Настроить Claude API ключ в файле .env

Для получения API ключа:
1. Зарегистрируйтесь на https://console.anthropic.com
2. Создайте API ключ
3. Добавьте его в файл pdf-renderer/.env:
   CLAUDE_API_KEY=your-key-here`
            });
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

Используй эмодзи для лучшего восприятия.`;

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

// Эндпоинт для генерации DSL (использует новый dslGenerator)
router.post('/generate-dsl', async (req, res) => {
    try {
        const { conversationHistory, expectedLanguage }: {
            conversationHistory: ChatMessage[],
            expectedLanguage?: SupportedLanguage
        } = req.body;

        if (!conversationHistory || !Array.isArray(conversationHistory)) {
            return res.status(400).json({ error: 'Необходима история разговора' });
        }

        // Определяем язык
        const lastUserMessage = conversationHistory
            .filter(msg => msg.role === 'user')
            .pop()?.content || '';

        const detectedLang = expectedLanguage || detectLanguage(lastUserMessage);

        console.log(`🌐 Генерируем DSL для языка: ${detectedLang}`);

        // Пробуем сгенерировать через Claude только если он доступен
        if (isClaudeAvailable) {
            try {
                const dslResult = await generateDSLWithClaude(conversationHistory, detectedLang);

                // Применяем автоисправления
                dslResult.dsl = autoFixDSL(dslResult.dsl);

                res.json(dslResult);
                return;
            } catch (claudeError) {
                console.warn('⚠️ Ошибка генерации через Claude, используем fallback');
            }
        }

        // Используем локальный генератор
        const fallbackResult = await dslGenerator.generateDSLFromConversation(
            conversationHistory,
            detectedLang
        );

        // Применяем автоисправления
        fallbackResult.dsl = autoFixDSL(fallbackResult.dsl);

        res.json(fallbackResult);

    } catch (error: any) {
        console.error('❌ Ошибка в /generate-dsl:', error);
        res.status(500).json({
            error: error.message || 'Внутренняя ошибка сервера'
        });
    }
});

// Эндпоинт для обработки фидбека (использует новые утилиты)
router.post('/feedback', async (req, res) => {
    try {
        const { currentDSL, userFeedback }: { currentDSL: any, userFeedback: string } = req.body;

        if (!currentDSL || !userFeedback) {
            return res.status(400).json({ error: 'Необходимы currentDSL и userFeedback' });
        }

        // Определяем язык из текущего DSL
        let dslLanguage: SupportedLanguage = 'ru';
        if (currentDSL.pages && currentDSL.pages[0]?.elements) {
            const firstTextElement = currentDSL.pages[0].elements
                .find((el: any) => el.type === 'text' && el.content);
            if (firstTextElement) {
                dslLanguage = detectLanguage(firstTextElement.content);
            }
        }

        // Пробуем обработать через Claude только если он доступен
        if (isClaudeAvailable) {
            try {
                const updatedResult = await processFeedbackWithClaude(
                    currentDSL,
                    userFeedback,
                    dslLanguage
                );

                // Применяем автоисправления
                updatedResult.dsl = autoFixDSL(updatedResult.dsl);

                res.json(updatedResult);
                return;
            } catch (claudeError) {
                console.warn('⚠️ Ошибка обработки фидбека через Claude');
            }
        }

        // Возвращаем текущий DSL
        res.json({
            dsl: currentDSL,
            explanation: 'ИИ-ассистент недоступен. Используйте быстрые кнопки для создания отчетов.',
            suggestions: ['Настройте Claude API ключ для полного функционала']
        });

    } catch (error: any) {
        console.error('❌ Ошибка в /feedback:', error);
        res.status(500).json({
            error: error.message || 'Внутренняя ошибка сервера'
        });
    }
});

// Вспомогательная функция для генерации DSL через Claude
async function generateDSLWithClaude(
    conversationHistory: ChatMessage[],
    expectedLanguage: SupportedLanguage
): Promise<DSLGenerationResult> {
    const languageInstruction = getLanguageInstruction(expectedLanguage);

    const systemPrompt = `Ты - эксперт по созданию DSL структур для PDF генератора.

${languageInstruction}

Структура DSL должна включать:
- template: тип шаблона
- defaultDirection: направление text (ltr/rtl) 
- defaultFont: "DejaVuSans"
- pages: массив страниц с элементами

Ответь ТОЛЬКО в формате JSON:
{
    "dsl": { DSL структура },
    "explanation": "Объяснение структуры отчёта на языке пользователя",
    "suggestions": ["предложение 1", "предложение 2", "предложение 3"]
}`;

    const conversationText = conversationHistory
        .map(msg => `${msg.role}: ${msg.content}`)
        .join('\n\n');

    const prompt = `Проанализируй разговор и создай DSL структуру для PDF отчёта:

${conversationText}

${languageInstruction}`;

    const response = await callClaudeAPI([
        { role: 'user', content: prompt }
    ], systemPrompt);

    // Пытаемся извлечь JSON из ответа
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
    }

    // Если не удалось распарсить, используем fallback
    throw new Error('Не удалось распарсить ответ Claude');
}

// Вспомогательная функция для обработки фидбека через Claude
async function processFeedbackWithClaude(
    currentDSL: any,
    userFeedback: string,
    language: SupportedLanguage
): Promise<DSLGenerationResult> {
    const systemPrompt = `Ты - эксперт по улучшению PDF отчётов на основе фидбека.

Получи текущую DSL структуру и фидбек пользователя, затем предложи улучшения.

КРИТИЧЕСКИ ВАЖНО: Сохраняй язык оригинального отчета (${language})!

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

Улучши DSL структуру согласно фидбеку, сохраняя оригинальный язык (${language}).`;

    const response = await callClaudeAPI([
        { role: 'user', content: prompt }
    ], systemPrompt);

    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
    }

    throw new Error('Не удалось обработать фидбек');
}

// Вспомогательная функция для получения языковых инструкций
function getLanguageInstruction(language: SupportedLanguage): string {
    const instructions: Record<SupportedLanguage, string> = {
        ar: 'КРИТИЧЕСКИ ВАЖНО: ВСЕ тексты в DSL должны быть ТОЛЬКО на арабском языке!',
        en: 'CRITICAL: ALL texts in DSL must be ONLY in English!',
        ru: 'КРИТИЧЕСКИ ВАЖНО: ВСЕ тексты в DSL должны быть ТОЛЬКО на русском языке!'
    };

    return instructions[language];
}

export default router;