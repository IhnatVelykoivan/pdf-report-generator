import { validateDSL } from '../src/validation';
import { DSLDocument } from '../src/types';

describe('DSL Validation', () => {
    test('should validate a correct DSL document', () => {
        const validDocument: DSLDocument = {
            document: {
                title: 'Test Document',
                pages: [
                    {
                        type: 'titlePage',
                        content: {
                            title: 'Title Page'
                        }
                    },
                    {
                        type: 'contentPage',
                        content: [
                            {
                                type: 'heading',
                                text: 'Heading',
                                level: 1
                            },
                            {
                                type: 'paragraph',
                                text: 'This is a paragraph'
                            }
                        ]
                    }
                ]
            }
        };

        const result = validateDSL(validDocument);
        expect(result.valid).toBe(true);
        expect(result.errors).toBeUndefined();
    });

    test('should fail validation for an incorrect DSL document', () => {
        // Missing required title field
        const invalidDocument = {
            document: {
                pages: [
                    {
                        type: 'titlePage',
                        content: {
                            // Missing required title field
                            subtitle: 'Subtitle'
                        }
                    }
                ]
            }
        };

        const result = validateDSL(invalidDocument as any);
        expect(result.valid).toBe(false);
        expect(result.errors).toBeDefined();
        expect(result.errors!.length).toBeGreaterThan(0);
    });
});