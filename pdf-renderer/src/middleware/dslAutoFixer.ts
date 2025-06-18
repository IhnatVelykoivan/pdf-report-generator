/**
 * Middleware для автоматического исправления DSL структур
 * Гарантирует правильные шрифты и направление для арабского текста
 *
 * Файл: pdf-renderer/src/middleware/dslAutoFixer.ts
 */

interface DSLElement {
    type: string;
    content: any;
    position?: { x: number; y: number };
    style?: any;
}

interface DSLPage {
    elements: DSLElement[];
    style?: any;
}

interface DSL {
    template?: string;
    defaultDirection?: string;
    pages: DSLPage[];
}

/**
 * ГЛАВНАЯ функция автоматического исправления DSL
 */
export const autoFixDSL = (dsl: any): any => {
    console.log('🔧 НАЧИНАЕМ АВТОМАТИЧЕСКОЕ ИСПРАВЛЕНИЕ DSL...');

    if (!dsl || typeof dsl !== 'object') {
        console.error('❌ Невалидный DSL объект');
        return dsl;
    }

    // Создаем копию DSL для безопасного изменения
    const fixedDSL = JSON.parse(JSON.stringify(dsl));
    let fixesApplied = 0;

    // Проверяем и исправляем каждую страницу
    if (!fixedDSL.pages || !Array.isArray(fixedDSL.pages)) {
        console.warn('⚠️ Нет страниц в DSL');
        return fixedDSL;
    }

    for (let pageIndex = 0; pageIndex < fixedDSL.pages.length; pageIndex++) {
        const page = fixedDSL.pages[pageIndex];

        if (!page.elements || !Array.isArray(page.elements)) {
            continue;
        }

        for (let elementIndex = 0; elementIndex < page.elements.length; elementIndex++) {
            const element = page.elements[elementIndex];

            if (element.type === 'text' && element.content) {
                const fixes = fixTextElement(element, pageIndex + 1, elementIndex + 1);
                fixesApplied += fixes;
            }

            if (element.type === 'chart' && element.content) {
                const fixes = fixChartElement(element, pageIndex + 1, elementIndex + 1);
                fixesApplied += fixes;
            }
        }
    }

    // Проверяем общее направление документа
    const documentFixes = fixDocumentDirection(fixedDSL);
    fixesApplied += documentFixes;

    console.log(`✅ АВТОМАТИЧЕСКОЕ ИСПРАВЛЕНИЕ ЗАВЕРШЕНО. Применено ${fixesApplied} исправлений`);

    return fixedDSL;
};

/**
 * Исправляет текстовый элемент
 */
const fixTextElement = (element: DSLElement, pageNum: number, elementNum: number): number => {
    let fixes = 0;
    const content = String(element.content || '');

    // Проверяем наличие арабских символов
    const hasArabic = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/.test(content);
    const hasRussian = /[а-яё]/i.test(content);

    // Инициализируем style если его нет
    if (!element.style) {
        element.style = {};
        fixes++;
    }

    if (hasArabic) {
        console.log(`🔍 Найден арабский текст на странице ${pageNum}, элемент ${elementNum}: "${content.substring(0, 40)}..."`);

        // ВАЖНО: Используем DejaVuSans (как в рабочем тесте), а не NotoSansArabic
        if (!element.style.font || !['DejaVuSans', 'DejaVuSans-Bold', 'NotoSansArabic'].includes(element.style.font)) {
            console.log(`🔧 ИСПРАВЛЕНИЕ: Установка DejaVuSans для арабского текста (по образцу рабочего теста)`);
            element.style.font = 'DejaVuSans';
            fixes++;
        }

        // Исправляем направление
        if (!element.style.direction || element.style.direction !== 'rtl') {
            console.log(`🔧 ИСПРАВЛЕНИЕ: Установка direction=rtl для арабского текста`);
            element.style.direction = 'rtl';
            fixes++;
        }

        // Исправляем выравнивание
        if (!element.style.align) {
            console.log(`🔧 ИСПРАВЛЕНИЕ: Установка align=right для арабского текста (не было align)`);
            element.style.align = 'right';
            fixes++;
        } else if (element.style.align === 'left') {
            console.log(`🔧 ИСПРАВЛЕНИЕ: Изменение align с left на right для арабского текста`);
            element.style.align = 'right';
            fixes++;
        }
        // Оставляем center как есть, если задан

    } else {
        // Для не-арабского текста
        if (!element.style.font) {
            if (hasRussian) {
                console.log(`🔧 ИСПРАВЛЕНИЕ: Установка DejaVuSans для русского текста`);
                element.style.font = 'DejaVuSans';
            } else {
                console.log(`🔧 ИСПРАВЛЕНИЕ: Установка DejaVuSans для английского текста`);
                element.style.font = 'DejaVuSans';
            }
            fixes++;
        }

        if (!element.style.direction) {
            element.style.direction = 'ltr';
            fixes++;
        }
    }

    return fixes;
};

/**
 * Исправляет элемент графика
 */
const fixChartElement = (element: DSLElement, pageNum: number, elementNum: number): number => {
    let fixes = 0;
    const chart = element.content;

    if (!chart) {
        return fixes;
    }

    // Проверяем заголовок графика
    if (chart.title) {
        const hasArabic = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/.test(chart.title);

        if (hasArabic) {
            console.log(`🔍 Найден арабский заголовок графика на странице ${pageNum}, элемент ${elementNum}: "${chart.title}"`);

            if (!chart.options) {
                chart.options = {};
                fixes++;
            }

            if (!chart.options.rtl) {
                console.log(`🔧 ИСПРАВЛЕНИЕ: Установка rtl=true для графика с арабским заголовком`);
                chart.options.rtl = true;
                fixes++;
            }

            if (!chart.options.font || chart.options.font.family !== 'DejaVuSans') {
                console.log(`🔧 ИСПРАВЛЕНИЕ: Установка DejaVuSans для графика с арабским заголовком`);
                chart.options.font = { family: 'DejaVuSans' };
                fixes++;
            }

            // Добавляем textDirection для совместимости с рабочим тестом
            if (!chart.textDirection) {
                chart.textDirection = 'rtl';
                fixes++;
            }
        }
    }

    // Проверяем подписи данных
    if (chart.data && chart.data.labels && Array.isArray(chart.data.labels)) {
        const hasArabicLabels = chart.data.labels.some((label: string) =>
            typeof label === 'string' && /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/.test(label)
        );

        if (hasArabicLabels) {
            console.log(`🔍 Найдены арабские подписи в графике на странице ${pageNum}, элемент ${elementNum}`);

            if (!chart.options) {
                chart.options = {};
                fixes++;
            }

            if (!chart.options.rtl) {
                console.log(`🔧 ИСПРАВЛЕНИЕ: Установка rtl=true для графика с арабскими подписями`);
                chart.options.rtl = true;
                fixes++;
            }

            if (!chart.options.font || chart.options.font.family !== 'DejaVuSans') {
                console.log(`🔧 ИСПРАВЛЕНИЕ: Установка DejaVuSans для графика с арабскими подписями`);
                chart.options.font = { family: 'DejaVuSans' };
                fixes++;
            }

            // Добавляем textDirection для совместимости с рабочим тестом
            if (!chart.textDirection) {
                chart.textDirection = 'rtl';
                fixes++;
            }
        }
    }

    // Проверяем подписи датасетов
    if (chart.data && chart.data.datasets && Array.isArray(chart.data.datasets)) {
        for (const dataset of chart.data.datasets) {
            if (dataset.label && typeof dataset.label === 'string') {
                const hasArabic = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/.test(dataset.label);

                if (hasArabic) {
                    console.log(`🔍 Найдена арабская подпись датасета: "${dataset.label}"`);

                    if (!chart.options) {
                        chart.options = {};
                        fixes++;
                    }

                    if (!chart.options.rtl) {
                        console.log(`🔧 ИСПРАВЛЕНИЕ: Установка rtl=true для графика с арабской подписью датасета`);
                        chart.options.rtl = true;
                        fixes++;
                    }

                    if (!chart.options.font || chart.options.font.family !== 'DejaVuSans') {
                        console.log(`🔧 ИСПРАВЛЕНИЕ: Установка DejaVuSans для графика с арабской подписью датасета`);
                        chart.options.font = { family: 'DejaVuSans' };
                        fixes++;
                    }

                    // Добавляем textDirection для совместимости с рабочим тестом
                    if (!chart.textDirection) {
                        chart.textDirection = 'rtl';
                        fixes++;
                    }
                }
            }
        }
    }

    return fixes;
};

/**
 * Исправляет общее направление документа
 */
const fixDocumentDirection = (dsl: any): number => {
    let fixes = 0;

    // Анализируем весь текст в документе для определения преобладающего направления
    let arabicTextCount = 0;
    let totalTextElements = 0;

    if (dsl.pages && Array.isArray(dsl.pages)) {
        for (const page of dsl.pages) {
            if (page.elements && Array.isArray(page.elements)) {
                for (const element of page.elements) {
                    if (element.type === 'text' && element.content) {
                        totalTextElements++;
                        const content = String(element.content);
                        if (/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/.test(content)) {
                            arabicTextCount++;
                        }
                    }
                }
            }
        }
    }

    // Если больше 50% текста - арабский, устанавливаем RTL по умолчанию
    if (totalTextElements > 0 && arabicTextCount / totalTextElements > 0.5) {
        if (!dsl.defaultDirection || dsl.defaultDirection !== 'rtl') {
            console.log(`🔧 ИСПРАВЛЕНИЕ: Установка defaultDirection=rtl (арабский текст преобладает: ${arabicTextCount}/${totalTextElements})`);
            dsl.defaultDirection = 'rtl';
            fixes++;
        }
    } else {
        if (!dsl.defaultDirection) {
            console.log(`🔧 ИСПРАВЛЕНИЕ: Установка defaultDirection=ltr по умолчанию`);
            dsl.defaultDirection = 'ltr';
            fixes++;
        }
    }

    // Устанавливаем defaultFont как в рабочем тесте
    if (!dsl.defaultFont) {
        console.log(`🔧 ИСПРАВЛЕНИЕ: Установка defaultFont=DejaVuSans (как в рабочем тесте)`);
        dsl.defaultFont = 'DejaVuSans';
        fixes++;
    }

    return fixes;
};

/**
 * Express middleware для автоматического исправления DSL
 */
export const dslAutoFixerMiddleware = (req: any, res: any, next: any) => {
    if (req.body && req.body.dsl) {
        console.log('🔧 Применяем автоматическое исправление DSL через middleware...');
        req.body.dsl = autoFixDSL(req.body.dsl);
    }
    next();
};