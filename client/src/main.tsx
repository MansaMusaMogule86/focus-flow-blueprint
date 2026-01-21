import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './store';
import { api } from './services/api';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { PathPage } from './pages/PathPage';
import { StepPage } from './pages/StepPage';
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
            // If API fails, allow through (might be first time setup)
            setNeedsOnboarding(false);
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

                {/* Dashboard - HOME route */}
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

                {/* PATH Overview - separate from HOME */}
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

                {/* Individual PATH Steps - /path/1 through /path/8 */}
                <Route
                    path="/path/:stepNumber"
                    element={
                        <ProtectedRoute>
                            <OnboardingGuard>
                                <StepPage />
                            </OnboardingGuard>
                        </ProtectedRoute>
                    }
                />

                {/* Vault */}
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

                {/* Clone */}
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

                {/* Catch all - redirect to home */}
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
