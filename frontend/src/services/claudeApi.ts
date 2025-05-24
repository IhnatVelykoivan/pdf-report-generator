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
    private baseUrl: string;

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
            console.log('📝 Генерируем DSL через бэк-энд...');

            const response = await fetch(`${this.baseUrl}/api/claude/generate-dsl`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    conversationHistory
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                throw new Error(`Backend Error: ${response.status} - ${errorData?.error || response.statusText}`);
            }

            const result = await response.json();
            console.log('✅ DSL создан через бэк-енд:', result);

            return result;
        } catch (error) {
            console.error('❌ Ошибка генерации DSL:', error);
            return this.createFallbackDSL(conversationHistory);
        }
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

        const language = this.detectLanguage(lastUserMessage);
        const reportType = this.detectReportType(lastUserMessage);

        return {
            dsl: {
                template: 'default',
                defaultDirection: language === 'arabic' ? 'rtl' : 'ltr',
                pages: [{
                    elements: [
                        {
                            type: 'text',
                            content: this.extractTitle(lastUserMessage),
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
                            content: this.generateContent(reportType, language),
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
            explanation: `Создан ${reportType} отчёт на ${language === 'russian' ? 'русском' : language === 'english' ? 'английском' : 'арабском'} языке (резервная версия)`,
            suggestions: [
                'Добавить графики и диаграммы',
                'Включить больше разделов',
                'Изменить стиль оформления'
            ]
        };
    }

    // Утилитарные методы
    private detectLanguage(text: string): 'russian' | 'english' | 'arabic' {
        if (/[\u0600-\u06FF]/.test(text)) return 'arabic';
        if (/[а-яё]/i.test(text)) return 'russian';
        return 'english';
    }

    private detectReportType(text: string): string {
        const lower = text.toLowerCase();
        if (lower.includes('маркетинг') || lower.includes('marketing')) return 'marketing';
        if (lower.includes('продаж') || lower.includes('sales')) return 'sales';
        if (lower.includes('финанс') || lower.includes('financial')) return 'financial';
        if (lower.includes('аналитик') || lower.includes('analytics')) return 'analytics';
        return 'general';
    }

    private extractTitle(text: string): string {
        const words = text.split(' ').slice(0, 6);
        return words.join(' ') + (text.split(' ').length > 6 ? '...' : '');
    }

    private generateContent(reportType: string, language: string): string {
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
}

export const claudeApiService = new ClaudeApiService();