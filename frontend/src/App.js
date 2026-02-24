import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/navbar';
import { Footer } from './components/footer';
import { HomePage } from './pages/HomePage';
import { CompetitionsPage } from './pages/CompetitionsPage';
import { CompetitionDetailPage } from './pages/CompetitionDetailPage';
import { WinnersPage } from './pages/WinnersPage';
import { AuthPage } from './pages/AuthPage';
import { AuthCallbackPage } from './pages/AuthCallbackPage';
import { DashboardPage } from './pages/DashboardPage';
import { CheckoutSuccessPage } from './pages/CheckoutSuccessPage';
import { AdminDashboard } from './pages/AdminDashboard';
import './app.css';
import './index.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const BANNER_HEIGHT_PX = 36;

// Force Vercel redeploy - v2

const BackendStatusBanner = ({ status }) => {
  if (!status || status.kind === 'ok') return null;

  const message =
    status.kind === 'missing_url'
      ? 'Backend URL is not configured. Set REACT_APP_BACKEND_URL and redeploy.'
      : 'Backend is unreachable right now. Some features may not work.';

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] bg-[#FF3B3B] text-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-2 text-sm font-medium">
        {message}
      </div>
    </div>
  );
};

function App() {
  const [backendStatus, setBackendStatus] = useState({ kind: 'checking' });

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (!BACKEND_URL) {
        if (!cancelled) setBackendStatus({ kind: 'missing_url' });
        return;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      try {
        const res = await fetch(`${BACKEND_URL}/api/health`, {
          method: 'GET',
          cache: 'no-store',
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(`Healthcheck failed: ${res.status}`);
        if (!cancelled) setBackendStatus({ kind: 'ok' });
      } catch (e) {
        if (!cancelled) setBackendStatus({ kind: 'down' });
      } finally {
        clearTimeout(timeoutId);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-[#0A0A0A]">
          <BackendStatusBanner status={backendStatus} />
          <Navbar topOffset={backendStatus.kind === 'ok' ? 0 : BANNER_HEIGHT_PX} />
          <main>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/competitions" element={<CompetitionsPage />} />
              <Route path="/competitions/:id" element={<CompetitionDetailPage />} />
              <Route path="/winners" element={<WinnersPage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/auth/callback" element={<AuthCallbackPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/checkout/success" element={<CheckoutSuccessPage />} />
              <Route path="/admin" element={<AdminDashboard />} />
            </Routes>
          </main>
          <Footer />
        </div>
        <Toaster 
          position="top-right"
          richColors
          theme="dark"
        />
      </Router>
    </AuthProvider>
  );
}

export default App;
