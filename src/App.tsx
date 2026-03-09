import { AnimatePresence, motion } from 'motion/react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { BottomNav } from './components/navigation/BottomNav';
import { ChatPage } from './pages/ChatPage';
import { DashboardPage } from './pages/DashboardPage';
import { DocumentsPage } from './pages/DocumentsPage';
import { GraphPage } from './pages/GraphPage';
import { ProviderGuidePage } from './pages/ProviderGuidePage';
import { SettingsPage } from './pages/SettingsPage';

export default function App() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background-light">
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          <Routes location={location}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/documents" element={<DocumentsPage />} />
            <Route path="/graph" element={<GraphPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/settings/guide" element={<ProviderGuidePage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </motion.div>
      </AnimatePresence>
      <BottomNav />
    </div>
  );
}
