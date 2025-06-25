// pdf-renderer/src/engine/dsl/dslPipeline.ts

import { dslGenerator, type ChatMessage, type DSLGenerationResult } from './dslGenerator';
import { validateDSL } from '../../validation/dslValidator';
import { autoFixDSL } from '../../middleware/dslAutoFixer';
import { detectLanguage, type SupportedLanguage } from '../../utils/languageUtils';
import axios from 'axios';

export interface PipelineResult {
    success: boolean;
    dsl?: any;
    pdfBuffer?: Buffer;
    error?: string;
    retryCount?: number;
}

export interface PipelineOptions {
    maxRetries?: number;
    claudeApiUrl?: string;
}

export class DSLPipeline {
    private maxRetries: number = 3;
    private claudeApiUrl: string;

    constructor(options: PipelineOptions = {}) {
        this.maxRetries = options.maxRetries || 3;
        this.claudeApiUrl = options.claudeApiUrl || 'http://localhost:3001/api/claude';
    }

    /**
     * Полный pipeline генерации DSL и PDF
     */
    public async generateFromConversation(
        conversationHistory: ChatMessage[],
        userMessage?: string
    ): Promise<PipelineResult> {
        try {
            // 1. Определяем ожидаемый язык
            const lastMessage = userMessage || conversationHistory
                .filter(msg => msg.role === 'user')
                .pop()?.content || '';

            const expectedLanguage = detectLanguage(lastMessage);
            console.log(`🌐 Ожидаемый язык: ${expectedLanguage}`);

            // 2. Генерируем DSL (с возможным обращением к Claude)
            let dslResult: DSLGenerationResult | null = null;
            let retryCount = 0;
            let isValidLanguage = false;

            while (!isValidLanguage && retryCount < this.maxRetries) {
                // Пробуем сгенерировать через Claude
                try {
                    dslResult = await this.generateDSLWithClaude(conversationHistory, expectedLanguage);
                } catch (claudeError) {
                    console.warn('⚠️ Claude недоступен, используем fallback');
                    dslResult = await dslGenerator.generateDSLFromConversation(conversationHistory, expectedLanguage);
                }

                // Валидируем язык
                isValidLanguage = dslGenerator.validateDSLLanguage(dslResult.dsl, expectedLanguage);

                if (!isValidLanguage) {
                    console.warn(`⚠️ DSL сгенерирован не на том языке (попытка ${retryCount + 1}/${this.maxRetries})`);
                    retryCount++;

                    if (retryCount < this.maxRetries) {
                        // Модифицируем запрос для следующей попытки
                        conversationHistory = [
                            ...conversationHistory,
                            {
                                role: 'user',
                                content: this.getLanguageEnforcementPrompt(expectedLanguage)
                            }
                        ];
                    }
                } else {
                    console.log('✅ DSL сгенерирован на правильном языке');
                }
            }

            if (!dslResult || !isValidLanguage) {
                // Используем fallback после всех попыток
                console.warn('❌ Не удалось сгенерировать DSL на нужном языке, используем fallback');
                dslResult = await dslGenerator.generateDSLFromConversation(conversationHistory, expectedLanguage);
            }

            // 3. Применяем автоисправления
            const fixedDSL = autoFixDSL(dslResult.dsl);

            // 4. Валидируем DSL
            const validationResult = validateDSL(fixedDSL);
            if (!validationResult.valid) {
                return {
                    success: false,
                    error: `Ошибка валидации DSL: ${validationResult.errors?.join(', ')}`
                };
            }

            // 5. Возвращаем результат
            return {
                success: true,
                dsl: fixedDSL,
                retryCount
            };

        } catch (error) {
            console.error('❌ Ошибка в DSL pipeline:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Неизвестная ошибка'
            };
        }
    }

    /**
     * Генерация DSL через Claude API
     */
    private async generateDSLWithClaude(
        conversationHistory: ChatMessage[],
        expectedLanguage: SupportedLanguage
    ): Promise<DSLGenerationResult> {
        const response = await axios.post<DSLGenerationResult>(`${this.claudeApiUrl}/generate-dsl`, {
            conversationHistory,
            expectedLanguage
        });

        return response.data;
    }

    /**
     * Промпт для принудительного использования нужного языка
     */
    private getLanguageEnforcementPrompt(language: SupportedLanguage): string {
        const prompts: Record<SupportedLanguage, string> = {
            ru: 'ВАЖНО: Создай отчёт ТОЛЬКО на русском языке. ВСЕ тексты, заголовки и подписи должны быть на русском!',
            en: 'IMPORTANT: Create report ONLY in English. ALL texts, titles and labels must be in English!',
            ar: 'مهم: إنشاء التقرير باللغة العربية فقط. يجب أن تكون جميع النصوص والعناوين باللغة العربية!'
        };

        return prompts[language];
    }

    /**
     * Обработка фидбека пользователя
     */
    public async processFeedback(
        currentDSL: any,
        userFeedback: string
    ): Promise<DSLGenerationResult> {
        try {
            // Пробуем обработать через Claude
            const response = await axios.post<DSLGenerationResult>(`${this.claudeApiUrl}/feedback`, {
                currentDSL,
                userFeedback
            });

            const result: DSLGenerationResult = response.data;

            // Применяем автоисправления
            result.dsl = autoFixDSL(result.dsl);

            return result;

        } catch (error) {
            console.error('❌ Ошибка обработки фидбека:', error);

            // Возвращаем текущий DSL если что-то пошло не так
            return {
                dsl: currentDSL,
                explanation: 'Не удалось обработать фидбек',
                suggestions: ['Попробуйте переформулировать запрос']
            };
        }
    }
}

export const dslPipeline = new DSLPipeline();