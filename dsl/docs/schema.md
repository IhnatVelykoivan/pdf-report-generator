# PDF Report Generation DSL Schema Documentation

This document provides a detailed explanation of the DSL (Domain-Specific Language) schema used for defining PDF reports in the PDF Report Generation System.

## Document Structure

At the root level, a DSL document contains a single `document` object:

```json
{
  "document": {
    "title": "Document Title",
    "author": "Document Author",
    "createdAt": "2023-09-30T14:30:00Z",
    "pages": [
      // Array of page objects
    ]
  }
}
```

### Document Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `title` | String | Yes | The title of the document |
| `author` | String | No | The author of the document |
| `createdAt` | String (ISO date) | No | The creation date of the document |
| `pages` | Array | Yes | Array of page objects that make up the document |

## Page Types

There are two types of pages available:

1. Title Page - Used for the cover of a document
2. Content Page - Used for regular document content

### Title Page

```json
{
  "type": "titlePage",
  "margin": {
    "top": 50,
    "right": 50,
    "bottom": 50,
    "left": 50
  },
  "content": {
    "title": "Main Document Title",
    "subtitle": "Document Subtitle",
    "date": "September 30, 2023",
    "logo": {
      "url": "https://example.com/logo.png",
      "width": 200,
      "height": 100
    }
  }
}
```

#### Title Page Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `type` | String | Yes | Must be "titlePage" |
| `margin` | Object | No | Page margins in pixels |
| `content` | Object | Yes | The content of the title page |
| `content.title` | String | Yes | The main title to display |
| `content.subtitle` | String | No | A subtitle to display |
| `content.date` | String | No | The date to display |
| `content.logo` | Object | No | Logo image to display |

### Content Page

```json
{
  "type": "contentPage",
  "margin": {
    "top": 50,
    "right": 50,
    "bottom": 50,
    "left": 50
  },
  "header": {
    "text": "Document Title",
    "alignment": "center"
  },
  "footer": {
    "text": "Confidential",
    "pageNumber": true,
    "alignment": "center"
  },
  "content": [
    // Array of content elements
  ]
}
```

#### Content Page Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `type` | String | Yes | Must be "contentPage" |
| `margin` | Object | No | Page margins in pixels |
| `header` | Object | No | Page header configuration |
| `footer` | Object | No | Page footer configuration |
| `content` | Array | Yes | Array of content elements |

## Content Elements

Content elements are the building blocks of a content page. The following types are available:

### Text Elements

#### Heading

```json
{
  "type": "heading",
  "text": "Section Title",
  "level": 1,
  "style": {
    "fontFamily": "Arial",
    "fontSize": 18,
    "fontWeight": "bold",
    "color": "#000000"
  },
  "alignment": "left"
}
```

#### Paragraph

```json
{
  "type": "paragraph",
  "text": "This is a paragraph of text that can be quite long and will automatically wrap within the page margins.",
  "style": {
    "fontFamily": "Times New Roman",
    "fontSize": 12,
    "fontStyle": "normal",
    "color": "#333333"
  },
  "alignment": "justify"
}
```

### Image Element

```json
{
  "type": "image",
  "url": "https://example.com/image.jpg",
  "alt": "Description of image",
  "width": "80%",
  "height": 300,
  "alignment": "center"
}
```

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `type` | String | Yes | Must be "image" |
| `url` | String | Yes | URL of the image |
| `alt` | String | No | Alternative text description |
| `width` | Number or String | No | Width in pixels or percentage |
| `height` | Number or String | No | Height in pixels or percentage |
| `alignment` | String | No | How to align the image: "left", "center", or "right" |

### Chart Element

```json
{
  "type": "chart",
  "chartType": "bar",
  "title": "Sales by Quarter",
  "width": "90%",
  "height": 400,
  "data": {
    "labels": ["Q1", "Q2", "Q3", "Q4"],
    "datasets": [
      {
        "label": "2022",
        "data": [120, 150, 180, 190],
        "backgroundColor": "#4285F4"
      },
      {
        "label": "2023",
        "data": [150, 170, 200, 220],
        "backgroundColor": "#34A853"
      }
    ]
  }
}
```

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `type` | String | Yes | Must be "chart" |
| `chartType` | String | Yes | Type of chart: "bar", "line", "pie", or "scatter" |
| `title` | String | No | Title to display above the chart |
| `width` | Number or String | No | Width in pixels or percentage |
| `height` | Number or String | No | Height in pixels |
| `data` | Object | Yes | Data for the chart |
| `data.labels` | Array | Yes | Labels for data points |
| `data.datasets` | Array | Yes | Datasets for the chart |

### Table Element

```json
{
  "type": "table",
  "headers": ["Product", "Q1 Sales", "Q2 Sales", "Q3 Sales"],
  "rows": [
    ["Product A", "$10,000", "$12,000", "$15,000"],
    ["Product B", "$8,000", "$9,000", "$10,000"],
    ["Product C", "$5,000", "$7,000", "$8,000"]
  ],
  "style": {
    "headerBackgroundColor": "#4285F4",
    "headerTextColor": "#FFFFFF",
    "alternateRowColors": ["#F8F9FA", "#FFFFFF"],
    "borderColor": "#DADCE0"
  }
}
```

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `type` | String | Yes | Must be "table" |
| `headers` | Array | No | Column headers |
| `rows` | Array | Yes | Table data as arrays of strings |
| `style` | Object | No | Styling options for the table |

### Spacer Element

```json
{
  "type": "spacer",
  "height": 20
}
```

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `type` | String | Yes | Must be "spacer" |
| `height` | Number | Yes | Height in pixels |

## Common Types

### Margin

```json
{
  "top": 50,
  "right": 50,
  "bottom": 50,
  "left": 50
}
```

All values are in pixels and optional. Default margins will be used if not specified.

### Alignment

String enum with the following values:
- `"left"` - Align content to the left
- `"center"` - Center content
- `"right"` - Align content to the right
- `"justify"` - Justify text content (for paragraphs only)

### Text Style

```json
{
  "fontFamily": "Arial",
  "fontSize": 12,
  "fontWeight": "normal",
  "fontStyle": "normal",
  "color": "#000000",
  "backgroundColor": "#FFFFFF"
}
```

All properties are optional and will use default values if not specified.