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
    resetStyle: Joi.boolean().optional()
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
    borderWidth: Joi.number().optional()
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
    backgroundColor: Joi.string().optional()
});

/*** Schema for element validation*/

const elementSchema = Joi.object({
    type: Joi.string().valid('text', 'image', 'chart').required().messages({
        'any.only': 'Element type must be one of: text, image, chart',
        'any.required': 'Element type is required'
    }),
    // Разрешаем любое значение для content, без строгого типа
    content: Joi.any().required().messages({
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
    pages: Joi.array().items(pageSchema).required().messages({
        'array.base': 'Pages must be an array',
        'any.required': 'Pages are required'
    })
});

/*** Validates the DSL input*/

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

    // Return validation result
    if (errors.length > 0) {
        return {
            valid: false,
            errors
        };
    }

    return { valid: true };
};