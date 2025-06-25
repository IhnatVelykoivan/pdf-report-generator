// pdf-renderer/src/templates/quickReportTemplates.ts

import { type SupportedLanguage, getLanguageConfig } from '../utils/languageUtils';

interface ChartData {
    type: 'bar' | 'line' | 'pie';
    title: string;
    data: {
        labels: string[];
        datasets: Array<{
            label?: string;
            data: number[];
            backgroundColor?: string | string[];
            borderColor?: string | string[];
            borderWidth?: number;
            fill?: boolean;
            tension?: number;
            pointRadius?: number;
            pointBorderWidth?: number;
            pointHoverRadius?: number;
            borderDash?: number[];
        }>;
    };
    options?: any;
    textDirection?: 'ltr' | 'rtl';
}

// Цветовые палитры для красивых графиков
const COLOR_PALETTES = {
    vibrant: {
        backgrounds: [
            'rgba(255, 99, 132, 0.7)',   // Розовый
            'rgba(54, 162, 235, 0.7)',   // Голубой
            'rgba(255, 206, 86, 0.7)',   // Желтый
            'rgba(75, 192, 192, 0.7)',   // Бирюзовый
            'rgba(153, 102, 255, 0.7)',  // Фиолетовый
            'rgba(255, 159, 64, 0.7)',   // Оранжевый
            'rgba(46, 204, 113, 0.7)',   // Зеленый
            'rgba(231, 76, 60, 0.7)'     // Красный
        ],
        borders: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)',
            'rgba(46, 204, 113, 1)',
            'rgba(231, 76, 60, 1)'
        ]
    },
    professional: {
        backgrounds: [
            'rgba(26, 82, 118, 0.8)',    // Темно-синий
            'rgba(39, 174, 96, 0.8)',    // Зеленый
            'rgba(231, 76, 60, 0.8)',    // Красный
            'rgba(241, 196, 15, 0.8)',   // Золотой
            'rgba(142, 68, 173, 0.8)',   // Фиолетовый
            'rgba(52, 73, 94, 0.8)',     // Серо-синий
            'rgba(230, 126, 34, 0.8)',   // Оранжевый
            'rgba(44, 62, 80, 0.8)'      // Темно-серый
        ],
        borders: [
            'rgba(26, 82, 118, 1)',
            'rgba(39, 174, 96, 1)',
            'rgba(231, 76, 60, 1)',
            'rgba(241, 196, 15, 1)',
            'rgba(142, 68, 173, 1)',
            'rgba(52, 73, 94, 1)',
            'rgba(230, 126, 34, 1)',
            'rgba(44, 62, 80, 1)'
        ]
    }
};

// Интерфейс для шаблона отчета
interface ReportTemplate {
    title: string;
    description: string;
    content: string;
    charts: ChartData[];
}

// Шаблоны для маркетинговых отчетов
const MARKETING_TEMPLATES: Record<SupportedLanguage, ReportTemplate> = {
    ru: {
        title: 'Маркетинговый отчёт',
        description: 'Комплексный анализ маркетинговых кампаний и эффективности каналов привлечения клиентов',
        content: `АНАЛИТИЧЕСКИЙ ОТЧЁТ ПО МАРКЕТИНГУ

1. ОБЗОР МАРКЕТИНГОВОЙ ДЕЯТЕЛЬНОСТИ
   • Анализ текущих маркетинговых кампаний
   • Оценка эффективности рекламных каналов
   • Исследование целевой аудитории
   • Бенчмаркинг с конкурентами

2. КЛЮЧЕВЫЕ ПОКАЗАТЕЛИ ЭФФЕКТИВНОСТИ
   • ROI маркетинговых активностей: +156%
   • Конверсия по каналам привлечения: 3.2%
   • Стоимость привлечения клиента: 1,250 руб.
   • Lifetime Value клиента: 15,600 руб.

3. АНАЛИЗ КАНАЛОВ ПРИВЛЕЧЕНИЯ
   • Контекстная реклама: 35% трафика, CR 4.2%
   • Социальные сети: 28% трафика, CR 2.8%
   • SEO: 22% трафика, CR 3.5%
   • Email-маркетинг: 15% трафика, CR 5.1%

4. РЕКОМЕНДАЦИИ И ПЛАН ДЕЙСТВИЙ
   • Увеличить бюджет на email-маркетинг на 40%
   • Оптимизировать кампании в соцсетях
   • Внедрить ретаргетинг для повышения конверсии
   • Протестировать новые креативы для контекста`,
        charts: [
            {
                type: 'bar',
                title: 'Эффективность маркетинговых каналов',
                data: {
                    labels: ['Google Ads', 'Яндекс.Директ', 'Facebook', 'Instagram', 'Email', 'SEO', 'Партнеры'],
                    datasets: [{
                        label: 'ROI (%)',
                        data: [215, 189, 156, 142, 312, 425, 178],
                        backgroundColor: COLOR_PALETTES.vibrant.backgrounds,
                        borderColor: COLOR_PALETTES.vibrant.borders,
                        borderWidth: 2
                    }]
                }
            },
            {
                type: 'line',
                title: 'Динамика привлечения клиентов',
                data: {
                    labels: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг'],
                    datasets: [{
                        label: 'Новые клиенты',
                        data: [1200, 1350, 1580, 1420, 1750, 1920, 2100, 2350],
                        backgroundColor: 'rgba(54, 162, 235, 0.2)',
                        borderColor: 'rgba(54, 162, 235, 1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4,
                        pointRadius: 5,
                        pointBorderWidth: 2,
                        pointHoverRadius: 7
                    }]
                }
            }
        ]
    },
    en: {
        title: 'Marketing Report',
        description: 'Comprehensive analysis of marketing campaigns and customer acquisition channel effectiveness',
        content: `MARKETING ANALYTICS REPORT

1. MARKETING ACTIVITIES OVERVIEW
   • Current marketing campaigns analysis
   • Advertising channels effectiveness evaluation
   • Target audience research
   • Competitor benchmarking

2. KEY PERFORMANCE INDICATORS
   • Marketing ROI: +156%
   • Channel conversion rate: 3.2%
   • Customer acquisition cost: $18.50
   • Customer Lifetime Value: $245.00

3. ACQUISITION CHANNEL ANALYSIS
   • Paid Search: 35% of traffic, 4.2% CR
   • Social Media: 28% of traffic, 2.8% CR
   • Organic Search: 22% of traffic, 3.5% CR
   • Email Marketing: 15% of traffic, 5.1% CR

4. RECOMMENDATIONS & ACTION PLAN
   • Increase email marketing budget by 40%
   • Optimize social media campaigns
   • Implement retargeting for higher conversion
   • Test new creatives for paid search`,
        charts: [
            {
                type: 'bar',
                title: 'Marketing Channel Performance',
                data: {
                    labels: ['Google Ads', 'Facebook', 'Instagram', 'LinkedIn', 'Email', 'SEO', 'Affiliates'],
                    datasets: [{
                        label: 'ROI (%)',
                        data: [215, 156, 142, 128, 312, 425, 178],
                        backgroundColor: COLOR_PALETTES.professional.backgrounds,
                        borderColor: COLOR_PALETTES.professional.borders,
                        borderWidth: 2
                    }]
                }
            },
            {
                type: 'pie',
                title: 'Traffic Sources Distribution',
                data: {
                    labels: ['Paid Search', 'Social Media', 'Organic Search', 'Email', 'Direct', 'Referral'],
                    datasets: [{
                        data: [35, 28, 22, 15, 8, 7],
                        backgroundColor: COLOR_PALETTES.vibrant.backgrounds.slice(0, 6),
                        borderColor: COLOR_PALETTES.vibrant.borders.slice(0, 6),
                        borderWidth: 2
                    }]
                }
            }
        ]
    },
    ar: {
        title: 'تقرير التسويق',
        description: 'تحليل شامل للحملات التسويقية وفعالية قنوات اكتساب العملاء',
        content: `تقرير تحليل التسويق

1. نظرة عامة على الأنشطة التسويقية
   • تحليل الحملات التسويقية الحالية
   • تقييم فعالية قنوات الإعلان
   • بحث الجمهور المستهدف
   • المقارنة مع المنافسين

2. مؤشرات الأداء الرئيسية
   • عائد الاستثمار التسويقي: +156%
   • معدل التحويل عبر القنوات: 3.2%
   • تكلفة اكتساب العميل: 69.75 ريال
   • القيمة الدائمة للعميل: 920.25 ريال

3. تحليل قنوات الاكتساب
   • البحث المدفوع: 35% من الحركة، معدل التحويل 4.2%
   • وسائل التواصل الاجتماعي: 28% من الحركة، معدل التحويل 2.8%
   • البحث العضوي: 22% من الحركة، معدل التحويل 3.5%
   • التسويق عبر البريد الإلكتروني: 15% من الحركة، معدل التحويل 5.1%

4. التوصيات وخطة العمل
   • زيادة ميزانية التسويق عبر البريد الإلكتروني بنسبة 40%
   • تحسين حملات وسائل التواصل الاجتماعي
   • تنفيذ إعادة الاستهداف لزيادة التحويل
   • اختبار إبداعات جديدة للبحث المدفوع`,
        charts: [
            {
                type: 'bar',
                title: 'أداء قنوات التسويق',
                textDirection: 'rtl',
                data: {
                    labels: ['جوجل', 'فيسبوك', 'انستغرام', 'لينكد إن', 'البريد', 'تحسين محركات البحث', 'الشركاء'],
                    datasets: [{
                        label: 'العائد على الاستثمار (%)',
                        data: [215, 156, 142, 128, 312, 425, 178],
                        backgroundColor: COLOR_PALETTES.vibrant.backgrounds,
                        borderColor: COLOR_PALETTES.vibrant.borders,
                        borderWidth: 2
                    }]
                },
                options: {
                    rtl: true,
                    font: { family: 'DejaVuSans' }
                }
            }
        ]
    }
};

// Шаблоны для отчетов по продажам
const SALES_TEMPLATES: Record<SupportedLanguage, ReportTemplate> = {
    ru: {
        title: 'Отчёт по продажам',
        description: 'Анализ продаж, динамика роста и прогнозы на будущие периоды',
        content: `ОТЧЁТ ПО ПРОДАЖАМ

1. ОБЩИЕ ПОКАЗАТЕЛИ ПРОДАЖ
   • Выручка за период: 125,600,000 руб.
   • Рост к прошлому году: +23.5%
   • Количество сделок: 3,456
   • Средний чек: 36,342 руб.

2. АНАЛИЗ ПО КАТЕГОРИЯМ ПРОДУКТОВ
   • Категория A: 45% от общих продаж (+18% YoY)
   • Категория B: 32% от общих продаж (+31% YoY)
   • Категория C: 23% от общих продаж (+12% YoY)

3. ЭФФЕКТИВНОСТЬ КОМАНДЫ ПРОДАЖ
   • Конверсия лидов: 24.3%
   • Среднее время закрытия сделки: 18 дней
   • Топ-менеджеры превысили план на 135%
   • NPS команды продаж: 72

4. ПРОГНОЗ И СТРАТЕГИЯ
   • Прогноз на след. квартал: 148,500,000 руб.
   • Фокус на категории B (высокий рост)
   • Расширение команды на 15%
   • Внедрение новой CRM системы`,
        charts: [
            {
                type: 'line',
                title: 'Динамика продаж по месяцам',
                data: {
                    labels: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'],
                    datasets: [
                        {
                            label: 'Текущий год (млн руб.)',
                            data: [8.2, 9.1, 9.8, 10.2, 11.5, 12.1, 11.8, 12.5, 13.2, 13.8, 14.5, 15.2],
                            backgroundColor: 'rgba(46, 204, 113, 0.2)',
                            borderColor: 'rgba(46, 204, 113, 1)',
                            borderWidth: 3,
                            fill: true,
                            tension: 0.3,
                            pointRadius: 4,
                            pointHoverRadius: 6
                        },
                        {
                            label: 'Прошлый год (млн руб.)',
                            data: [6.8, 7.2, 7.9, 8.1, 8.8, 9.2, 9.5, 9.8, 10.1, 10.5, 11.2, 11.8],
                            backgroundColor: 'rgba(52, 152, 219, 0.2)',
                            borderColor: 'rgba(52, 152, 219, 1)',
                            borderWidth: 2,
                            fill: false,
                            tension: 0.3,
                            borderDash: [5, 5]
                        }
                    ]
                }
            },
            {
                type: 'pie',
                title: 'Распределение продаж по регионам',
                data: {
                    labels: ['Москва', 'Санкт-Петербург', 'Регионы ЦФО', 'Урал', 'Сибирь', 'Дальний Восток'],
                    datasets: [{
                        data: [35, 22, 18, 12, 8, 5],
                        backgroundColor: COLOR_PALETTES.professional.backgrounds.slice(0, 6),
                        borderColor: COLOR_PALETTES.professional.borders.slice(0, 6),
                        borderWidth: 2
                    }]
                }
            }
        ]
    },
    en: {
        title: 'Sales Report',
        description: 'Sales analysis, growth dynamics and forecasts for future periods',
        content: `SALES PERFORMANCE REPORT

1. GENERAL SALES METRICS
   • Total Revenue: $1,856,000
   • YoY Growth: +23.5%
   • Number of Deals: 3,456
   • Average Deal Size: $537

2. PRODUCT CATEGORY ANALYSIS
   • Category A: 45% of total sales (+18% YoY)
   • Category B: 32% of total sales (+31% YoY)
   • Category C: 23% of total sales (+12% YoY)

3. SALES TEAM EFFECTIVENESS
   • Lead Conversion Rate: 24.3%
   • Average Deal Closure Time: 18 days
   • Top Performers exceeded target by 135%
   • Sales Team NPS: 72

4. FORECAST & STRATEGY
   • Next Quarter Forecast: $2,195,000
   • Focus on Category B (high growth)
   • Team expansion by 15%
   • New CRM implementation`,
        charts: [
            {
                type: 'bar',
                title: 'Quarterly Sales Performance',
                data: {
                    labels: ['Q1 2023', 'Q2 2023', 'Q3 2023', 'Q4 2023', 'Q1 2024', 'Q2 2024'],
                    datasets: [{
                        label: 'Revenue ($K)',
                        data: [380, 425, 465, 512, 485, 556],
                        backgroundColor: [
                            'rgba(231, 76, 60, 0.8)',
                            'rgba(231, 76, 60, 0.8)',
                            'rgba(231, 76, 60, 0.8)',
                            'rgba(231, 76, 60, 0.8)',
                            'rgba(46, 204, 113, 0.8)',
                            'rgba(46, 204, 113, 0.8)'
                        ],
                        borderColor: [
                            'rgba(231, 76, 60, 1)',
                            'rgba(231, 76, 60, 1)',
                            'rgba(231, 76, 60, 1)',
                            'rgba(231, 76, 60, 1)',
                            'rgba(46, 204, 113, 1)',
                            'rgba(46, 204, 113, 1)'
                        ],
                        borderWidth: 2
                    }]
                }
            }
        ]
    },
    ar: {
        title: 'تقرير المبيعات',
        description: 'تحليل المبيعات وديناميكيات النمو والتوقعات للفترات المستقبلية',
        content: `تقرير أداء المبيعات

1. مؤشرات المبيعات العامة
   • إجمالي الإيرادات: 6,960,000 ريال
   • النمو السنوي: +23.5%
   • عدد الصفقات: 3,456
   • متوسط قيمة الصفقة: 2,014 ريال

2. تحليل فئات المنتجات
   • الفئة أ: 45% من إجمالي المبيعات (+18% نمو سنوي)
   • الفئة ب: 32% من إجمالي المبيعات (+31% نمو سنوي)
   • الفئة ج: 23% من إجمالي المبيعات (+12% نمو سنوي)

3. فعالية فريق المبيعات
   • معدل تحويل العملاء المحتملين: 24.3%
   • متوسط وقت إغلاق الصفقة: 18 يوم
   • الأداء المتميز تجاوز الهدف بنسبة 135%
   • رضا فريق المبيعات: 72

4. التوقعات والاستراتيجية
   • توقعات الربع القادم: 8,231,250 ريال
   • التركيز على الفئة ب (نمو مرتفع)
   • توسيع الفريق بنسبة 15%
   • تطبيق نظام CRM جديد`,
        charts: [
            {
                type: 'line',
                title: 'ديناميكية المبيعات الشهرية',
                textDirection: 'rtl',
                data: {
                    labels: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو'],
                    datasets: [{
                        label: 'المبيعات (ألف ريال)',
                        data: [520, 580, 625, 690, 745, 812],
                        backgroundColor: 'rgba(142, 68, 173, 0.2)',
                        borderColor: 'rgba(142, 68, 173, 1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4
                    }]
                },
                options: {
                    rtl: true,
                    font: { family: 'DejaVuSans' }
                }
            }
        ]
    }
};

// Шаблоны для финансовых отчетов
const FINANCIAL_TEMPLATES: Record<SupportedLanguage, ReportTemplate> = {
    ru: {
        title: 'Финансовый отчёт',
        description: 'Анализ финансовых показателей, бюджета и рентабельности',
        content: `ФИНАНСОВЫЙ ОТЧЁТ

1. ОСНОВНЫЕ ФИНАНСОВЫЕ ПОКАЗАТЕЛИ
   • Выручка: 458,200,000 руб.
   • EBITDA: 91,640,000 руб. (20%)
   • Чистая прибыль: 64,148,000 руб. (14%)
   • Денежный поток: 78,500,000 руб.

2. СТРУКТУРА РАСХОДОВ
   • Себестоимость: 45%
   • Операционные расходы: 25%
   • Маркетинг и продажи: 12%
   • Административные: 8%
   • Прочие: 10%

3. АНАЛИЗ РЕНТАБЕЛЬНОСТИ
   • Валовая рентабельность: 55%
   • Операционная рентабельность: 30%
   • Рентабельность по EBITDA: 20%
   • ROE: 24.5%

4. ФИНАНСОВОЕ ПЛАНИРОВАНИЕ
   • Бюджет на след. год: 540,000,000 руб.
   • Инвестиции в развитие: 85,000,000 руб.
   • Целевая маржа EBITDA: 22%
   • Резервный фонд: 45,000,000 руб.`,
        charts: [
            {
                type: 'pie',
                title: 'Структура расходов компании',
                data: {
                    labels: ['Себестоимость', 'Операционные', 'Маркетинг', 'Административные', 'Прочие'],
                    datasets: [{
                        data: [45, 25, 12, 8, 10],
                        backgroundColor: [
                            'rgba(231, 76, 60, 0.8)',
                            'rgba(52, 152, 219, 0.8)',
                            'rgba(46, 204, 113, 0.8)',
                            'rgba(241, 196, 15, 0.8)',
                            'rgba(155, 89, 182, 0.8)'
                        ],
                        borderColor: [
                            'rgba(231, 76, 60, 1)',
                            'rgba(52, 152, 219, 1)',
                            'rgba(46, 204, 113, 1)',
                            'rgba(241, 196, 15, 1)',
                            'rgba(155, 89, 182, 1)'
                        ],
                        borderWidth: 2
                    }]
                }
            },
            {
                type: 'bar',
                title: 'Квартальная динамика прибыли',
                data: {
                    labels: ['Q1', 'Q2', 'Q3', 'Q4'],
                    datasets: [
                        {
                            label: 'Выручка (млн руб.)',
                            data: [98.5, 112.3, 125.6, 121.8],
                            backgroundColor: 'rgba(52, 152, 219, 0.7)',
                            borderColor: 'rgba(52, 152, 219, 1)',
                            borderWidth: 2
                        },
                        {
                            label: 'Чистая прибыль (млн руб.)',
                            data: [12.8, 15.6, 18.9, 16.8],
                            backgroundColor: 'rgba(46, 204, 113, 0.7)',
                            borderColor: 'rgba(46, 204, 113, 1)',
                            borderWidth: 2
                        }
                    ]
                }
            }
        ]
    },
    en: {
        title: 'Financial Report',
        description: 'Analysis of financial indicators, budget and profitability',
        content: `FINANCIAL REPORT

1. KEY FINANCIAL INDICATORS
   • Revenue: $6,780,000
   • EBITDA: $1,356,000 (20%)
   • Net Profit: $949,200 (14%)
   • Cash Flow: $1,161,000

2. EXPENSE STRUCTURE
   • Cost of Goods Sold: 45%
   • Operating Expenses: 25%
   • Sales & Marketing: 12%
   • Administrative: 8%
   • Other: 10%

3. PROFITABILITY ANALYSIS
   • Gross Margin: 55%
   • Operating Margin: 30%
   • EBITDA Margin: 20%
   • ROE: 24.5%

4. FINANCIAL PLANNING
   • Next Year Budget: $7,990,000
   • Development Investment: $1,257,000
   • Target EBITDA Margin: 22%
   • Reserve Fund: $666,000`,
        charts: [
            {
                type: 'line',
                title: 'Monthly Revenue Trend',
                data: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                    datasets: [{
                        label: 'Revenue ($K)',
                        data: [480, 512, 535, 558, 589, 612, 625, 645, 678, 695, 712, 739],
                        backgroundColor: 'rgba(241, 196, 15, 0.2)',
                        borderColor: 'rgba(241, 196, 15, 1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4,
                        pointRadius: 4,
                        pointHoverRadius: 6
                    }]
                }
            }
        ]
    },
    ar: {
        title: 'التقرير المالي',
        description: 'تحليل المؤشرات المالية والميزانية والربحية',
        content: `التقرير المالي

1. المؤشرات المالية الرئيسية
   • الإيرادات: 25,425,000 ريال
   • الأرباح قبل الفوائد والضرائب: 5,085,000 ريال (20%)
   • صافي الربح: 3,559,500 ريال (14%)
   • التدفق النقدي: 4,356,375 ريال

2. هيكل المصروفات
   • تكلفة البضائع المباعة: 45%
   • المصروفات التشغيلية: 25%
   • المبيعات والتسويق: 12%
   • الإدارية: 8%
   • أخرى: 10%

3. تحليل الربحية
   • الهامش الإجمالي: 55%
   • الهامش التشغيلي: 30%
   • هامش EBITDA: 20%
   • العائد على حقوق الملكية: 24.5%

4. التخطيط المالي
   • ميزانية العام القادم: 29,962,500 ريال
   • الاستثمار في التطوير: 4,713,750 ريال
   • هامش EBITDA المستهدف: 22%
   • صندوق الاحتياطي: 2,497,500 ريال`,
        charts: [
            {
                type: 'pie',
                title: 'هيكل المصروفات',
                textDirection: 'rtl',
                data: {
                    labels: ['تكلفة البضائع', 'تشغيلية', 'تسويق', 'إدارية', 'أخرى'],
                    datasets: [{
                        data: [45, 25, 12, 8, 10],
                        backgroundColor: COLOR_PALETTES.professional.backgrounds.slice(0, 5),
                        borderColor: COLOR_PALETTES.professional.borders.slice(0, 5),
                        borderWidth: 2
                    }]
                },
                options: {
                    rtl: true,
                    font: { family: 'DejaVuSans' }
                }
            }
        ]
    }
};

// Шаблоны для аналитических отчетов
const ANALYTICS_TEMPLATES: Record<SupportedLanguage, ReportTemplate> = {
    ru: {
        title: 'Аналитический отчёт',
        description: 'Глубокий анализ данных, трендов и инсайтов для принятия решений',
        content: `АНАЛИТИЧЕСКИЙ ОТЧЁТ

1. EXECUTIVE SUMMARY
   • Выявлено 3 ключевых тренда роста
   • Потенциал увеличения выручки: +35%
   • Риски: усиление конкуренции в сегменте B
   • Рекомендации: фокус на цифровизации

2. АНАЛИЗ РЫНКА
   • Размер рынка: 2.3 млрд руб.
   • Темпы роста: 18% годовых
   • Наша доля: 12.5% (+2.3 п.п. YoY)
   • Ключевые игроки: топ-5 контролируют 65%

3. ПОТРЕБИТЕЛЬСКОЕ ПОВЕДЕНИЕ
   • Средний LTV вырос на 23%
   • Частота покупок: +15%
   • Индекс лояльности NPS: 68
   • Основные драйверы: качество и сервис

4. СТРАТЕГИЧЕСКИЕ РЕКОМЕНДАЦИИ
   • Запуск премиум-линейки продуктов
   • Развитие омниканальности
   • Инвестиции в R&D: 8% от выручки
   • Партнерства для масштабирования`,
        charts: [
            {
                type: 'bar',
                title: 'Сравнительный анализ сегментов',
                data: {
                    labels: ['Сегмент A', 'Сегмент B', 'Сегмент C', 'Сегмент D', 'Сегмент E'],
                    datasets: [
                        {
                            label: 'Наша доля рынка (%)',
                            data: [18.5, 12.3, 22.1, 8.7, 15.4],
                            backgroundColor: 'rgba(52, 152, 219, 0.8)',
                            borderColor: 'rgba(52, 152, 219, 1)',
                            borderWidth: 2
                        },
                        {
                            label: 'Потенциал роста (%)',
                            data: [25, 45, 15, 35, 20],
                            backgroundColor: 'rgba(46, 204, 113, 0.8)',
                            borderColor: 'rgba(46, 204, 113, 1)',
                            borderWidth: 2
                        }
                    ]
                }
            },
            {
                type: 'line',
                title: 'Прогнозная модель развития',
                data: {
                    labels: ['2023', '2024', '2025', '2026', '2027', '2028'],
                    datasets: [
                        {
                            label: 'Базовый сценарий',
                            data: [100, 118, 139, 164, 193, 228],
                            backgroundColor: 'rgba(52, 152, 219, 0.2)',
                            borderColor: 'rgba(52, 152, 219, 1)',
                            borderWidth: 3,
                            fill: false,
                            tension: 0.4
                        },
                        {
                            label: 'Оптимистичный сценарий',
                            data: [100, 125, 156, 195, 244, 305],
                            backgroundColor: 'rgba(46, 204, 113, 0.2)',
                            borderColor: 'rgba(46, 204, 113, 1)',
                            borderWidth: 3,
                            fill: false,
                            tension: 0.4,
                            borderDash: [10, 5]
                        },
                        {
                            label: 'Пессимистичный сценарий',
                            data: [100, 108, 117, 126, 136, 147],
                            backgroundColor: 'rgba(231, 76, 60, 0.2)',
                            borderColor: 'rgba(231, 76, 60, 1)',
                            borderWidth: 2,
                            fill: false,
                            tension: 0.4,
                            borderDash: [5, 5]
                        }
                    ]
                }
            }
        ]
    },
    en: {
        title: 'Analytics Report',
        description: 'Deep data analysis, trends and insights for decision making',
        content: `ANALYTICS REPORT

1. EXECUTIVE SUMMARY
   • Identified 3 key growth trends
   • Revenue increase potential: +35%
   • Risks: increased competition in segment B
   • Recommendations: focus on digitalization

2. MARKET ANALYSIS
   • Market size: $34M
   • Growth rate: 18% annually
   • Our share: 12.5% (+2.3 pp YoY)
   • Key players: top-5 control 65%

3. CONSUMER BEHAVIOR
   • Average LTV increased by 23%
   • Purchase frequency: +15%
   • NPS loyalty index: 68
   • Key drivers: quality and service

4. STRATEGIC RECOMMENDATIONS
   • Launch premium product line
   • Develop omnichannel presence
   • R&D investment: 8% of revenue
   • Partnerships for scaling`,
        charts: [
            {
                type: 'pie',
                title: 'Market Share Distribution',
                data: {
                    labels: ['Our Company', 'Competitor A', 'Competitor B', 'Competitor C', 'Others'],
                    datasets: [{
                        data: [12.5, 22.3, 18.7, 15.2, 31.3],
                        backgroundColor: COLOR_PALETTES.vibrant.backgrounds.slice(0, 5),
                        borderColor: COLOR_PALETTES.vibrant.borders.slice(0, 5),
                        borderWidth: 2
                    }]
                }
            }
        ]
    },
    ar: {
        title: 'تقرير التحليلات',
        description: 'تحليل عميق للبيانات والاتجاهات والرؤى لاتخاذ القرارات',
        content: `تقرير التحليلات

1. ملخص تنفيذي
   • تم تحديد 3 اتجاهات نمو رئيسية
   • إمكانية زيادة الإيرادات: +35%
   • المخاطر: زيادة المنافسة في القطاع ب
   • التوصيات: التركيز على الرقمنة

2. تحليل السوق
   • حجم السوق: 127.5 مليون ريال
   • معدل النمو: 18% سنوياً
   • حصتنا: 12.5% (+2.3 نقطة مئوية سنوياً)
   • اللاعبون الرئيسيون: أكبر 5 يسيطرون على 65%

3. سلوك المستهلك
   • متوسط قيمة العميل مدى الحياة زاد بنسبة 23%
   • تكرار الشراء: +15%
   • مؤشر الولاء NPS: 68
   • المحركات الرئيسية: الجودة والخدمة

4. التوصيات الاستراتيجية
   • إطلاق خط منتجات متميز
   • تطوير التواجد متعدد القنوات
   • الاستثمار في البحث والتطوير: 8% من الإيرادات
   • الشراكات للتوسع`,
        charts: [
            {
                type: 'bar',
                title: 'تحليل مقارن للقطاعات',
                textDirection: 'rtl',
                data: {
                    labels: ['القطاع أ', 'القطاع ب', 'القطاع ج', 'القطاع د', 'القطاع هـ'],
                    datasets: [{
                        label: 'حصتنا في السوق (%)',
                        data: [18.5, 12.3, 22.1, 8.7, 15.4],
                        backgroundColor: COLOR_PALETTES.professional.backgrounds.slice(0, 5),
                        borderColor: COLOR_PALETTES.professional.borders.slice(0, 5),
                        borderWidth: 2
                    }]
                },
                options: {
                    rtl: true,
                    font: { family: 'DejaVuSans' }
                }
            }
        ]
    }
};

// Главная функция получения шаблона
export function getQuickReportTemplate(reportType: string): any {
    // Извлекаем язык из типа отчета
    let language: SupportedLanguage = 'ru';
    let cleanType = reportType;

    if (reportType.endsWith('-en')) {
        language = 'en';
        cleanType = reportType.replace('-en', '');
    } else if (reportType.endsWith('-ar')) {
        language = 'ar';
        cleanType = reportType.replace('-ar', '');
    }

    console.log(`📋 Получаем шаблон: тип=${cleanType}, язык=${language}`);

    // Выбираем нужный шаблон
    let template: ReportTemplate | undefined;
    switch (cleanType) {
        case 'marketing':
            template = MARKETING_TEMPLATES[language];
            break;
        case 'sales':
            template = SALES_TEMPLATES[language];
            break;
        case 'financial':
            template = FINANCIAL_TEMPLATES[language];
            break;
        case 'analytics':
            template = ANALYTICS_TEMPLATES[language];
            break;
        default:
            console.warn(`⚠️ Неизвестный тип отчета: ${cleanType}`);
            return null;
    }

    if (!template) {
        console.warn(`⚠️ Шаблон не найден для: ${cleanType}-${language}`);
        return null;
    }

    // Создаем DSL структуру
    const langConfig = getLanguageConfig(language);
    const isRTL = langConfig.direction === 'rtl';

    const dsl = {
        template: 'default',
        defaultFont: langConfig.font,
        defaultDirection: langConfig.direction,
        pages: [{
            elements: [
                // Заголовок
                {
                    type: 'text',
                    content: template.title,
                    position: { x: 50, y: 100 },
                    style: {
                        fontSize: 24,
                        color: '#2C3E50',
                        font: langConfig.font,
                        width: 495,
                        align: 'center',
                        direction: langConfig.direction
                    }
                },
                // Описание
                {
                    type: 'text',
                    content: template.description,
                    position: { x: 50, y: 150 },
                    style: {
                        fontSize: 14,
                        color: '#7F8C8D',
                        font: langConfig.font,
                        width: 495,
                        align: isRTL ? 'right' : 'center',
                        direction: langConfig.direction
                    }
                },
                // Основной контент
                {
                    type: 'text',
                    content: template.content,
                    position: { x: 50, y: 200 },
                    style: {
                        fontSize: 11,
                        color: '#2C3E50',
                        font: langConfig.font,
                        width: 495,
                        lineBreak: true,
                        align: isRTL ? 'right' : 'left',
                        direction: langConfig.direction
                    }
                }
            ] as any[]
        }]
    };

    // Добавляем графики
    let chartY = 480;
    template.charts.forEach((chart: ChartData) => {
        // Применяем правильные настройки для RTL
        if (isRTL) {
            chart.options = {
                ...chart.options,
                rtl: true,
                font: { family: langConfig.font }
            };
            chart.textDirection = 'rtl';
        }

        dsl.pages[0].elements.push({
            type: 'chart',
            content: chart,
            position: { x: 50, y: chartY },
            style: {
                width: 495,
                height: 250,
                backgroundColor: '#FFFFFF',
                borderColor: '#E0E0E0',
                direction: langConfig.direction
            }
        });

        chartY += 280; // Смещение для следующего графика
    });

    console.log(`✅ Шаблон сгенерирован с ${template.charts.length} графиками`);
    return dsl;
}