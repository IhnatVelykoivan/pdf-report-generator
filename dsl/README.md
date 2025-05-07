# PDF Report Generation DSL

## Overview

This package defines a Domain-Specific Language (DSL) for describing PDF document structure and content. The DSL is designed to be compact, expressive, and easy to use with LLMs.

## Features

- Document template definitions (title pages, regular pages, headers, footers)
- Text block positioning and styling
- Image insertion with sizing and positioning
- Data visualization support (pie charts, bar charts, plots)
- Validation schema to ensure correctness

## DSL Syntax

The DSL uses a JSON-based format for maximum compatibility. Here's a simple example:

```json
{
  "document": {
    "title": "Quarterly Report",
    "author": "AI Assistant",
    "pages": [
      {
        "type": "titlePage",
        "content": {
          "title": "Q3 Financial Report",
          "subtitle": "Performance Analysis",
          "date": "2023-09-30"
        }
      },
      {
        "type": "contentPage",
        "header": {
          "text": "Quarterly Report - Q3 2023",
          "alignment": "center"
        },
        "content": [
          {
            "type": "heading",
            "text": "Executive Summary",
            "level": 1
          },
          {
            "type": "paragraph",
            "text": "This quarter showed a 15% growth in revenue compared to Q2."
          },
          {
            "type": "chart",
            "chartType": "bar",
            "title": "Quarterly Revenue",
            "data": {
              "labels": ["Q1", "Q2", "Q3"],
              "datasets": [
                {
                  "label": "Revenue (in millions)",
                  "data": [2.3, 2.1, 2.7]
                }
              ]
            }
          }
        ]
      }
    ]
  }
}
```

## Usage

### Installation

```bash
npm install @pdf-report-generator/dsl
```

### Basic Usage

```typescript
import { validateDSL } from '@pdf-report-generator/dsl';

const dslDocument = {
  // Your DSL document here
};

// Validate the DSL
const validationResult = validateDSL(dslDocument);

if (validationResult.valid) {
  console.log('DSL is valid!');
} else {
  console.error('DSL validation errors:', validationResult.errors);
}
```

## Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Build the package
npm run build
```

## DSL Schema Documentation

For complete documentation of the DSL schema, see the [schema documentation](./docs/schema.md).