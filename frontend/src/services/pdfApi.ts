// API сервис для работы с PDF генератором
export interface PDFGenerationRequest {
    reportType: string;
    title: string;
    description?: string;
    sections?: any[];
}

export interface PDFGenerationResponse {
    success: boolean;
    pdfUrl?: string;
    pdfBlob?: Blob;
    error?: string;
}

class PDFApiService {
    private baseUrl: string;

    constructor() {
        // URL вашего PDF генератора (порт 3001)
        this.baseUrl = import.meta.env.VITE_PDF_API_URL || 'http://localhost:3001';
        console.log('🔗 PDF API URL:', this.baseUrl);
    }

    async generatePDF(request: PDFGenerationRequest): Promise<PDFGenerationResponse> {
        try {
            console.log('🚀 Генерируем DSL для:', request);

            // Создаём DSL структуру для вашего генератора
            const dsl = this.createDSLFromRequest(request);
            console.log('📄 Сгенерированный DSL:', JSON.stringify(dsl, null, 2));

            // Отправляем DSL на ваш существующий API
            const response = await fetch(`${this.baseUrl}/api/render`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ dsl }),
            });

            console.log('📡 Ответ сервера:', response.status, response.statusText);

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                throw new Error(errorData?.message || `HTTP error! status: ${response.status}`);
            }

            // Получаем PDF как blob
            const pdfBlob = await response.blob();
            console.log('📦 PDF blob получен, размер:', pdfBlob.size, 'bytes');

            return {
                success: true,
                pdfBlob,
                pdfUrl: URL.createObjectURL(pdfBlob)
            };

        } catch (error) {
            console.error('❌ Ошибка генерации PDF:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Неизвестная ошибка'
            };
        }
    }

    // Преобразование текста пользователя в DSL структуру
    async generateDSLFromText(userText: string): Promise<any> {
        return this.createDSLFromRequest({
            reportType: this.detectReportType(userText),
            title: this.extractTitle(userText),
            description: userText
        });
    }

    private createDSLFromRequest(request: PDFGenerationRequest): any {
        const language = this.detectLanguage(request.description || request.title);
        const isRTL = language === 'arabic';

        console.log('🌐 Определён язык:', language, 'для текста:', request.description);

        return {
            template: 'default',
            defaultDirection: isRTL ? 'rtl' : 'ltr',
            pages: [
                {
                    elements: [
                        // Заголовок отчёта
                        {
                            type: 'text',
                            content: request.title,
                            position: { x: 100, y: 100 },
                            style: {
                                font: language === 'arabic' ? 'NotoSansArabic' : 'DejaVuSans',
                                fontSize: 24,
                                color: '#2C3E50',
                                width: 400,
                                align: 'center',
                                direction: isRTL ? 'rtl' : 'ltr'
                            }
                        },
                        // Описание
                        {
                            type: 'text',
                            content: request.description || this.getDefaultDescription(language),
                            position: { x: 80, y: 160 },
                            style: {
                                font: language === 'arabic' ? 'NotoSansArabic' : 'DejaVuSans',
                                fontSize: 12,
                                color: '#34495E',
                                width: 450,
                                align: isRTL ? 'right' : 'left',
                                lineBreak: true,
                                direction: isRTL ? 'rtl' : 'ltr'
                            }
                        },
                        // Основной контент
                        {
                            type: 'text',
                            content: this.generateMainContent(request.reportType, language),
                            position: { x: 80, y: 220 },
                            style: {
                                font: language === 'arabic' ? 'NotoSansArabic' : 'DejaVuSans',
                                fontSize: 11,
                                color: '#2C3E50',
                                width: 450,
                                align: isRTL ? 'right' : 'left',
                                lineBreak: true,
                                direction: isRTL ? 'rtl' : 'ltr'
                            }
                        },
                        // Пример графика
                        {
                            type: 'chart',
                            content: this.generateSampleChart(request.reportType, language),
                            position: { x: 80, y: 400 },
                            style: {
                                width: 450,
                                height: 250,
                                backgroundColor: '#FFFFFF',
                                borderColor: '#BDC3C7',
                                direction: isRTL ? 'rtl' : 'ltr'
                            }
                        },
                        // Заключение
                        {
                            type: 'text',
                            content: this.generateConclusion(language),
                            position: { x: 80, y: 680 },
                            style: {
                                font: language === 'arabic' ? 'NotoSansArabic' : 'DejaVuSans',
                                fontSize: 11,
                                color: '#7F8C8D',
                                width: 450,
                                align: isRTL ? 'right' : 'left',
                                lineBreak: true,
                                direction: isRTL ? 'rtl' : 'ltr'
                            }
                        }
                    ]
                }
            ]
        };
    }

    private getDefaultDescription(language: 'russian' | 'english' | 'arabic'): string {
        const descriptions = {
            russian: 'Описание отчёта',
            english: 'Report description',
            arabic: 'وصف التقرير'
        };
        return descriptions[language];
    }

    private detectLanguage(text: string): 'russian' | 'english' | 'arabic' {
        if (!text) return 'english';

        // Проверка на арабский
        if (/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/.test(text)) {
            return 'arabic';
        }

        // Проверка на русский
        if (/[а-яё]/i.test(text)) {
            return 'russian';
        }

        return 'english';
    }

    private generateConclusion(language: 'russian' | 'english' | 'arabic'): string {
        const conclusions = {
            russian: 'Заключение:\n\nДанный отчёт был автоматически сгенерирован на основе ваших требований. Для получения более детальной информации обратитесь к специалистам.',
            english: 'Conclusion:\n\nThis report was automatically generated based on your requirements. For more detailed information, please contact our specialists.',
            arabic: 'الخلاصة:\n\nتم إنشاء هذا التقرير تلقائيًا بناءً على متطلباتكم. للحصول على معلومات أكثر تفصيلاً، يرجى الاتصال بالمختصين.'
        };

        return conclusions[language];
    }

    private generateMainContent(reportType: string, language: 'russian' | 'english' | 'arabic' = 'russian'): string {
        const contentMap = {
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
            }
        };

        const cleanReportType = reportType.replace(/-en$|-ar$/, '') as keyof typeof contentMap.russian;
        return contentMap[language][cleanReportType] || contentMap[language].general;
    }

    private generateSampleChart(reportType: string, language: 'russian' | 'english' | 'arabic' = 'russian'): any {
        const charts = {
            marketing: {
                type: 'bar',
                title: language === 'arabic' ? 'فعالية القنوات التسويقية' :
                    language === 'english' ? 'Marketing Channels Effectiveness' :
                        'Эффективность маркетинговых каналов',
                data: {
                    labels: language === 'arabic' ? ['إعلانات جوجل', 'فيسبوك', 'الإيميل', 'السيو', 'مباشر'] :
                        language === 'english' ? ['Google Ads', 'Facebook', 'Email', 'SEO', 'Direct'] :
                            ['Google Ads', 'Facebook', 'Email', 'SEO', 'Direct'],
                    datasets: [{
                        label: language === 'arabic' ? 'التحويل (%)' :
                            language === 'english' ? 'Conversion (%)' :
                                'Конверсия (%)',
                        data: [12, 19, 8, 15, 6],
                        backgroundColor: ['#3498DB', '#E74C3C', '#F39C12', '#27AE60', '#9B59B6'],
                        borderColor: ['#2980B9', '#C0392B', '#E67E22', '#229954', '#8E44AD'],
                        borderWidth: 1
                    }]
                },
                options: { responsive: false, animation: false }
            },
            sales: {
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
                options: { responsive: false, animation: false }
            },
            financial: {
                type: 'pie',
                title: language === 'arabic' ? 'هيكل النفقات' :
                    language === 'english' ? 'Expense Structure' :
                        'Структура расходов',
                data: {
                    labels: language === 'arabic' ? ['الراتب', 'الإيجار', 'الإعلان', 'المشتريات', 'أخرى'] :
                        language === 'english' ? ['Salary', 'Rent', 'Advertising', 'Purchases', 'Other'] :
                            ['Зарплата', 'Аренда', 'Реклама', 'Закупки', 'Прочее'],
                    datasets: [{
                        data: [40, 20, 15, 20, 5],
                        backgroundColor: ['#E74C3C', '#3498DB', '#F39C12', '#27AE60', '#9B59B6'],
                        borderColor: ['#C0392B', '#2980B9', '#E67E22', '#229954', '#8E44AD'],
                        borderWidth: 1
                    }]
                },
                options: { responsive: false, animation: false }
            }
        };

        return charts[reportType.replace(/-en$|-ar$/, '') as keyof typeof charts] || charts.sales;
    }

    private detectReportType(text: string): string {
        const lowerText = text.toLowerCase();

        if (lowerText.includes('маркетинг') || lowerText.includes('реклама')) {
            return 'marketing';
        } else if (lowerText.includes('продажи') || lowerText.includes('продаж')) {
            return 'sales';
        } else if (lowerText.includes('финанс') || lowerText.includes('бюджет')) {
            return 'financial';
        } else if (lowerText.includes('аналитик') || lowerText.includes('анализ')) {
            return 'analytics';
        }

        return 'general';
    }

    private extractTitle(text: string): string {
        // Извлекаем заголовок из текста
        const words = text.split(' ').slice(0, 8);
        let title = words.join(' ');

        if (text.split(' ').length > 8) {
            title += '...';
        }

        // Делаем первую букву заглавной
        return title.charAt(0).toUpperCase() + title.slice(1);
    }
}

export const pdfApiService = new PDFApiService();