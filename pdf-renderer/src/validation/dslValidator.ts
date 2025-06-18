import Joi from 'joi';

/*** Interface for DSL validation result*/

interface ValidationResult {
    valid: boolean;
    errors?: string[];
}

/*** Schema for position validation*/

const positionSchema = Joi.object({
    x: Joi.number().required().messages({
        'number.base': 'Position x must be a number',
        'any.required': 'Position x is required'
    }),
    y: Joi.number().required().messages({
        'number.base': 'Position y must be a number',
        'any.required': 'Position y is required'
    })
});

/*** Schema for text element style validation*/

const textStyleSchema = Joi.object({
    font: Joi.string().optional(),
    fontSize: Joi.number().optional(),
    color: Joi.string().optional(),
    width: Joi.number().optional(),
    align: Joi.string().valid('left', 'center', 'right', 'justify').optional(),
    lineBreak: Joi.boolean().optional(),
    underline: Joi.boolean().optional(),
    paragraphGap: Joi.number().optional(),
    resetStyle: Joi.boolean().optional(),
    // Add support for bidirectional text
    direction: Joi.string().valid('ltr', 'rtl').optional()
});

/*** Schema for image element style validation*/

const imageStyleSchema = Joi.object({
    width: Joi.number().optional(),
    height: Joi.number().optional(),
    align: Joi.string().valid('left', 'center', 'right').optional(),
    valign: Joi.string().valid('top', 'center', 'bottom').optional()
});

/*** Schema for chart element style validation*/

const chartStyleSchema = Joi.object({
    width: Joi.number().optional(),
    height: Joi.number().optional(),
    backgroundColor: Joi.string().optional(),
    borderColor: Joi.string().optional(),
    borderWidth: Joi.number().optional(),
    // Add support for RTL direction in charts
    direction: Joi.string().valid('ltr', 'rtl').optional()
});

/*** Schema for page style validation*/

const pageStyleSchema = Joi.object({
    size: Joi.alternatives().try(
        Joi.string().valid('a4', 'letter', 'legal'),
        Joi.array().length(2).items(Joi.number())
    ).optional(),
    margin: Joi.alternatives().try(
        Joi.number(),
        Joi.object({
            top: Joi.number().optional(),
            bottom: Joi.number().optional(),
            left: Joi.number().optional(),
            right: Joi.number().optional()
        })
    ).optional(),
    backgroundColor: Joi.string().optional(),
    // Add support for specifying default text direction for the page
    direction: Joi.string().valid('ltr', 'rtl').optional()
});

/*** Schema for chart content validation with RTL support*/

const chartContentSchema = Joi.object({
    type: Joi.string().valid('bar', 'line', 'pie').required(),
    title: Joi.string().optional(),
    textDirection: Joi.string().valid('ltr', 'rtl').optional(),
    data: Joi.object({
        labels: Joi.array().items(Joi.string()).required(),
        datasets: Joi.array().items(
            Joi.object({
                label: Joi.string().optional(),
                data: Joi.array().items(Joi.number()).required(),
                backgroundColor: Joi.alternatives().try(
                    Joi.string(),
                    Joi.array().items(Joi.string())
                ).optional(),
                borderColor: Joi.alternatives().try(
                    Joi.string(),
                    Joi.array().items(Joi.string())
                ).optional(),
                borderWidth: Joi.number().optional()
            })
        ).required()
    }).required(),
    options: Joi.object({
        responsive: Joi.boolean().optional(),
        animation: Joi.alternatives().try(
            Joi.boolean(),
            Joi.object({
                duration: Joi.number()
            })
        ).optional(),
        scales: Joi.object().optional(),
        rtl: Joi.boolean().optional(),
        font: Joi.object({
            family: Joi.string().optional(),
            size: Joi.number().optional(),
            style: Joi.string().optional()
        }).optional()
    }).optional()
});

/*** Schema for element validation*/

const elementSchema = Joi.object({
    type: Joi.string().valid('text', 'image', 'chart').required().messages({
        'any.only': 'Element type must be one of: text, image, chart',
        'any.required': 'Element type is required'
    }),
    content: Joi.alternatives().conditional('type', {
        is: 'chart',
        then: chartContentSchema,
        otherwise: Joi.any().required()
    }).required().messages({
        'any.required': 'Element content is required'
    }),
    position: positionSchema.required().messages({
        'any.required': 'Element position is required'
    }),
    style: Joi.alternatives().conditional('type', {
        is: 'text',
        then: textStyleSchema,
        otherwise: Joi.alternatives().conditional('type', {
            is: 'image',
            then: imageStyleSchema,
            otherwise: chartStyleSchema
        })
    }).optional()
});

/*** Schema for page validation*/

const pageSchema = Joi.object({
    elements: Joi.array().items(elementSchema).required().messages({
        'array.base': 'Page elements must be an array',
        'any.required': 'Page elements are required'
    }),
    style: pageStyleSchema.optional()
});

/*** Schema for DSL validation*/

const dslSchema = Joi.object({
    template: Joi.string().optional(),
    // Add support for specifying default font with better Arabic support
    defaultFont: Joi.string().optional(),
    // Add support for specifying default text direction for the entire document
    defaultDirection: Joi.string().valid('ltr', 'rtl').optional(),
    pages: Joi.array().items(pageSchema).required().messages({
        'array.base': 'Pages must be an array',
        'any.required': 'Pages are required'
    })
});

/*** Validates the DSL input с автоматическими исправлениями*/

export const validateDSL = (dsl: any): ValidationResult => {
    // Check if input is undefined or null
    if (!dsl) {
        return {
            valid: false,
            errors: ['DSL input is required']
        };
    }

    // Validate against schema
    const result = dslSchema.validate(dsl, { abortEarly: false });

    if (result.error) {
        return {
            valid: false,
            errors: result.error.details.map(detail => detail.message)
        };
    }

    // Additional custom validations
    const errors: string[] = [];

    // Validate that there's at least one page
    if (!dsl.pages || dsl.pages.length === 0) {
        errors.push('At least one page is required');
    }

    // Validate that each page has at least one element
    for (let i = 0; i < (dsl.pages || []).length; i++) {
        const page = dsl.pages[i];
        if (!page.elements || page.elements.length === 0) {
            errors.push(`Page ${i + 1} must have at least one element`);
        }
    }

    // Validate that chart types are supported
    for (let i = 0; i < (dsl.pages || []).length; i++) {
        const page = dsl.pages[i];
        if (page.elements) {
            for (let j = 0; j < page.elements.length; j++) {
                const element = page.elements[j];
                if (element.type === 'chart' && element.content) {
                    if (!['bar', 'line', 'pie'].includes(element.content.type)) {
                        errors.push(`Chart type '${element.content.type}' on page ${i + 1}, element ${j + 1} is not supported. Supported types are: bar, line, pie`);
                    }
                }
            }
        }
    }

    // 🚨 НОВАЯ КРИТИЧЕСКИ ВАЖНАЯ ПРОВЕРКА: Валидация и автоисправление шрифтов для арабского текста
    console.log('🔍 Запускаем проверку и автоисправление арабского текста в валидаторе...');
    let autoFixesApplied = 0;

    for (let i = 0; i < (dsl.pages || []).length; i++) {
        const page = dsl.pages[i];
        if (page.elements) {
            for (let j = 0; j < page.elements.length; j++) {
                const element = page.elements[j];

                if (element.type === 'text' && element.content) {
                    const content = String(element.content);
                    const hasArabic = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/.test(content);

                    if (hasArabic) {
                        // Проверяем, что для арабского текста задан правильный шрифт
                        if (!element.style) {
                            console.warn(`⚠️ AUTO-FIX: Arabic text on page ${i + 1}, element ${j + 1} missing style configuration, adding style`);
                            element.style = {};
                            autoFixesApplied++;
                        }

                        // Проверяем шрифт (используем DejaVuSans как в рабочем тесте)
                        if (!element.style.font || !['DejaVuSans', 'DejaVuSans-Bold', 'NotoSansArabic'].includes(element.style.font)) {
                            console.warn(`⚠️ AUTO-FIX: Arabic text on page ${i + 1}, element ${j + 1} missing proper font, setting to DejaVuSans (as in working test)`);
                            element.style.font = 'DejaVuSans';
                            autoFixesApplied++;
                        }

                        // Проверяем направление
                        if (!element.style.direction || element.style.direction !== 'rtl') {
                            console.warn(`⚠️ AUTO-FIX: Arabic text on page ${i + 1}, element ${j + 1} missing RTL direction, setting to rtl`);
                            element.style.direction = 'rtl';
                            autoFixesApplied++;
                        }

                        // Проверяем выравнивание
                        if (!element.style.align) {
                            console.warn(`⚠️ AUTO-FIX: Arabic text on page ${i + 1}, element ${j + 1} missing alignment, setting to right`);
                            element.style.align = 'right';
                            autoFixesApplied++;
                        } else if (element.style.align === 'left') {
                            console.warn(`⚠️ AUTO-FIX: Arabic text on page ${i + 1}, element ${j + 1} has left alignment, changing to right`);
                            element.style.align = 'right';
                            autoFixesApplied++;
                        }
                    }
                }

                // Проверяем графики с арабским текстом
                if (element.type === 'chart' && element.content) {
                    const chart = element.content;

                    // Проверяем заголовок
                    if (chart.title) {
                        const hasArabic = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/.test(chart.title);
                        if (hasArabic) {
                            if (!chart.options) {
                                console.warn(`⚠️ AUTO-FIX: Chart with Arabic title on page ${i + 1}, element ${j + 1} missing options, adding RTL support`);
                                chart.options = { rtl: true, font: { family: 'DejaVuSans' } };
                                autoFixesApplied++;
                            } else {
                                if (!chart.options.rtl) {
                                    console.warn(`⚠️ AUTO-FIX: Chart with Arabic title missing RTL flag`);
                                    chart.options.rtl = true;
                                    autoFixesApplied++;
                                }
                                if (!chart.options.font || chart.options.font.family !== 'DejaVuSans') {
                                    console.warn(`⚠️ AUTO-FIX: Chart with Arabic title missing proper font`);
                                    chart.options.font = { family: 'DejaVuSans' };
                                    autoFixesApplied++;
                                }
                            }

                            // Добавляем textDirection как в рабочем тесте
                            if (!chart.textDirection) {
                                console.warn(`⚠️ AUTO-FIX: Chart with Arabic title missing textDirection`);
                                chart.textDirection = 'rtl';
                                autoFixesApplied++;
                            }
                        }
                    }

                    // Проверяем подписи данных
                    if (chart.data && chart.data.labels) {
                        const hasArabicLabels = chart.data.labels.some((label: string) =>
                            /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/.test(label)
                        );

                        if (hasArabicLabels) {
                            if (!chart.options) {
                                console.warn(`⚠️ AUTO-FIX: Chart with Arabic labels missing options, adding RTL support`);
                                chart.options = { rtl: true, font: { family: 'DejaVuSans' } };
                                autoFixesApplied++;
                            } else {
                                if (!chart.options.rtl) {
                                    console.warn(`⚠️ AUTO-FIX: Chart with Arabic labels missing RTL flag`);
                                    chart.options.rtl = true;
                                    autoFixesApplied++;
                                }
                                if (!chart.options.font || chart.options.font.family !== 'DejaVuSans') {
                                    console.warn(`⚠️ AUTO-FIX: Chart with Arabic labels missing proper font`);
                                    chart.options.font = { family: 'DejaVuSans' };
                                    autoFixesApplied++;
                                }
                            }

                            // Добавляем textDirection как в рабочем тесте
                            if (!chart.textDirection) {
                                console.warn(`⚠️ AUTO-FIX: Chart with Arabic labels missing textDirection`);
                                chart.textDirection = 'rtl';
                                autoFixesApplied++;
                            }
                        }
                    }

                    // Проверяем подписи датасетов
                    if (chart.data && chart.data.datasets) {
                        for (const dataset of chart.data.datasets) {
                            if (dataset.label && /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/.test(dataset.label)) {
                                if (!chart.options) {
                                    console.warn(`⚠️ AUTO-FIX: Chart with Arabic dataset label missing options`);
                                    chart.options = { rtl: true, font: { family: 'DejaVuSans' } };
                                    autoFixesApplied++;
                                } else {
                                    if (!chart.options.rtl) {
                                        console.warn(`⚠️ AUTO-FIX: Chart with Arabic dataset label missing RTL flag`);
                                        chart.options.rtl = true;
                                        autoFixesApplied++;
                                    }
                                    if (!chart.options.font || chart.options.font.family !== 'DejaVuSans') {
                                        console.warn(`⚠️ AUTO-FIX: Chart with Arabic dataset label missing proper font`);
                                        chart.options.font = { family: 'DejaVuSans' };
                                        autoFixesApplied++;
                                    }
                                }

                                // Добавляем textDirection как в рабочем тесте
                                if (!chart.textDirection) {
                                    console.warn(`⚠️ AUTO-FIX: Chart with Arabic dataset label missing textDirection`);
                                    chart.textDirection = 'rtl';
                                    autoFixesApplied++;
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    // Проверяем общие настройки документа
    if (!dsl.defaultFont) {
        console.warn(`⚠️ AUTO-FIX: Missing defaultFont, setting to DejaVuSans (as in working test)`);
        dsl.defaultFont = 'DejaVuSans';
        autoFixesApplied++;
    }

    if (!dsl.defaultDirection) {
        // Определяем преобладающее направление
        let arabicElements = 0;
        let totalElements = 0;

        for (const page of dsl.pages || []) {
            for (const element of page.elements || []) {
                if (element.type === 'text' && element.content) {
                    totalElements++;
                    if (/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/.test(element.content)) {
                        arabicElements++;
                    }
                }
            }
        }

        const shouldBeRTL = totalElements > 0 && arabicElements / totalElements > 0.5;
        const direction = shouldBeRTL ? 'rtl' : 'ltr';

        console.warn(`⚠️ AUTO-FIX: Missing defaultDirection, setting to ${direction} (Arabic elements: ${arabicElements}/${totalElements})`);
        dsl.defaultDirection = direction;
        autoFixesApplied++;
    }

    console.log(`✅ DSL validation completed with ${autoFixesApplied} auto-fixes applied`);

    // Return validation result
    if (errors.length > 0) {
        return {
            valid: false,
            errors
        };
    }

    return { valid: true };
};