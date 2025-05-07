import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import schema from '../schema/dsl-schema.json';
import { DSLDocument, ValidationResult } from '../types';

// Create validator
const ajv = new Ajv({ allErrors: true });
addFormats(ajv);
const validate = ajv.compile(schema);

/**
 * Validates a DSL document against the schema
 * @param dslDocument - The DSL document to validate
 * @returns Validation result with errors if any
 */
export function validateDSL(dslDocument: DSLDocument): ValidationResult {
    const valid = validate(dslDocument);

    if (!valid && validate.errors) {
        return {
            valid: false,
            errors: validate.errors.map(error => {
                const path = error.instancePath || '';
                const message = error.message || 'Unknown error';
                return `${path} ${message}`;
            })
        };
    }

    return { valid: true };
}