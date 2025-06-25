// pdf-renderer/src/engine/dsl/dslGenerator.ts

import {
    detectLanguage,
    detectReportType,
    getReportTitle,
    getLanguageConfig,
    type SupportedLanguage
} from '../../utils/languageUtils';

export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

export interface DSLGenerationResult {
    dsl: any;
    explanation: string;
    suggestions: string[];
}

export class DSLGenerator {
    /**
     * Генерирует DSL на основе текста пользователя
     */
    public generateDSLFromText(userText: string): any {
        const language = detectLanguage(userText);
        const reportType = detectReportType(userText);
        const langConfig = getLanguageConfig(language);
        const isRTL = langConfig.direction === 'rtl';

        return {
            template: 'default',
            defaultFont: langConfig.font,
            defaultDirection: langConfig.direction,
            pages: [{
                elements: [
                    this.createTextElement(
                        getReportTitle(reportType, language),
                        { x: 50, y: 100 },
                        {
                            fontSize: 24,
                            color: '#2C3E50',
                            width: 495,
                            align: 'center'
                        },
                        language
                    ),
                    this.createTextElement(
                        this.getReportDescription(reportType, language),
                        { x: 50, y: 170 },
                        {
                            fontSize: 12,
                            color: '#34495E',
                            width: 495,
                            lineBreak: true
                        },
                        language
                    ),
                    this.createTextElement(
                        this.generateMainContent(reportType, language),
                        { x: 50, y: 220 },
                        {
                            fontSize: 11,
                            color: '#2C3E50',
                            width: 495,
                            lineBreak: true
                        },
                        language
                    ),
                    this.createChartElement(reportType, language, { x: 50, y: 430 }),
                    this.createTextElement(
                        this.getConclusion(language),
                        { x: 50, y: 700 },
                        {
                            fontSize: 11,
                            color: '#7F8C8D',
                            width: 495,
                            lineBreak: true
                        },
                        language
                    )
                ]
            }]
        };
    }

    /**
     * Генерирует DSL на основе истории разговора
     */
    public async generateDSLFromConversation(
        conversationHistory: ChatMessage[],
        expectedLanguage?: SupportedLanguage
    ): Promise<DSLGenerationResult> {
        // Определяем язык из последнего сообщения пользователя
        const lastUserMessage = conversationHistory
            .filter(msg => msg.role === 'user')
            .pop()?.content || '';

        const language = expectedLanguage || detectLanguage(lastUserMessage);
        const reportType = detectReportType(lastUserMessage);

        const dsl = this.generateDSLFromText(lastUserMessage);

        return {
            dsl,
            explanation: this.getExplanation(reportType, language),
            suggestions: this.getSuggestions(language)
        };
    }

    /**
     * Валидирует язык DSL
     */
    public validateDSLLanguage(dsl: any, expectedLang: SupportedLanguage): boolean {
        if (!dsl.pages || !Array.isArray(dsl.pages)) {
            return false;
        }

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

        const detectedLang = detectLanguage(allText);
        return detectedLang === expectedLang;
    }

    private createTextElement(
        content: string,
        position: {x: number, y: number},
        extraStyle: any = {},
        language: SupportedLanguage
    ) {
        const langConfig = getLanguageConfig(language);
        const hasArabic = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/.test(content);
        const isRTL = hasArabic || langConfig.direction === 'rtl';

        return {
            type: 'text',
            content: content,
            position: position,
            style: {
                font: langConfig.font,
                direction: isRTL ? 'rtl' : 'ltr',
                align: isRTL ? 'right' : 'left',
                ...extraStyle,
                ...(hasArabic && extraStyle.align === 'center' ? { align: 'center' } : {})
            }
        };
    }

    private createChartElement(reportType: string, language: SupportedLanguage, position: {x: number, y: number}) {
        const chart = this.generateSampleChart(reportType, language);
        const langConfig = getLanguageConfig(language);

        if (langConfig.direction === 'rtl') {
            chart.options = {
                ...chart.options,
                rtl: true,
                font: { family: langConfig.font }
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
    }

    private getReportDescription(reportType: string, language: SupportedLanguage): string {
        const descriptions: Record<SupportedLanguage, Record<string, string>> = {
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

        return descriptions[language]?.[reportType] || descriptions[language]?.general || '';
    }

    private generateMainContent(reportType: string, language: SupportedLanguage): string {
        const contentMap: Record<SupportedLanguage, Record<string, string>> = {
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
            }
        };

        const content = contentMap[language]?.[reportType] || contentMap[language]?.general || '';
        return content;
    }

    private getConclusion(language: SupportedLanguage): string {
        const conclusions: Record<SupportedLanguage, string> = {
            ru: 'Заключение:\n\nДанный отчёт был автоматически сгенерирован на основе ваших требований. Для получения более детальной информации обратитесь к специалистам.',
            en: 'Conclusion:\n\nThis report was automatically generated based on your requirements. For more detailed information, please contact our specialists.',
            ar: 'الخلاصة:\n\nتم إنشاء هذا التقرير تلقائيًا بناءً على متطلباتكم. للحصول على معلومات أكثر تفصيلاً، يرجى الاتصال بالمختصين.'
        };

        return conclusions[language] || conclusions.ru;
    }

    private generateSampleChart(reportType: string, language: SupportedLanguage): any {
        const charts: Record<SupportedLanguage, any> = {
            ru: {
                type: 'line',
                title: 'Динамика продаж',
                data: {
                    labels: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн'],
                    datasets: [{
                        label: 'Продажи (тыс. руб.)',
                        data: [100, 120, 140, 110, 160, 180],
                        backgroundColor: 'rgba(52, 152, 219, 0.2)',
                        borderColor: '#3498DB',
                        borderWidth: 2
                    }]
                },
                options: { responsive: false, animation: false }
            },
            en: {
                type: 'bar',
                title: 'Sales Performance',
                data: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                    datasets: [{
                        label: 'Sales (k USD)',
                        data: [65, 75, 90, 72, 104, 118],
                        backgroundColor: '#3498DB',
                        borderColor: '#2980B9',
                        borderWidth: 1
                    }]
                },
                options: { responsive: false, animation: false }
            },
            ar: {
                type: 'line',
                title: 'ديناميكية المبيعات',
                data: {
                    labels: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو'],
                    datasets: [{
                        label: 'المبيعات (ألف روبل)',
                        data: [100, 120, 140, 110, 160, 180],
                        backgroundColor: 'rgba(52, 152, 219, 0.2)',
                        borderColor: '#3498DB',
                        borderWidth: 2
                    }]
                },
                options: { responsive: false, animation: false }
            }
        };

        return charts[language] || charts.ru;
    }

    private getExplanation(reportType: string, language: SupportedLanguage): string {
        const localizedType = this.getLocalizedReportType(reportType, language);

        const explanations: Record<SupportedLanguage, string> = {
            ru: `Создан ${localizedType} на русском языке`,
            en: `Created ${localizedType} in English`,
            ar: `تم إنشاء ${localizedType} باللغة العربية`
        };

        return explanations[language] || explanations.ru;
    }

    private getSuggestions(language: SupportedLanguage): string[] {
        const suggestions: Record<SupportedLanguage, string[]> = {
            ru: [
                'Добавить больше графиков и диаграмм',
                'Включить дополнительные разделы',
                'Изменить стиль оформления'
            ],
            en: [
                'Add more charts and diagrams',
                'Include additional sections',
                'Change design style'
            ],
            ar: [
                'إضافة المزيد من الرسوم البيانية',
                'تضمين أقسام إضافية',
                'تغيير نمط التصميم'
            ]
        };

        return suggestions[language] || suggestions.ru;
    }

    private getLocalizedReportType(reportType: string, language: SupportedLanguage): string {
        const translations: Record<SupportedLanguage, Record<string, string>> = {
            ru: {
                marketing: 'маркетинговый отчёт',
                sales: 'отчёт по продажам',
                financial: 'финансовый отчёт',
                analytics: 'аналитический отчёт',
                general: 'общий отчёт'
            },
            en: {
                marketing: 'marketing report',
                sales: 'sales report',
                financial: 'financial report',
                analytics: 'analytics report',
                general: 'general report'
            },
            ar: {
                marketing: 'تقرير تسويقي',
                sales: 'تقرير المبيعات',
                financial: 'تقرير مالي',
                analytics: 'تقرير تحليلي',
                general: 'تقرير عام'
            }
        };

        return translations[language]?.[reportType] || translations[language]?.general || reportType;
    }
}

export const dslGenerator = new DSLGenerator();