import { Link, useLocation } from 'react-router-dom';

interface LayoutProps {
    children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
    const location = useLocation();

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex">
                            <Link to="/" className="flex items-center px-4 text-lg font-semibold text-gray-900 hover:text-blue-600">
                                📄 PDF Report Generator
                            </Link>
                        </div>
                        <div className="flex space-x-8">
                            <Link
                                to="/"
                                className={`inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors ${
                                    location.pathname === '/'
                                        ? 'text-blue-600 border-b-2 border-blue-600'
                                        : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                🏠 Home
                            </Link>
                            <Link
                                to="/conversation"
                                className={`inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors ${
                                    location.pathname === '/conversation'
                                        ? 'text-blue-600 border-b-2 border-blue-600'
                                        : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                💬 Chat
                            </Link>
                            <Link
                                to="/preview"
                                className={`inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors ${
                                    location.pathname === '/preview'
                                        ? 'text-blue-600 border-b-2 border-blue-600'
                                        : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                👁️ Preview
                            </Link>
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
    );
};

export default Layout;