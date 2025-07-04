// frontend/src/components/JsonEditor.tsx

import { useState, useEffect } from 'react';

interface JsonEditorProps {
    initialValue: any;
    onChange: (value: any) => void;
    height?: string;
}

const JsonEditor = ({ initialValue, onChange, height = '600px' }: JsonEditorProps) => {
    const [value, setValue] = useState('');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Форматируем JSON для отображения
        try {
            setValue(JSON.stringify(initialValue, null, 2));
            setError(null);
        } catch (e) {
            setError('Invalid JSON structure');
        }
    }, [initialValue]);

    const handleChange = (newValue: string) => {
        setValue(newValue);

        // Проверяем валидность JSON
        try {
            const parsed = JSON.parse(newValue);
            setError(null);
            onChange(parsed);
        } catch (e) {
            setError('Invalid JSON: ' + (e as Error).message);
        }
    };

    return (
        <div className="json-editor-container">
            <div className="json-editor-header">
                <h3>DSL Editor</h3>
                {error && <span className="json-error">{error}</span>}
            </div>
            <textarea
                className={`json-editor ${error ? 'has-error' : ''}`}
                value={value}
                onChange={(e) => handleChange(e.target.value)}
                style={{ height }}
                spellCheck={false}
            />
        </div>
    );
};

export default JsonEditor;