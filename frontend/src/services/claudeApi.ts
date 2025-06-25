// frontend/src/services/claudeApi.ts
// Оставляем только функциональность чата

export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

class ClaudeChatService {
    private readonly baseUrl: string;

    constructor() {
        this.baseUrl = import.meta.env.VITE_PDF_API_URL || 'http://localhost:3001';
        console.log('🔗 Claude Chat API через бэк-энд:', this.baseUrl);
    }

    /**
     * Отправка сообщения в чат с Claude
     * Используется только для общения с пользователем, не для генерации DSL
     */
    async sendMessage(messages: ChatMessage[], systemPrompt?: string): Promise<string> {
        try {
            console.log('🚀 Отправляем сообщение в чат...');

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
            console.log('✅ Получен ответ от Claude');

            return data.response;
        } catch (error) {
            console.error('❌ Ошибка Claude Chat API:', error);
            throw error;
        }
    }

    /**
     * Анализ требований пользователя для чата
     * Возвращает только текстовый ответ для отображения в чате
     */
    async analyzeUserRequest(userMessage: string, conversationHistory: ChatMessage[] = []): Promise<string> {
        const messages: ChatMessage[] = [
            ...conversationHistory,
            { role: 'user', content: userMessage }
        ];

        return await this.sendMessage(messages);
    }
}

// Экспортируем только сервис для чата
export const claudeChatService = new ClaudeChatService();

// Старые экспорты удалены:
// - DSLGenerationResult
// - ClaudeApiService с методами generateDSLFromConversation, requestFeedback и т.д.
// Вся логика генерации DSL теперь на сервере!