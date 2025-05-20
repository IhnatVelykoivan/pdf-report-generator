# PDF Renderer Service

A Node.js/TypeScript service to convert Domain-Specific Language (DSL) to PDF documents with multilingual support.

## Features

- Converts DSL code to PDF documents
- Full multilingual support (including RTL languages like Arabic)
- Supports templates, text, images, and charts
- Returns rendered PDF pages as images for validation
- Comprehensive error handling and reporting for malformed DSL

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation and Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/pdf-renderer.git
cd pdf-renderer

# Install dependencies
npm install

# Build the service
npm run build

# Start the development server
npm run dev

# Run API tests
npm run test-api
```

## API Documentation

### Check Service Health
GET /api/health

**Response:**
```json
{
  "status": "ok",
  "service": "pdf-renderer",
  "timestamp": "2023-05-25T12:34:56.789Z"
}
```

### Get Available Templates
GET /api/templates

**Response:**
```json
{
  "templates": [
    {
      "id": "default",
      "name": "Default",
      "description": "Template with a4 page size"
    },
    {
      "id": "minimal",
      "name": "Minimal",
      "description": "Template with a4 page size"
    }
  ]
}
```

### Render DSL to PDF
POST /api/render

**Request Body:**
```json
{
  "dsl": {
    "template": "default",
    "pages": [
      {
        "elements": [
          {
            "type": "text",
            "content": "Hello, World!",
            "position": { "x": 50, "y": 50 },
            "style": {
              "fontSize": 24,
              "color": "#000000"
            }
          }
        ]
      }
    ]
  }
}
```

**Response:**
PDF file (application/pdf)

### Render DSL to Images
POST /api/render-images

**Request Body:**
```json
{
  "dsl": {
    "template": "default",
    "pages": [
      {
        "elements": [
          {
            "type": "text",
            "content": "Hello, World!",
            "position": { "x": 50, "y": 50 },
            "style": {
              "fontSize": 24,
              "color": "#000000"
            }
          }
        ]
      }
    ]
  },
  "dpi": 300
}
```

**Response:**
```json
{
  "success": true,
  "message": "PDF rendered to images successfully",
  "images": [
    "data:image/png;base64,..."
  ]
}
```

## Multilingual Support

The service supports both Left-to-Right (LTR) and Right-to-Left (RTL) languages:

- English, Spanish, French, German, and other LTR languages
- Arabic, Hebrew, Persian, and other RTL languages

Example DSL for multilingual content:

```json
{
  "template": "default",
  "defaultFont": "NotoSansArabic",
  "pages": [
    {
      "elements": [
        {
          "type": "text",
          "content": "English text (Left to Right)",
          "position": { "x": 50, "y": 50 },
          "style": {
            "fontSize": 16
          }
        },
        {
          "type": "text",
          "content": "النص العربي (من اليمين إلى اليسار)",
          "position": { "x": 50, "y": 100 },
          "style": {
            "fontSize": 16,
            "direction": "rtl"
          }
        }
      ]
    }
  ]
}
```

## Development

```bash
# Run in development mode with hot-reloading
npm run dev

# Build the service
npm run build

# Run tests
npm test

# Run API tests specifically
npm run test-api

# Run linting
npm run lint
```

## License
This project is licensed under the MIT License - see the LICENSE file for details.