import { parseDSL } from '../src/parser';

describe('DSL Parser', () => {
    test('should parse valid DSL JSON string', () => {
        const dslString = JSON.stringify({
            document: {
                title: 'Test Document',
                pages: [
                    {
                        type: 'titlePage',
                        content: {
                            title: 'Title Page'
                        }
                    }
                ]
            }
        });

        const result = parseDSL(dslString);
        expect(result.document.title).toBe('Test Document');
        expect(result.document.pages.length).toBe(1);
        expect(result.document.pages[0].type).toBe('titlePage');
    });

    test('should throw error for invalid JSON', () => {
        const invalidJson = '{document: {title: "Missing quotes"}}';

        expect(() => {
            parseDSL(invalidJson);
        }).toThrow('Failed to parse DSL JSON');
    });

    test('should throw error for valid JSON but invalid DSL', () => {
        const invalidDsl = JSON.stringify({
            document: {
                // Missing required title
                pages: [
                    {
                        type: 'unknownPageType', // Invalid page type
                        content: {}
                    }
                ]
            }
        });

        expect(() => {
            parseDSL(invalidDsl);
        }).toThrow('DSL validation failed');
    });
});