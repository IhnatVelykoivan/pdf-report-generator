import { Link, useLocation } from 'react-router-dom';
import { useState, createContext, useContext } from 'react';
import type { SupportedLanguage } from '../config/languages';

interface LanguageContextType {
    language: SupportedLanguage;
    setLanguage: (lang: SupportedLanguage) => void;
}

const LanguageContext = createContext<LanguageContextType>({
    language: 'ru',
    setLanguage: () => {}
});

export const useLanguage = () => useContext(LanguageContext);

interface LayoutProps {
    children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
    const location = useLocation();
    const [language, setLanguage] = useState<SupportedLanguage>('ru');

    // Переводы для навигации
    const navTranslations = {
        ru: {
            title: 'PDF Генератор Отчётов',
            home: 'Главная',
            chat: 'Чат',
            preview: 'Просмотр'
        },
        en: {
            title: 'PDF Report Generator',
            home: 'Home',
            chat: 'Chat',
            preview: 'Preview'
        },
        ar: {
            title: 'مولد تقارير PDF',
            home: 'الرئيسية',
            chat: 'محادثة',
            preview: 'معاينة'
        }
    };

    const t = navTranslations[language];

    return (
        <LanguageContext.Provider value={{ language, setLanguage }}>
            <div className="min-h-screen bg-gray-50">
                <nav className="bg-white shadow-sm border-b">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between h-16">
                            <div className="flex">
                                <Link to="/" className="flex items-center px-4 text-lg font-semibold text-gray-900 hover:text-blue-600">
                                    📄 {t.title}
                                </Link>
                            </div>
                            <div className="flex items-center space-x-4">
                                <div className="flex space-x-8">
                                    <Link
                                        to="/"
                                        className={`inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors ${
                                            location.pathname === '/'
                                                ? 'text-blue-600 border-b-2 border-blue-600'
                                                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                    >
                                        🏠 {t.home}
                                    </Link>
                                    <Link
                                        to="/conversation"
                                        className={`inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors ${
                                            location.pathname === '/conversation'
                                                ? 'text-blue-600 border-b-2 border-blue-600'
                                                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                    >
                                        💬 {t.chat}
                                    </Link>
                                    <Link
                                        to="/preview"
                                        className={`inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors ${
                                            location.pathname === '/preview'
                                                ? 'text-blue-600 border-b-2 border-blue-600'
                                                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                    >
                                        👁️ {t.preview}
                                    </Link>
                                </div>
                                <div className="language-selector-nav">
                                    <button
                                        className={`lang-button-nav ${language === 'en' ? 'active' : ''}`}
                                        onClick={() => setLanguage('en')}
                                    >
                                        🇬🇧 EN
                                    </button>
                                    <button
                                        className={`lang-button-nav ${language === 'ru' ? 'active' : ''}`}
                                        onClick={() => setLanguage('ru')}
                                    >
                                        🇷🇺 RU
                                    </button>
                                    <button
                                        className={`lang-button-nav ${language === 'ar' ? 'active' : ''}`}
                                        onClick={() => setLanguage('ar')}
                                    >
                                        🇸🇦 AR
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </nav>
                <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                    <div className="px-4 py-6 sm:px-0">
                        {children}
                    </div>
                </main>
            </div>
        </LanguageContext.Provider>
    );
};

export default Layout;