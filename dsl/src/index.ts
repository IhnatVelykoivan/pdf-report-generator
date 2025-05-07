// Export types
export * from './types';

// Export validation functions
export * from './validation';

// Export parser functions
export * from './parser';

// For convenience, re-export sample DSL
import simpleReportExample from './examples/simple-report.json';
export const examples = {
    simpleReport: simpleReportExample
};