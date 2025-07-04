// pdf-renderer/src/services/dslStorage.ts

interface StoredDSL {
    id: string;
    dsl: any;
    createdAt: Date;
    reportType?: string;
    language?: string;
}

class DSLStorageService {
    private lastGeneratedDSL: StoredDSL | null = null;

    /**
     * Сохраняет DSL последнего сгенерированного отчета
     */
    saveDSL(dsl: any, reportType?: string, language?: string): string {
        const id = Date.now().toString();
        this.lastGeneratedDSL = {
            id,
            dsl,
            createdAt: new Date(),
            reportType,
            language
        };

        console.log(`💾 DSL сохранен с ID: ${id}`);
        return id;
    }

    /**
     * Получает последний сохраненный DSL
     */
    getLastDSL(): StoredDSL | null {
        return this.lastGeneratedDSL;
    }

    /**
     * Очищает сохраненный DSL
     */
    clearDSL(): void {
        this.lastGeneratedDSL = null;
        console.log('🗑️ DSL очищен');
    }
}

export const dslStorage = new DSLStorageService();