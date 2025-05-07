import { DSLDocument } from '../types';
import { validateDSL } from '../validation';

/**
 * Parses a DSL string into a validated DSL document
 * @param dslString - JSON string containing the DSL
 * @returns Parsed and validated DSL document
 * @throws Error if parsing fails or validation fails
 */
export function parseDSL(dslString: string): DSLDocument {
    try {
        // Parse JSON string
        const dslDocument = JSON.parse(dslString) as DSLDocument;

        // Validate the document
        const validationResult = validateDSL(dslDocument);

        if (!validationResult.valid) {
            throw new Error(`DSL validation failed: ${validationResult.errors?.join(', ')}`);
        }

        return dslDocument;
    } catch (error) {
        if (error instanceof SyntaxError) {
            throw new Error(`Failed to parse DSL JSON: ${error.message}`);
        }
        throw error;
    }
}