// pdf-renderer/src/api/reportController.ts

import { Request, Response } from 'express';
import { dslPipeline } from '../engine/dsl/dslPipeline';
import { renderDSLToPDF } from '../engine/renderer';
import {
    detectLanguage,
    detectReportType,
    getReportTitle,
    QUICK_REPORT_TYPES,
    type SupportedLanguage
} from '../utils/languageUtils';
import { getQuickReportTemplate } from '../templates/quickReportTemplates';

export interface GenerateReportRequest {
    userMessage?: string;
    conversationHistory?: Array<{
        role: 'user' | 'assistant';
        content: string;
    }>;
    quickReportType?: string;
}

/**
 * Главный контроллер для генерации отчетов
 * Принимает минимальные данные от фронтенда и выполняет всю бизнес-логику
 */
export const generateReport = async (req: Request, res: Response) => {
    try {
        const { userMessage, conversationHistory = [], quickReportType } = req.body as GenerateReportRequest;

        console.log('📊 НАЧИНАЕМ ГЕНЕРАЦИЮ ОТЧЕТА...');
        console.log(`📝 Сообщение пользователя: ${userMessage?.substring(0, 100) || 'не указано'}`);
        console.log(`💬 История сообщений: ${conversationHistory.length} сообщений`);
        console.log(`⚡ Быстрый тип отчета: ${quickReportType || 'не указан'}`);

        let finalDSL: any = null;

        // Если это быстрый отчет, используем готовый шаблон
        if (quickReportType) {
            const quickReport = QUICK_REPORT_TYPES.find(r => r.type === quickReportType);
            if (quickReport) {
                console.log(`🎯 Используем шаблон быстрого отчета: ${quickReportType}`);

                // Получаем готовый DSL из шаблона
                finalDSL = getQuickReportTemplate(quickReportType);

                if (!finalDSL) {
                    console.warn('⚠️ Шаблон не найден, генерируем через pipeline');
                }
            }
        }

        // Если DSL не получен из шаблона, генерируем через pipeline
        if (!finalDSL) {
            // Подготовка истории разговора
            let finalConversationHistory = [...conversationHistory];
            let finalUserMessage = userMessage;

            // Если это быстрый отчет, формируем соответствующий запрос
            if (quickReportType) {
                const quickReport = QUICK_REPORT_TYPES.find(r => r.type === quickReportType);
                if (quickReport) {
                    const reportQuery = buildQuickReportQuery(quickReport);
                    finalUserMessage = reportQuery;

                    // Добавляем в историю
                    finalConversationHistory.push({
                        role: 'user',
                        content: reportQuery
                    });
                }
            } else if (finalUserMessage) {
                // Добавляем пользовательское сообщение в историю если его там нет
                const lastMessage = finalConversationHistory[finalConversationHistory.length - 1];
                if (!lastMessage || lastMessage.content !== finalUserMessage) {
                    finalConversationHistory.push({
                        role: 'user',
                        content: finalUserMessage
                    });
                }
            }

            // Генерируем DSL через pipeline
            const pipelineResult = await dslPipeline.generateFromConversation(
                finalConversationHistory,
                finalUserMessage
            );

            if (!pipelineResult.success || !pipelineResult.dsl) {
                return res.status(400).json({
                    success: false,
                    error: pipelineResult.error || 'Не удалось сгенерировать структуру отчета'
                });
            }

            finalDSL = pipelineResult.dsl;

            if (pipelineResult.retryCount) {
                console.log(`🔄 Потребовалось попыток: ${pipelineResult.retryCount}`);
            }
        }

        console.log('✅ DSL успешно получен');

        // Определяем параметры отчета
        const language = detectLanguage(userMessage || quickReportType || '');
        const reportType = quickReportType ? quickReportType.replace(/-en$|-ar$/, '') : detectReportType(userMessage || '');
        const title = finalDSL.pages?.[0]?.elements?.[0]?.content ||
            getReportTitle(reportType, language);

        console.log(`🎯 Параметры отчета: язык=${language}, тип=${reportType}, заголовок="${title}"`);

        // Рендерим PDF
        console.log('🎨 Начинаем рендеринг PDF...');
        const pdfBuffer = await renderDSLToPDF(finalDSL);

        console.log(`✅ PDF успешно сгенерирован. Размер: ${pdfBuffer.length} байт`);

        // Отправляем PDF
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${reportType}-${language}-${Date.now()}.pdf"`);
        res.send(pdfBuffer);

    } catch (error) {
        console.error('❌ Критическая ошибка генерации отчета:', error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Внутренняя ошибка сервера'
        });
    }
};

/**
 * Обработка фидбека пользователя
 */
export const processFeedback = async (req: Request, res: Response) => {
    try {
        const { currentDSL, userFeedback } = req.body;

        if (!currentDSL || !userFeedback) {
            return res.status(400).json({
                success: false,
                error: 'Необходимы currentDSL и userFeedback'
            });
        }

        console.log('🔄 Обрабатываем фидбек пользователя...');

        const result = await dslPipeline.processFeedback(currentDSL, userFeedback);

        console.log('✅ Фидбек обработан');

        res.json({
            success: true,
            ...result
        });

    } catch (error) {
        console.error('❌ Ошибка обработки фидбека:', error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Внутренняя ошибка сервера'
        });
    }
};

/**
 * Построение запроса для быстрого отчета
 */
function buildQuickReportQuery(quickReport: any): string {
    const language = quickReport.lang;
    const title = quickReport.title.replace(/[📈💰💼📊]/g, '').trim();

    let reportQuery = '';

    if (language === 'en') {
        reportQuery = `Create a professional ${title} with detailed analytics, charts, and insights for business decision-making.
        
IMPORTANT: All content must be in English, including:
- Report title
- Section headers
- All text content
- Chart titles and labels
- Conclusion`;
    } else if (language === 'ar') {
        reportQuery = `إنشاء ${title} احترافي مع تحليل مفصل ورسوم بيانية ورؤى لاتخاذ القرارات التجارية.

مهم: يجب أن يكون كل المحتوى باللغة العربية، بما في ذلك:
- عنوان التقرير
- عناوين الأقسام
- جميع النصوص
- عناوين وتسميات الرسوم البيانية
- الخلاصة`;
    } else {
        reportQuery = `Создать профессиональный ${title.toLowerCase()} с подробной аналитикой, графиками и инсайтами для принятия бизнес-решений.

ВАЖНО: Весь контент должен быть на русском языке, включая:
- Заголовок отчета
- Заголовки разделов
- Весь текстовый контент
- Заголовки и подписи графиков
- Заключение`;
    }

    reportQuery += `\n\nLanguage for this report: ${language === 'en' ? 'English' : language === 'ar' ? 'Arabic' : 'Russian'}`;

    return reportQuery;
}