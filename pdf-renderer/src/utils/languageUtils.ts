// pdf-renderer/src/utils/languageUtils.ts

export type SupportedLanguage = 'ru' | 'en' | 'ar';

export interface LanguageConfig {
    code: SupportedLanguage;
    name: string;
    direction: 'ltr' | 'rtl';
    font: string;
    align: 'left' | 'right' | 'center';
}

export const LANGUAGES: Record<SupportedLanguage, LanguageConfig> = {
    ru: {
        code: 'ru',
        name: 'Русский',
        direction: 'ltr',
        font: 'DejaVuSans',
        align: 'left'
    },
    en: {
        code: 'en',
        name: 'English',
        direction: 'ltr',
        font: 'DejaVuSans',
        align: 'left'
    },
    ar: {
        code: 'ar',
        name: 'العربية',
        direction: 'rtl',
        font: 'DejaVuSans',
        align: 'right'
    }
};

export const REPORT_TITLES: Record<string, Record<SupportedLanguage, string>> = {
    'ai-generated': {
        ru: 'ИИ Отчёт',
        en: 'AI Report',
        ar: 'تقرير الذكاء الاصطناعي'
    },
    'marketing': {
        ru: 'Маркетинговый отчёт',
        en: 'Marketing Report',
        ar: 'تقرير التسويق'
    },
    'sales': {
        ru: 'Отчёт по продажам',
        en: 'Sales Report',
        ar: 'تقرير المبيعات'
    },
    'financial': {
        ru: 'Финансовый отчёт',
        en: 'Financial Report',
        ar: 'التقرير المالي'
    },
    'analytics': {
        ru: 'Аналитический отчёт',
        en: 'Analytics Report',
        ar: 'تقرير التحليلات'
    },
    'general': {
        ru: 'Общий отчёт',
        en: 'General Report',
        ar: 'التقرير العام'
    }
};

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

// Утилитарные функции
export const detectLanguage = (text: string): SupportedLanguage => {
    if (/[\u0600-\u06FF]/.test(text)) return 'ar';
    if (/[а-яё]/i.test(text)) return 'ru';
    return 'en';
};

export const detectReportType = (text: string): string => {
    const lower = text.toLowerCase();
    if (lower.includes('маркетинг') || lower.includes('marketing') || lower.includes('تسويق')) {
        return 'marketing';
    }
    if (lower.includes('продаж') || lower.includes('sales') || lower.includes('مبيعات')) {
        return 'sales';
    }
    if (lower.includes('финанс') || lower.includes('financial') || lower.includes('مالي')) {
        return 'financial';
    }
    if (lower.includes('аналитик') || lower.includes('analytics') || lower.includes('تحليل')) {
        return 'analytics';
    }
    return 'general';
};

export const getReportTitle = (reportType: string, lang: SupportedLanguage): string => {
    const cleanType = reportType.replace(/-en$|-ar$/, '');
    return REPORT_TITLES[cleanType]?.[lang] || REPORT_TITLES['general'][lang];
};

export const getLanguageConfig = (lang: SupportedLanguage): LanguageConfig => {
    return LANGUAGES[lang];
};

export const getLanguageFromReportType = (reportType: string): SupportedLanguage => {
    if (reportType.endsWith('-en')) return 'en';
    if (reportType.endsWith('-ar')) return 'ar';
    return 'ru';
};

// Дополнительная функция для получения локализованного типа отчёта
export const getLocalizedReportType = (reportType: string, language: SupportedLanguage): string => {
    const translations: Record<SupportedLanguage, Record<string, string>> = {
        ar: {
            marketing: 'تقرير تسويقي',
            sales: 'تقرير المبيعات',
            financial: 'تقرير مالي',
            analytics: 'تقرير تحليلي',
            general: 'تقرير عام',
            'ai-generated': 'تقرير ذكاء اصطناعي'
        },
        en: {
            marketing: 'marketing report',
            sales: 'sales report',
            financial: 'financial report',
            analytics: 'analytics report',
            general: 'general report',
            'ai-generated': 'AI-generated report'
        },
        ru: {
            marketing: 'маркетинговый отчёт',
            sales: 'отчёт по продажам',
            financial: 'финансовый отчёт',
            analytics: 'аналитический отчёт',
            general: 'общий отчёт',
            'ai-generated': 'ИИ-сгенерированный отчёт'
        }
    };

    return translations[language]?.[reportType] || translations[language]?.general || reportType;
};