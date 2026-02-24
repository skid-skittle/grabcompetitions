import React from 'react';
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

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-slate-50">
          <Navbar topOffset={0} />
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
        <Toaster position="top-right" richColors theme="dark" />
      </Router>
    </AuthProvider>
  );
}

export default App;
