/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_PDF_API_URL: string
    readonly VITE_CLAUDE_API_KEY: string
    readonly VITE_OPENAI_API_KEY: string
    readonly VITE_LLM_TYPE: string
    readonly VITE_APP_NAME: string
}

interface ImportMeta {
    readonly env: ImportMeta
}