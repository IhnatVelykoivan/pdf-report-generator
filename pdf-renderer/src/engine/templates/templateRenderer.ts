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
        margins: { top: 70, bottom: 70, left: 50, right: 50 },
        header: {
            text: 'Generated Document',
            height: 40
        },
        footer: {
            text: 'Page {{pageNumber}} of {{totalPages}}',
            height: 30
        },
        defaultFontFamily: 'DejaVuSans',
        defaultFontSize: 12,
        defaultTextColor: '#2C3E50'
    },
    'minimal': {
        name: 'Minimal',
        pageSize: 'a4',
        margins: { top: 30, bottom: 30, left: 20, right: 20 },
        defaultFontFamily: 'DejaVuSans',
        defaultFontSize: 10,
        defaultTextColor: '#34495E'
    },
    'report': {
        name: 'Report',
        pageSize: 'letter',
        margins: { top: 80, bottom: 80, left: 60, right: 60 },
        header: {
            text: 'Confidential Report',
            height: 50
        },
        footer: {
            text: 'Generated on {{date}} | Page {{pageNumber}} of {{totalPages}}',
            height: 40
        },
        defaultFontFamily: 'DejaVuSans',
        defaultFontSize: 12,
        defaultTextColor: '#2C3E50'
    },
    'cyrillic': {
        name: 'Cyrillic',
        pageSize: 'a4',
        margins: { top: 70, bottom: 70, left: 50, right: 50 },
        header: {
            text: 'Документ с кириллицей',
            height: 40
        },
        footer: {
            text: 'Страница {{pageNumber}} из {{totalPages}}',
            height: 30
        },
        defaultFontFamily: 'DejaVuSans',
        defaultFontSize: 12,
        defaultTextColor: '#2C3E50'
    }
};

/**
 * Returns a list of available templates
 */
export const getAvailableTemplates = () => {
    return Object.keys(templates).map(key => ({
        id: key,
        name: templates[key].name,
        description: `Template with ${templates[key].pageSize} page size`
    }));
};

/**
 * Simplified template renderer - DOES NOT CREATE PAGES, ONLY LOGS
 */
export const renderTemplate = (doc: PDFKit.PDFDocument, templateName: string): void => {
    // Get template (default to 'default' if not found)
    const template = templates[templateName] || templates['default'];

    // ONLY log template application - DO NOT CREATE PAGES!
    console.log(`Template ${template.name} initialized (no pages created)`);
};

/**
 * Applies template settings to the EXISTING page - DOES NOT CREATE NEW PAGES
 */
export const applyTemplateToPage = (doc: PDFKit.PDFDocument, templateName: string, pageNumber: number, totalPages: number = 1): void => {
    // Get template (default to 'default' if not found)
    const template = templates[templateName] || templates['default'];

    try {
        console.log(`Applying template ${template.name} to existing page ${pageNumber}`);

        // Save current state before applying template
        doc.save();

        // Set default font if specified
        if (template.defaultFontFamily) {
            try {
                doc.font(template.defaultFontFamily);
            } catch (fontError) {
                console.warn(`Template font not found: ${template.defaultFontFamily}, using default font`);
                try {
                    doc.font('DejaVuSans');
                } catch (e) {
                    doc.font('Helvetica');
                }
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

        // Add header if defined - ON EXISTING PAGE
        if (template.header && template.header.text) {
            try {
                doc.font('DejaVuSans');
            } catch (e) {
                doc.font('Helvetica');
            }

            const headerY = 25;

            // Format header text
            const headerText = template.header.text
                .replace('{{pageNumber}}', pageNumber.toString())
                .replace('{{totalPages}}', totalPages.toString())
                .replace('{{date}}', new Date().toLocaleDateString());

            // Add header text
            doc.fontSize(14)
                .fillColor('#34495E')
                .text(headerText, template.margins.left, headerY, {
                    width: doc.page.width - template.margins.left - template.margins.right,
                    align: 'center',
                    lineBreak: false
                });

            // Add line under header
            doc.strokeColor('#BDC3C7')
                .lineWidth(0.5)
                .moveTo(template.margins.left, headerY + 25)
                .lineTo(doc.page.width - template.margins.right, headerY + 25)
                .stroke();
        }

        // Add footer if defined - ON EXISTING PAGE
        if (template.footer && template.footer.text) {
            try {
                doc.font('DejaVuSans');
            } catch (e) {
                doc.font('Helvetica');
            }

            const footerY = doc.page.height - 35;

            // Format footer text
            const footerText = template.footer.text
                .replace('{{pageNumber}}', pageNumber.toString())
                .replace('{{totalPages}}', totalPages.toString())
                .replace('{{date}}', new Date().toLocaleDateString());

            // Add line above footer
            doc.strokeColor('#BDC3C7')
                .lineWidth(0.5)
                .moveTo(template.margins.left, footerY - 10)
                .lineTo(doc.page.width - template.margins.right, footerY - 10)
                .stroke();

            // Add footer text
            doc.fontSize(10)
                .fillColor('#7F8C8D')
                .text(footerText, template.margins.left, footerY, {
                    width: doc.page.width - template.margins.left - template.margins.right,
                    align: 'center',
                    lineBreak: false
                });
        }

        // Restore state after applying template
        doc.restore();

        console.log(`Successfully applied template to page ${pageNumber}`);
    } catch (error) {
        console.error(`Error applying template to page ${pageNumber}:`, error);
    }
};