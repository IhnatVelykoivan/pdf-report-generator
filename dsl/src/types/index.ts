/**
 * Core types for the PDF Report Generation DSL
 */

// Document structure
export interface Document {
    title: string;
    author?: string;
    createdAt?: string; // ISO date string
    pages: Page[];
}

// Page types
export type Page = TitlePage | ContentPage;

export interface BasePage {
    type: string;
    margin?: Margin;
}

export interface TitlePage extends BasePage {
    type: 'titlePage';
    content: TitlePageContent;
}

export interface ContentPage extends BasePage {
    type: 'contentPage';
    header?: Header;
    footer?: Footer;
    content: ContentElement[];
}

export interface TitlePageContent {
    title: string;
    subtitle?: string;
    date?: string;
    logo?: Image;
}

// Header and Footer
export interface Header {
    text?: string;
    image?: Image;
    alignment?: Alignment;
}

export interface Footer {
    text?: string;
    pageNumber?: boolean;
    alignment?: Alignment;
}

// Content elements
export type ContentElement =
    | TextElement
    | ImageElement
    | ChartElement
    | TableElement
    | SpacerElement;

// Text elements
export interface TextElement {
    type: 'heading' | 'paragraph' | 'list';
    text: string;
    level?: number; // For headings (1-6)
    style?: TextStyle;
    alignment?: Alignment;
}

export interface TextStyle {
    fontFamily?: string;
    fontSize?: number;
    fontWeight?: 'normal' | 'bold';
    fontStyle?: 'normal' | 'italic';
    color?: string; // hex color code
    backgroundColor?: string; // hex color code
}

// Image element
export interface ImageElement {
    type: 'image';
    url: string;
    alt?: string;
    width?: number | string; // Pixels or percentage
    height?: number | string; // Pixels or percentage
    alignment?: Alignment;
}

// Chart element
export interface ChartElement {
    type: 'chart';
    chartType: 'bar' | 'line' | 'pie' | 'scatter';
    title?: string;
    width?: number | string; // Pixels or percentage
    height?: number | string; // Pixels or percentage
    data: ChartData;
}

export interface ChartData {
    labels: string[];
    datasets: ChartDataset[];
}

export interface ChartDataset {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
}

// Table element
export interface TableElement {
    type: 'table';
    headers?: string[];
    rows: Array<string[]>;
    style?: TableStyle;
}

export interface TableStyle {
    headerBackgroundColor?: string;
    headerTextColor?: string;
    alternateRowColors?: [string, string];
    borderColor?: string;
}

// Spacer element
export interface SpacerElement {
    type: 'spacer';
    height: number; // In pixels
}

// Common types
export interface Image {
    url: string;
    alt?: string;
    width?: number | string;
    height?: number | string;
}

export interface Margin {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
}

export type Alignment = 'left' | 'center' | 'right' | 'justify';

// Full DSL document
export interface DSLDocument {
    document: Document;
}

// Validation result
export interface ValidationResult {
    valid: boolean;
    errors?: string[];
}