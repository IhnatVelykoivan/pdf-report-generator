// Новый компонент: frontend/src/components/MobileMenu.tsx

import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { type SupportedLanguage } from '../config/languages';

interface MobileMenuProps {
    language: SupportedLanguage;
    setLanguage: (lang: SupportedLanguage) => void;
    translations: any;
}

const MobileMenu = ({ language, setLanguage, translations }: MobileMenuProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();
    const t = translations[language];

    // Блокируем скролл body когда меню открыто
    useEffect(() => {
        if (isOpen) {
            document.body.classList.add('mobile-menu-open');
        } else {
            document.body.classList.remove('mobile-menu-open');
        }

        // Cleanup при размонтировании
        return () => {
            document.body.classList.remove('mobile-menu-open');
        };
    }, [isOpen]);

    // Закрываем меню при изменении роута
    useEffect(() => {
        setIsOpen(false);
    }, [location.pathname]);

    const toggleMenu = () => setIsOpen(!isOpen);

    const handleLinkClick = () => {
        setIsOpen(false);
    };

    return (
        <>
            {/* Кнопка бургер-меню */}
            <button
                className="mobile-menu-toggle"
                onClick={toggleMenu}
                aria-label="Toggle menu"
            >
                <span className={`burger-line ${isOpen ? 'open' : ''}`}></span>
                <span className={`burger-line ${isOpen ? 'open' : ''}`}></span>
                <span className={`burger-line ${isOpen ? 'open' : ''}`}></span>
            </button>

            {/* Мобильное меню */}
            <div className={`mobile-menu ${isOpen ? 'open' : ''}`}>
                <div className="mobile-menu-content">
                    {/* Навигация */}
                    <nav className="mobile-nav">
                        <Link
                            to="/"
                            className={`mobile-nav-link ${location.pathname === '/' ? 'active' : ''}`}
                            onClick={handleLinkClick}
                        >
                            🏠 {t.home}
                        </Link>
                        <Link
                            to="/conversation"
                            className={`mobile-nav-link ${location.pathname === '/conversation' ? 'active' : ''}`}
                            onClick={handleLinkClick}
                        >
                            💬 {t.chat}
                        </Link>
                        <Link
                            to="/preview"
                            className={`mobile-nav-link ${location.pathname === '/preview' ? 'active' : ''}`}
                            onClick={handleLinkClick}
                        >
                            👁️ {t.preview}
                        </Link>
                    </nav>

                    {/* Выбор языка */}
                    <div className="mobile-language-selector">
                        <h3>Language / Язык / اللغة</h3>
                        <div className="mobile-lang-buttons">
                            <button
                                className={`mobile-lang-btn ${language === 'en' ? 'active' : ''}`}
                                onClick={() => {
                                    setLanguage('en');
                                    handleLinkClick();
                                }}
                            >
                                🇬🇧 English
                            </button>
                            <button
                                className={`mobile-lang-btn ${language === 'ru' ? 'active' : ''}`}
                                onClick={() => {
                                    setLanguage('ru');
                                    handleLinkClick();
                                }}
                            >
                                🇷🇺 Русский
                            </button>
                            <button
                                className={`mobile-lang-btn ${language === 'ar' ? 'active' : ''}`}
                                onClick={() => {
                                    setLanguage('ar');
                                    handleLinkClick();
                                }}
                            >
                                🇸🇦 العربية
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Оверлей */}
            {isOpen && (
                <div
                    className="mobile-menu-overlay"
                    onClick={toggleMenu}
                    aria-hidden="true"
                />
            )}
        </>
    );
};

export default MobileMenu;