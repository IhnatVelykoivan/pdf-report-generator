// frontend/src/config/languages.ts

export type SupportedLanguage = 'ru' | 'en' | 'ar';

// Конфигурация быстрых отчетов для UI
// ВСЯ БИЗНЕС-ЛОГИКА ТЕПЕРЬ НА СЕРВЕРЕ!
export const QUICK_REPORT_TYPES = [
    { type: 'marketing', lang: 'ru' as SupportedLanguage, title: '📈 Маркетинг отчёт', description: 'Анализ кампаний и ROI с рекомендациями' },
    { type: 'sales', lang: 'ru' as SupportedLanguage, title: '💰 Отчёт по продажам', description: 'Динамика продаж и прогнозы развития' },
    { type: 'financial', lang: 'ru' as SupportedLanguage, title: '💼 Финансовый отчёт', description: 'Бюджет, расходы и рентабельность' },
    { type: 'analytics', lang: 'ru' as SupportedLanguage, title: '📊 Аналитика', description: 'Глубокий анализ данных и трендов' },
    { type: 'marketing-en', lang: 'en' as SupportedLanguage, title: '📈 Marketing Report', description: 'Campaign analysis and ROI metrics' },
    { type: 'sales-en', lang: 'en' as SupportedLanguage, title: '💰 Sales Report', description: 'Sales dynamics and forecasts' },
    { type: 'financial-en', lang: 'en' as SupportedLanguage, title: '💼 Financial Report', description: 'Budget, expenses and profitability' },
    { type: 'analytics-en', lang: 'en' as SupportedLanguage, title: '📊 Analytics Report', description: 'Deep data analysis and trends' },
    { type: 'marketing-ar', lang: 'ar' as SupportedLanguage, title: '📈 تقرير التسويق', description: 'تحليل الحملات والعائد على الاستثمار' },
    { type: 'sales-ar', lang: 'ar' as SupportedLanguage, title: '💰 تقرير المبيعات', description: 'ديناميكيات المبيعات والتوقعات' },
    { type: 'financial-ar', lang: 'ar' as SupportedLanguage, title: '💼 التقرير المالي', description: 'الميزانية والمصروفات والربحية' },
    { type: 'analytics-ar', lang: 'ar' as SupportedLanguage, title: '📊 تقرير التحليلات', description: 'تحليل عميق للبيانات والاتجاهات' }
];

// Все остальные функции (detectLanguage, getReportTitle и т.д.) удалены
// Теперь они находятся на сервере в pdf-renderer/src/utils/languageUtils.ts