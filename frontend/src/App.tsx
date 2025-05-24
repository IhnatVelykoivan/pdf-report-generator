import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import ConversationPage from './pages/ConversationPage';
import PDFPreviewPage from './pages/PDFPreviewPage';
import { ConversationProvider } from './context/ConversationContext';
import './index.css';

function App() {
    return (
        <ConversationProvider>
            <Router>
                <Layout>
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/conversation" element={<ConversationPage />} />
                        <Route path="/preview" element={<PDFPreviewPage />} />
                    </Routes>
                </Layout>
            </Router>
        </ConversationProvider>
    );
}

export default App;