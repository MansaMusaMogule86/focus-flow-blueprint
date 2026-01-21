import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useStore } from './store';
import { api } from './services/api';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { PathPage } from './pages/PathPage';
import { VaultPage } from './pages/VaultPage';
import { ClonePage } from './pages/ClonePage';
import { OnboardingPage } from './pages/OnboardingPage';
import ScrollToTop from './components/ScrollToTop';
import { LoadingSpinner } from './components/ui';
import './styles/globals.css';

// Auth guard - requires login
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const isAuthenticated = useStore((state) => state.auth.isAuthenticated);

    if (!isAuthenticated) {
        return <Navigate to="/auth" replace />;
    }

    return <>{children}</>;
};

// Onboarding guard - requires completed onboarding
const OnboardingGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [checking, setChecking] = useState(true);
    const [needsOnboarding, setNeedsOnboarding] = useState(false);

    useEffect(() => {
        checkOnboarding();
    }, []);

    const checkOnboarding = async () => {
        try {
            const status = await api.onboarding.getStatus();
            setNeedsOnboarding(!status.completed);
        } catch {
            setNeedsOnboarding(true);
        } finally {
            setChecking(false);
        }
    };

    if (checking) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (needsOnboarding) {
        return <Navigate to="/onboarding" replace />;
    }

    return <>{children}</>;
};

const App: React.FC = () => {
    const { auth, theme } = useStore();

    // Apply theme
    React.useEffect(() => {
        if (theme.mode === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [theme.mode]);

    return (
        <BrowserRouter>
            <ScrollToTop />
            <Routes>
                {/* Public routes */}
                <Route path="/auth" element={auth.isAuthenticated ? <Navigate to="/" replace /> : <AuthPage />} />

                {/* Onboarding - requires auth but not onboarding completion */}
                <Route
                    path="/onboarding"
                    element={
                        <ProtectedRoute>
                            <OnboardingPage />
                        </ProtectedRoute>
                    }
                />

                {/* Protected routes - require auth AND completed onboarding */}
                <Route
                    path="/"
                    element={
                        <ProtectedRoute>
                            <OnboardingGuard>
                                <DashboardPage />
                            </OnboardingGuard>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/path"
                    element={
                        <ProtectedRoute>
                            <OnboardingGuard>
                                <PathPage />
                            </OnboardingGuard>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/vault"
                    element={
                        <ProtectedRoute>
                            <OnboardingGuard>
                                <VaultPage />
                            </OnboardingGuard>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/clone"
                    element={
                        <ProtectedRoute>
                            <OnboardingGuard>
                                <ClonePage />
                            </OnboardingGuard>
                        </ProtectedRoute>
                    }
                />

                {/* Catch all */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
