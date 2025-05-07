# PDF Renderer Service

A Node.js/TypeScript service to convert Domain-Specific Language (DSL) to PDF documents.

## Features

- Converts DSL code to PDF documents
- Supports templates, text, images, and charts
- Returns rendered PDF pages as images for validation
- Comprehensive error handling and reporting for malformed DSL

## API Documentation

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
Response:
PDF file (application/pdf)
Render DSL to Images
POST /api/render-images
Request Body:
json{
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
Response:
json{
  "success": true,
  "message": "PDF rendered to images successfully",
  "images": [
    "data:image/png;base64,..."
  ]
}
```

Getting Started
Prerequisites

Node.js (v14 or higher)
npm or yarn

# Installation
bash# Clone the repository
git clone https://github.com/yourusername/pdf-renderer.git
cd pdf-renderer


# Install dependencies
npm install


# Build the service
npm run build


# Start the service
npm start


# Development
Run in development mode with hot-reloading
npm run dev


# Run tests
npm test

License
This project is licensed under the MIT License - see the LICENSE file for details.