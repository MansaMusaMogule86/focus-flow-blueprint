import { PromptRegistry, LAB_SYSTEM_PROMPTS } from './labs/PromptRegistry';
import { LAB_CONFIGS } from './labs/LabConfig';

// Type declaration for Google AI Studio API
declare global {
  interface Window {
    aistudio: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Assistant from './components/Assistant';
import ModuleWorkspace from './components/ModuleWorkspace';
import Workshop from './components/Workshop';
import BrandLogo from './components/BrandLogo';
import ErrorBoundary from './components/ErrorBoundary';
import GenericLabShell from './components/GenericLabShell';
import HomeView from './components/HomeView';
import PathView from './components/PathView';
import LoginPage from './components/LoginPage';
import { AppProvider, useApp } from './context/AppContext';
import { AppSection, AssetStatus, UserAsset } from './types';
import { CURRICULUM } from './constants';
import { geminiService } from './services/geminiService';

// API Key Guard for Veo and Gemini 3 Pro models
const ApiKeyGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [hasKey, setHasKey] = useState<boolean | null>(null);

  useEffect(() => {
    const checkKey = async () => {
      // Check if running in AI Studio environment
      if (typeof window.aistudio === 'undefined' || !window.aistudio?.hasSelectedApiKey) {
        // Running locally - bypass API key check
        setHasKey(true);
        return;
      }
      const selected = await window.aistudio.hasSelectedApiKey();
      setHasKey(selected);
    };
    checkKey();
  }, []);

  const handleSelectKey = async () => {
    if (typeof window.aistudio !== 'undefined' && window.aistudio?.openSelectKey) {
      await window.aistudio.openSelectKey();
      setHasKey(true);
    }
  };

  if (hasKey === null) return null;

  if (!hasKey) {
    return (
      <div className="fixed inset-0 bg-slate-900 z-[100] flex items-center justify-center p-4 lg:p-6 backdrop-blur-md">
        <div className="bg-white rounded-[3rem] p-10 lg:p-16 max-w-xl w-full text-center space-y-10 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-500">
          <BrandLogo size="xl" className="justify-center" />
          <div className="space-y-4">
            <h2 className="text-4xl font-black uppercase tracking-tighter text-slate-900 leading-none">Initialize Neural Core</h2>
            <p className="text-slate-500 text-sm font-medium leading-relaxed max-sm mx-auto">
              Welcome to the blueprint. Access to advanced synthesis requires authenticated API credentials.
            </p>
            <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                Review <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline">Billing Guidelines</a>
              </p>
            </div>
          </div>
          <button
            onClick={handleSelectKey}
            className="w-full py-6 bg-slate-950 text-white rounded-3xl font-black uppercase tracking-widest text-[10px] hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200 transform active:scale-95"
          >
            Activate Portal
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

// Ecosystem View
const EcosystemView: React.FC = () => {
  const [activeLab, setActiveLab] = useState<string | null>(null);

  if (activeLab) {
    return <GenericLabShell labId={activeLab} onClose={() => setActiveLab(null)} onSaveToVault={() => { }} />;
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="bg-white rounded-[3rem] p-10 border border-slate-200 shadow-sm">
        <h2 className="text-3xl font-black uppercase tracking-tighter text-slate-900 mb-3">AI Labs</h2>
        <p className="text-slate-500 mb-8">Explore experimental AI tools and capabilities</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {LAB_CONFIGS.map((lab) => (
            <div
              key={lab.id}
              onClick={() => setActiveLab(lab.id)}
              className="group p-6 rounded-2xl border border-slate-200 hover:border-indigo-400 cursor-pointer transition-all hover:shadow-lg"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${lab.gradient || 'from-indigo-500 to-purple-500'} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}>
                <i className={`fa-solid ${lab.icon || 'fa-flask'}`}></i>
              </div>
              <h3 className="font-black uppercase tracking-tight text-slate-900">{lab.title}</h3>
              <p className="text-xs text-slate-500 mt-1">{lab.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Vault View
const VaultView: React.FC = () => {
  const { state } = useApp();

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-[3rem] p-10 border border-amber-100">
        <div className="flex items-center gap-6 mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-500 rounded-3xl flex items-center justify-center text-white shadow-lg">
            <i className="fa-solid fa-vault text-3xl"></i>
          </div>
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tighter text-slate-900">Your Vault</h1>
            <p className="text-amber-600 font-bold uppercase tracking-widest text-sm mt-1">All your saved creations</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[3rem] p-10 border border-slate-200 shadow-sm">
        {Object.values(state.progress).filter(p => p.status === AssetStatus.COMPLETED).length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(state.progress)
              .filter(([_, value]) => value.status === AssetStatus.COMPLETED)
              .map(([week, _]) => {
                const weekNum = parseInt(week);
                const weekData = CURRICULUM[weekNum - 1];
                return (
                  <div key={week} className="p-6 rounded-2xl border border-slate-200 hover:border-amber-400 transition-all">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center text-white font-bold">
                        {weekNum}
                      </div>
                      <div>
                        <h3 className="font-black uppercase tracking-tight text-slate-900">{weekData?.title}</h3>
                        <p className="text-xs text-amber-600 font-bold uppercase tracking-widest">{weekData?.build_asset}</p>
                      </div>
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600">
                      <i className="fa-solid fa-check-circle mr-1"></i>
                      Saved to Vault
                    </span>
                  </div>
                );
              })}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <i className="fa-solid fa-box-open text-4xl text-slate-300"></i>
            </div>
            <h3 className="text-2xl font-black uppercase tracking-tighter text-slate-900 mb-2">Vault Empty</h3>
            <p className="text-slate-500">Complete PATH steps to save your work here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Main App Component
const AppMain: React.FC = () => {
  const { state } = useApp();
  const [activeSection, setActiveSection] = useState<AppSection>(AppSection.DASHBOARD);
  const [activeWeek, setActiveWeek] = useState<number | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Check auth on mount
  useEffect(() => {
    const authUser = localStorage.getItem('auth_user');
    setIsAuthenticated(!!authUser);
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_user');
    setIsAuthenticated(false);
  };

  const handleStartWeek = (week: number) => {
    setActiveWeek(week);
  };

  // Show login if not authenticated
  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const renderContent = () => {
    if (activeWeek) {
      return <ModuleWorkspace week={activeWeek} onBack={() => setActiveWeek(null)} />;
    }

    switch (activeSection) {
      case AppSection.DASHBOARD:
        // HOME - Dashboard View (DISTINCT from PATH)
        return (
          <HomeView
            onNavigateToPath={() => setActiveSection(AppSection.CURRICULUM)}
            onNavigateToVault={() => setActiveSection(AppSection.VAULT)}
            onNavigateToLabs={() => setActiveSection(AppSection.ECOSYSTEM)}
          />
        );
      case AppSection.CURRICULUM:
        // PATH - Path Overview + Step Pages (DISTINCT from HOME)
        return <PathView onStartWeek={handleStartWeek} />;
      case AppSection.WORKSPACE:
        return <Workshop />;
      case AppSection.ECOSYSTEM:
        return <EcosystemView />;
      case AppSection.VAULT:
        return <VaultView />;
      default:
        return (
          <HomeView
            onNavigateToPath={() => setActiveSection(AppSection.CURRICULUM)}
            onNavigateToVault={() => setActiveSection(AppSection.VAULT)}
            onNavigateToLabs={() => setActiveSection(AppSection.ECOSYSTEM)}
          />
        );
    }
  };

  return (
    <Layout activeSection={activeSection} setActiveSection={(s) => { setActiveSection(s); setActiveWeek(null); }}>
      {renderContent()}
      <Assistant />
    </Layout>
  );
};

const App: React.FC = () => (
  <ErrorBoundary>
    <AppProvider>
      <ApiKeyGuard>
        <AppMain />
      </ApiKeyGuard>
    </AppProvider>
  </ErrorBoundary>
);

export default App;
