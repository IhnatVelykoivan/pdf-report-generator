// frontend/src/services/pdfApi.ts

export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

export interface GenerateReportRequest {
    userMessage?: string;
    conversationHistory?: ChatMessage[];
    quickReportType?: string;
}

export interface GenerateReportResponse {
    success: boolean;
    pdfBlob?: Blob;
    error?: string;
}

export interface FeedbackRequest {
    currentDSL: any;
    userFeedback: string;
}

export interface FeedbackResponse {
    success: boolean;
    dsl?: any;
    explanation?: string;
    suggestions?: string[];
    error?: string;
}

class SimplePdfApiService {
    private readonly baseUrl: string;

    constructor() {
        this.baseUrl = import.meta.env.VITE_PDF_API_URL || 'http://localhost:3001';
        console.log('🔗 PDF API URL:', this.baseUrl);
    }

    /**
     * Генерация отчета - отправляем минимум данных, вся логика на сервере
     */
    async generateReport(request: GenerateReportRequest): Promise<GenerateReportResponse> {
        try {
            console.log('🚀 Отправляем запрос на генерацию отчета...');
            console.log('📝 Параметры:', {
                userMessage: request.userMessage?.substring(0, 100),
                conversationHistory: request.conversationHistory?.length || 0,
                quickReportType: request.quickReportType
            });

            const response = await fetch(`${this.baseUrl}/api/report/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(request),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                return {
                    success: false,
                    error: errorData?.error || `HTTP error! status: ${response.status}`
                };
            }

            // Получаем PDF как blob
            const pdfBlob = await response.blob();
            console.log('📦 PDF получен, размер:', pdfBlob.size, 'bytes');

            return {
                success: true,
                pdfBlob
            };

        } catch (error) {
            console.error('❌ Ошибка генерации отчета:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Неизвестная ошибка'
            };
        }
    }

    /**
     * Отправка фидбека для изменения отчета
     */
    async sendFeedback(request: FeedbackRequest): Promise<FeedbackResponse> {
        try {
            console.log('🔄 Отправляем фидбек...');

            const response = await fetch(`${this.baseUrl}/api/report/feedback`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(request),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                return {
                    success: false,
                    error: errorData?.error || `HTTP error! status: ${response.status}`
                };
            }

            const data = await response.json();
            return {
                success: true,
                ...data
            };

        } catch (error) {
            console.error('❌ Ошибка отправки фидбека:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Неизвестная ошибка'
            };
        }
    }
}

export const simplePdfApiService = new SimplePdfApiService();