/**
 * Template configuration interface
 */
interface Template {
    name: string;
    pageSize: [number, number] | string;
    margins: { top: number; bottom: number; left: number; right: number };
    header?: {
        text?: string;
        height: number;
    };
    footer?: {
        text?: string;
        height: number;
    };
    defaultFontFamily?: string;
    defaultFontSize?: number;
    defaultTextColor?: string;
}

/**
 * Map of available templates
 */
const templates: Record<string, Template> = {
    'default': {
        name: 'Default',
        pageSize: 'a4',
        margins: { top: 50, bottom: 50, left: 50, right: 50 },
        header: {
            text: 'Generated Document',
            height: 30
        },
        footer: {
            text: 'Page {{pageNumber}} of {{totalPages}}',
            height: 20
        },
        defaultFontFamily: 'OpenSans',
        defaultFontSize: 12,
        defaultTextColor: '#000000'
    },
    'minimal': {
        name: 'Minimal',
        pageSize: 'a4',
        margins: { top: 20, bottom: 20, left: 20, right: 20 },
        defaultFontFamily: 'OpenSans',
        defaultFontSize: 10,
        defaultTextColor: '#333333'
    },
    'report': {
        name: 'Report',
        pageSize: 'letter',
        margins: { top: 60, bottom: 60, left: 60, right: 60 },
        header: {
            text: 'Confidential Report',
            height: 40
        },
        footer: {
            text: 'Generated on {{date}} | Page {{pageNumber}} of {{totalPages}}',
            height: 30
        },
        defaultFontFamily: 'OpenSans',
        defaultFontSize: 12,
        defaultTextColor: '#000000'
    },
    'cyrillic': {
        name: 'Cyrillic',
        pageSize: 'a4',
        margins: { top: 50, bottom: 50, left: 50, right: 50 },
        header: {
            text: 'Документ с кириллицей',
            height: 30
        },
        footer: {
            text: 'Страница {{pageNumber}} из {{totalPages}}',
            height: 20
        },
        defaultFontFamily: 'OpenSans',
        defaultFontSize: 12,
        defaultTextColor: '#000000'
    }
};

/**
 * Returns list of available templates
 */
export const getAvailableTemplates = () => {
    return Object.keys(templates).map(key => ({
        id: key,
        name: templates[key].name,
        description: `Template with ${templates[key].pageSize} page size`
    }));
};

/**
 * Simplified template renderer
 */
export const renderTemplate = (doc: PDFKit.PDFDocument, templateName: string): void => {
    // Get template (default to 'default' if not found)
    const template = templates[templateName] || templates['default'];

    // Log that template is applied
    console.log(`Applied template: ${template.name}`);
};

/**
 * Apply template settings to a page (to be called after a page is added)
 */
export const applyTemplateToPage = (doc: PDFKit.PDFDocument, templateName: string, pageNumber: number, totalPages: number = 1): void => {
    // Get template (default to 'default' if not found)
    const template = templates[templateName] || templates['default'];

    try {
        // Сохраняем текущее состояние перед применением шаблона
        doc.save();

        // Set default font if specified
        if (template.defaultFontFamily) {
            try {
                doc.font(template.defaultFontFamily);
            } catch (fontError) {
                console.warn(`Template font not found: ${template.defaultFontFamily}, using default instead`);
            }
        }

        // Set default font size
        if (template.defaultFontSize) {
            doc.fontSize(template.defaultFontSize);
        }

        // Set default text color
        if (template.defaultTextColor) {
            doc.fillColor(template.defaultTextColor);
        }

        // Add header if defined
        if (template.header && template.header.text) {
            // Get current position
            const originalY = doc.y;

            // Set position to top of page
            doc.y = template.margins.top / 2;

            // Format header text
            const headerText = template.header.text
                .replace('{{pageNumber}}', pageNumber.toString())
                .replace('{{totalPages}}', totalPages.toString())
                .replace('{{date}}', new Date().toLocaleDateString());

            // Add header text
            doc.fontSize(template.defaultFontSize ? template.defaultFontSize + 2 : 14)
                .text(headerText, template.margins.left, doc.y, {
                    width: doc.page.width - template.margins.left - template.margins.right,
                    align: 'center'
                });

            // Restore position
            doc.y = originalY;
        }

        // Add footer if defined
        if (template.footer && template.footer.text) {
            // Save current position
            const originalY = doc.y;

            // Format footer text
            const footerText = template.footer.text
                .replace('{{pageNumber}}', pageNumber.toString())
                .replace('{{totalPages}}', totalPages.toString())
                .replace('{{date}}', new Date().toLocaleDateString());

            // Add footer
            doc.fontSize(template.defaultFontSize ? template.defaultFontSize - 2 : 10)
                .text(footerText, template.margins.left,
                    doc.page.height - template.margins.bottom - 20, {
                        width: doc.page.width - template.margins.left - template.margins.right,
                        align: 'center'
                    });

            // Restore position
            doc.y = originalY;
        }

        // Восстанавливаем состояние после применения шаблона
        doc.restore();
    } catch (error) {
        console.error('Error applying template to page:', error);
    }
};