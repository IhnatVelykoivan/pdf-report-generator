import { createContext, useContext, useReducer } from 'react';
import type { ReactNode, Dispatch } from 'react';

export interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

export interface ConversationState {
    messages: Message[];
    isLoading: boolean;
    generatedDSL: any | null;
    pdfBlob: Blob | null;
    pdfImages: string[];
    error: string | null;
}

type ConversationAction =
    | { type: 'ADD_MESSAGE'; payload: Message }
    | { type: 'SET_LOADING'; payload: boolean }
    | { type: 'SET_DSL'; payload: any }
    | { type: 'SET_PDF_BLOB'; payload: Blob };

const initialState: ConversationState = {
    messages: [],
    isLoading: false,
    generatedDSL: null,
    pdfBlob: null,
    pdfImages: [],
    error: null,
};

const conversationReducer = (
    state: ConversationState,
    action: ConversationAction
): ConversationState => {
    switch (action.type) {
        case 'ADD_MESSAGE':
            return { ...state, messages: [...state.messages, action.payload] };
        case 'SET_LOADING':
            return { ...state, isLoading: action.payload };
        case 'SET_DSL':
            return { ...state, generatedDSL: action.payload };
        case 'SET_PDF_BLOB':
            return { ...state, pdfBlob: action.payload };
        default:
            return state;
    }
};

const ConversationContext = createContext<{
    state: ConversationState;
    dispatch: Dispatch<ConversationAction>;
} | undefined>(undefined);

interface ConversationProviderProps {
    children: ReactNode;
}

export const ConversationProvider = ({ children }: ConversationProviderProps) => {
    const [state, dispatch] = useReducer(conversationReducer, initialState);

    return (
        <ConversationContext.Provider value={{ state, dispatch }}>
            {children}
        </ConversationContext.Provider>
    );
};

export const useConversation = () => {
    const context = useContext(ConversationContext);
    if (context === undefined) {
        throw new Error('useConversation must be used within a ConversationProvider');
    }
    return context;
};