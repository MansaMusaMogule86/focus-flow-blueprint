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

const Dashboard: React.FC<{ onStartWeek: (week: number) => void }> = ({ onStartWeek }) => {
  const { state } = useApp();

  const progressValues = Object.values(state.progress) as UserAsset[];
  const completedCount = progressValues.filter(a => a.status === AssetStatus.COMPLETED).length;
  const progressPercent = (completedCount / 8) * 100;

  return (
    <div className="space-y-10 lg:space-y-16 animate-in fade-in duration-700">
      {/* Hero Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
        <div className="lg:col-span-8 bg-slate-950 rounded-[3rem] p-10 lg:p-16 text-white shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[400px]">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-600/10 rounded-full -mr-32 -mt-32 blur-[150px]"></div>
          <div className="relative z-10 space-y-6">
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="px-4 py-1.5 bg-white/5 text-white text-[9px] font-black uppercase tracking-[0.2em] rounded-full border border-white/10 backdrop-blur-md">LEGACY PROTOCOL</span>
              <span className="px-4 py-1.5 bg-indigo-500/20 text-indigo-400 text-[9px] font-black uppercase tracking-[0.2em] rounded-full border border-indigo-500/20">AI ENHANCED</span>
            </div>
            <div className="flex items-center space-x-6">
              <BrandLogo size="lg" />
              <h1 className="text-5xl lg:text-7xl font-black uppercase tracking-tighter leading-none">The Elevation<br />Path</h1>
            </div>
            <p className="text-slate-400 text-sm lg:text-base max-w-xl font-medium leading-relaxed opacity-80">
              Your 8-week journey to transition from survival mode to legacy builder. Engineered by Coach Kay.
            </p>
          </div>
          <div className="relative z-10 pt-12 max-w-lg">
            <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em] mb-4 text-indigo-400">
              <span>Cohort Progress</span>
              <span>{Math.round(progressPercent)}% Unlocked</span>
            </div>
            <div className="h-4 bg-white/5 rounded-full overflow-hidden border border-white/10 p-1">
              <div
                className="h-full bg-gradient-to-r from-[#1E1B4B] to-indigo-500 rounded-full transition-all duration-1000 ease-out shadow-[0_0_20px_rgba(79,70,229,0.3)]"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 bg-white p-10 lg:p-14 rounded-[3rem] border border-slate-200 shadow-xl flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-20 transition-all duration-500">
            <i className="fa-solid fa-bolt-lightning text-9xl text-indigo-600"></i>
          </div>
          <div className="space-y-8 relative z-10 text-center lg:text-left">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Current Build Target</h3>
            <div className="flex flex-col lg:flex-row items-center space-y-4 lg:space-y-0 lg:space-x-6">
              <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center font-black text-3xl shadow-sm border border-indigo-100 transform group-hover:rotate-6 transition-transform">
                {state.currentWeek}
              </div>
              <div>
                <p className="text-2xl lg:text-3xl font-black text-slate-900 uppercase tracking-tighter leading-tight">
                  {CURRICULUM[state.currentWeek - 1]?.title}
                </p>
                <p className="text-[10px] text-indigo-600 font-black uppercase tracking-widest mt-2">
                  {CURRICULUM[state.currentWeek - 1]?.build_asset}
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={() => onStartWeek(state.currentWeek)}
            className="w-full py-6 bg-slate-950 text-white rounded-3xl font-black uppercase tracking-widest text-[10px] hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200 transform active:scale-95 z-10 mt-10 lg:mt-0"
          >
            Launch Module
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
        {CURRICULUM.map((week) => {
          const status = state.progress[week.week].status;
          const isLocked = status === AssetStatus.LOCKED;
          const isCompleted = status === AssetStatus.COMPLETED;

          return (
            <div
              key={week.week}
              onClick={() => !isLocked && onStartWeek(week.week)}
              className={`group p-8 lg:p-10 rounded-[3rem] border transition-all duration-500 relative ${isLocked
                ? 'bg-slate-50 border-slate-100 cursor-not-allowed opacity-60'
                : 'bg-white border-slate-200 hover:border-indigo-400 shadow-sm hover:shadow-2xl cursor-pointer hover:-translate-y-3'
                }`}
            >
              <div className="flex justify-between items-start mb-10">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl ${isLocked ? 'bg-slate-200 text-slate-400' : (isCompleted ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-100' : 'bg-slate-950 text-white shadow-lg shadow-slate-200')
                  }`}>
                  {isCompleted ? <i className="fa-solid fa-check"></i> : week.week}
                </div>
                <div className={`${isLocked ? 'text-slate-200' : 'text-slate-300 group-hover:text-indigo-600'} transition-colors`}>
                  <i className={`fa-solid ${isLocked ? 'fa-lock' : 'fa-arrow-right-long'}`}></i>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className={`text-xl font-black uppercase tracking-tighter leading-tight ${isLocked ? 'text-slate-400' : 'text-slate-900'}`}>
                  {week.title}
                </h4>
                <p className={`text-[10px] font-black uppercase tracking-widest ${isLocked ? 'text-slate-300' : 'text-indigo-600'}`}>
                  {week.build_asset}
                </p>
              </div>

              <div className="mt-10 pt-6 border-t border-slate-50 flex items-center justify-between">
                <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${isLocked ? 'text-slate-300' : (isCompleted ? 'text-emerald-500' : 'text-slate-400')}`}>
                  {isLocked ? 'LOCKED' : (isCompleted ? 'LEGACY BUILT' : 'READY')}
                </span>
                {!isLocked && <div className={`w-2 h-2 rounded-full ${isCompleted ? 'bg-emerald-500' : 'bg-indigo-600 animate-pulse'}`}></div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const EcosystemView: React.FC = () => {
  const { state, saveToVault } = useApp();
  const [activeTab, setActiveTab] = useState<'news' | 'flash' | 'labs' | 'pro'>('labs');
  const [isFetchingNews, setIsFetchingNews] = useState(false);
  const [newsResult, setNewsResult] = useState<{ text: string, sources: any[] } | null>(null);

  const [flashInput, setFlashInput] = useState('');
  const [flashResponse, setFlashResponse] = useState('');
  const [isFlashProcessing, setIsFlashProcessing] = useState(false);

  const [proInput, setProInput] = useState('');
  const [proResponse, setProResponse] = useState('');
  const [isProProcessing, setIsProProcessing] = useState(false);

  // New Lab Shell State - uses LAB_CONFIGS and GenericLabShell
  const [activeLabId, setActiveLabId] = useState<string | null>(null);

  const fetchNews = async () => {
    setIsFetchingNews(true);
    try {
      const result = await geminiService.searchGrounding("Latest breakthroughs in Google Labs AI and personal transformation 2025");
      setNewsResult(result);
      setActiveTab('news');
    } catch (e) {
      alert("Feed interrupted.");
    } finally {
      setIsFetchingNews(false);
    }
  };

  const runFlash = async () => {
    if (!flashInput) return;
    setIsFlashProcessing(true);
    try {
      const res = await geminiService.quickChat(flashInput);
      setFlashResponse(res);
    } finally {
      setIsFlashProcessing(false);
    }
  };

  const runPro = async () => {
    if (!proInput) return;
    setIsProProcessing(true);
    try {
      const res = await geminiService.chatWithThinking(`Analyze and provide deep synthesis for the following request. Include reasoning steps clearly in your response: ${proInput}`);
      setProResponse(res);
    } finally {
      setIsProProcessing(false);
    }
  };

  // Handle save to vault from GenericLabShell
  const handleLabSaveToVault = (labTitle: string, content: string) => {
    saveToVault({
      labUsed: labTitle,
      title: `${labTitle} Output`,
      content: content,
      week: state.currentWeek,
    });
    alert('Saved to Vault!');
  };

  return (
    <div className="space-y-8 lg:space-y-12 animate-in fade-in duration-700">
      {/* Header */}
      <div className="bg-slate-950 rounded-[3rem] p-10 lg:p-20 text-center text-white space-y-8 relative overflow-hidden border border-white/5">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-600/10 to-transparent"></div>
        <div className="relative z-10 flex flex-col items-center">
          <BrandLogo size="lg" className="mb-6" />
          <h2 className="text-4xl lg:text-7xl font-black uppercase tracking-tighter mb-4 leading-tight">Labs Connection</h2>
          <p className="text-slate-400 text-sm lg:text-lg max-w-2xl mx-auto font-medium opacity-80">Portal to experimental neural interfaces and global intelligence grounding.</p>
          <div className="flex flex-wrap justify-center gap-4 mt-12">
            {[
              { id: 'labs', label: 'Discovery Hub', icon: 'fa-vial' },
              { id: 'pro', label: 'Pro Thinking', icon: 'fa-brain-circuit' },
              { id: 'flash', label: 'Flash Engine', icon: 'fa-bolt' },
              { id: 'news', label: 'Neural Feed', icon: 'fa-rss' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-2xl shadow-indigo-500/30' : 'bg-white/5 text-slate-400 hover:bg-white/10'
                  }`}
              >
                <i className={`fa-solid ${tab.icon} mr-3`}></i> {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {activeTab === 'labs' && (
        <div className="space-y-8">
          {/* GenericLabShell - mode-aware shell router */}
          {activeLabId && (
            <GenericLabShell
              labId={activeLabId}
              onClose={() => setActiveLabId(null)}
              onSaveToVault={handleLabSaveToVault}
            />
          )}

          {/* Lab Cards Grid - driven by LAB_CONFIGS */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
            {LAB_CONFIGS.map(lab => (
              <div key={lab.id} className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm hover:shadow-2xl transition-all group cursor-pointer flex flex-col h-full">
                <div className="flex items-start justify-between mb-8">
                  <div className={`w-14 h-14 bg-slate-50 text-slate-900 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all`}>
                    <i className={`fa-solid ${lab.icon} text-xl`}></i>
                  </div>
                  <span className={`text-[8px] font-black uppercase tracking-widest text-slate-300`}>V1</span>
                </div>
                <h4 className="text-xl font-black uppercase tracking-tighter text-slate-900 mb-2">{lab.title}</h4>
                <p className="text-xs text-slate-500 font-medium leading-relaxed mb-8 flex-1">{lab.description}</p>

                <div className="pt-6 border-t border-slate-50 mt-auto">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveLabId(lab.id);
                    }}
                    className={`w-full py-4 bg-slate-50 hover:bg-slate-950 text-slate-600 hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center space-x-2`}
                  >
                    <span>{lab.actionLabel}</span>
                    <i className="fa-solid fa-arrow-right-long opacity-50"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {
        activeTab === 'pro' && (
          <div className="bg-white border border-slate-200 rounded-[3rem] p-8 lg:p-16 shadow-xl animate-in slide-in-from-bottom-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
              <div className="lg:col-span-5 space-y-8">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
                    <i className="fa-solid fa-brain-circuit text-xl"></i>
                  </div>
                  <div>
                    <h3 className="text-2xl lg:text-3xl font-black uppercase tracking-tighter text-slate-900 m-0">Pro Thinking Engine</h3>
                    <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Powered by Gemini 3 Pro</p>
                  </div>
                </div>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  Enter deep synthesis mode for complex architectural planning, strategy development, or domain research. This model utilizes extended thinking tokens for higher reasoning fidelity.
                </p>
                <textarea
                  value={proInput}
                  onChange={(e) => setProInput(e.target.value)}
                  placeholder="Describe your complex challenge or legacy goal..."
                  className="w-full h-48 lg:h-64 bg-slate-50 border border-slate-200 rounded-[2rem] p-8 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/5 shadow-inner resize-none font-medium text-slate-800"
                />
                <button
                  onClick={runPro}
                  disabled={isProProcessing}
                  className="w-full py-6 bg-indigo-600 text-white rounded-3xl font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center space-x-3 active:scale-95 disabled:opacity-50"
                >
                  {isProProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Architecting Response...</span>
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-sparkles"></i>
                      <span>Compute Deep Synthesis</span>
                    </>
                  )}
                </button>
              </div>
              <div className="lg:col-span-7 bg-slate-950 rounded-[2.5rem] p-10 lg:p-14 text-indigo-100 overflow-y-auto min-h-[500px] max-h-[700px] scrollbar-hide border border-white/5 shadow-2xl relative">
                {isProProcessing && (
                  <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm z-10 flex flex-col items-center justify-center space-y-4">
                    <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400 animate-pulse">Deep Reasoning Active</p>
                  </div>
                )}
                <div className="prose prose-invert prose-sm lg:prose-base max-w-none text-slate-300 leading-relaxed font-medium">
                  {proResponse ? (
                    <div className="animate-in fade-in slide-in-from-top-4 duration-700">
                      {proResponse.split('\n').map((line, i) => (
                        <p key={i} className={line.toLowerCase().includes('reasoning') || line.toLowerCase().includes('steps') ? 'text-indigo-400 font-black uppercase text-[10px] tracking-widest mt-6' : ''}>
                          {line}
                        </p>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full space-y-4 opacity-20 py-20">
                      <i className="fa-solid fa-microchip text-7xl"></i>
                      <p className="text-[10px] font-black uppercase tracking-[0.3em]">// CORE STANDBY</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )
      }

      {
        activeTab === 'flash' && (
          <div className="bg-white border border-slate-200 rounded-[3rem] p-8 lg:p-16 shadow-xl animate-in slide-in-from-bottom-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
              <div className="space-y-8">
                <h3 className="text-2xl lg:text-3xl font-black uppercase tracking-tighter">Immediate Task Engine</h3>
                <textarea
                  value={flashInput}
                  onChange={(e) => setFlashInput(e.target.value)}
                  placeholder="Enter high-speed query..."
                  className="w-full h-48 lg:h-64 bg-slate-50 border border-slate-200 rounded-[2rem] p-8 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/5 shadow-inner resize-none"
                />
                <button
                  onClick={runFlash}
                  disabled={isFlashProcessing}
                  className="w-full py-5 bg-slate-950 text-white rounded-3xl font-black uppercase tracking-widest text-[10px] shadow-xl disabled:opacity-50"
                >
                  {isFlashProcessing ? 'Computing...' : 'Execute Flash Command'}
                </button>
              </div>
              <div className="bg-slate-950 rounded-[2rem] p-8 lg:p-12 text-indigo-100 overflow-y-auto max-h-[400px] lg:max-h-[500px] scrollbar-hide font-mono text-sm leading-relaxed border border-white/5 shadow-2xl">
                {flashResponse || "// SYSTEM AWAITING INPUT"}
              </div>
            </div>
          </div>
        )
      }

      {
        activeTab === 'news' && (
          <div className="space-y-8 animate-in slide-in-from-bottom-8">
            {!newsResult && (
              <div className="bg-white p-20 text-center rounded-[3rem] border border-slate-200">
                <i className="fa-solid fa-satellite text-6xl text-slate-100 mb-8 animate-pulse"></i>
                <h3 className="text-2xl font-black uppercase tracking-tighter text-slate-800">Grounding Feed Dormant</h3>
                <button onClick={fetchNews} className="mt-8 px-10 py-5 bg-indigo-600 text-white rounded-3xl font-black uppercase tracking-widest text-[10px] shadow-xl">Connect to Feed</button>
              </div>
            )}
            {newsResult && (
              <div className="bg-white p-10 lg:p-16 rounded-[3rem] border border-slate-200 shadow-xl space-y-12">
                <div className="prose prose-sm lg:prose-base max-w-none text-slate-700 leading-relaxed">
                  {newsResult.text}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-10 border-t border-slate-100">
                  {newsResult.sources.map((s, i) => (
                    <a key={i} href={s.web?.uri} target="_blank" rel="noreferrer" className="p-6 bg-slate-50 rounded-3xl flex items-center space-x-4 hover:bg-white border border-slate-100 transition-all hover:shadow-xl">
                      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-indigo-500 border border-slate-200 shadow-sm"><i className="fa-solid fa-link"></i></div>
                      <span className="text-[10px] font-black uppercase tracking-widest truncate">{s.web?.title}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )
      }
    </div >
  );
};

const VaultView: React.FC = () => {
  const { state } = useApp();
  const progressValues = Object.values(state.progress) as UserAsset[];

  return (
    <div className="space-y-12 lg:space-y-20 animate-in fade-in duration-700 pb-24">
      <div className="text-center space-y-6">
        <h2 className="text-4xl lg:text-7xl font-black uppercase tracking-tighter text-slate-900 leading-tight">Legacy Vault</h2>
        <p className="text-slate-500 text-sm lg:text-lg max-w-xl mx-auto font-medium opacity-70 italic">"Your evolution, archived in neural glass."</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
        {CURRICULUM.map(week => {
          const userAsset = state.progress[week.week];
          const isCompleted = userAsset.status === AssetStatus.COMPLETED;

          return (
            <div key={week.week} className="group relative">
              <div className={`aspect-square rounded-[3rem] border transition-all duration-700 p-8 flex flex-col justify-between overflow-hidden ${isCompleted ? 'bg-white border-slate-200 shadow-xl hover:scale-[1.03]' : 'bg-slate-100 border-dashed border-slate-200 opacity-50'
                }`}>
                {isCompleted ? (
                  <>
                    <div className="flex justify-between items-start">
                      <div className="w-12 h-12 bg-slate-950 text-white rounded-2xl flex items-center justify-center font-black">
                        {week.week}
                      </div>
                      <i className="fa-solid fa-box-archive text-slate-200 group-hover:text-indigo-600 transition-colors"></i>
                    </div>
                    <div className="space-y-3">
                      <h4 className="text-2xl font-black uppercase tracking-tighter text-slate-900 leading-tight">{week.build_asset}</h4>
                      <p className="text-[10px] font-black uppercase tracking-widest text-indigo-600">Archived Week {week.week}</p>
                    </div>
                    <button
                      onClick={() => {
                        if (userAsset.generatedAsset) {
                          if (userAsset.generatedAsset.startsWith('data:')) window.open(userAsset.generatedAsset, '_blank');
                          else alert("Viewing details in Module Workspace.");
                        }
                      }}
                      className="w-full py-4 bg-slate-950 text-white rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0"
                    >
                      Access Artifact
                    </button>
                  </>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center space-y-6">
                    <i className="fa-solid fa-lock text-4xl text-slate-300"></i>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">VAULT SEALED</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const AppMain: React.FC = () => {
  const [activeSection, setActiveSection] = useState<AppSection>(AppSection.DASHBOARD);
  const [activeWeek, setActiveWeek] = useState<number | null>(null);

  const handleStartWeek = (week: number) => {
    setActiveWeek(week);
  };

  const renderContent = () => {
    if (activeWeek) {
      return <ModuleWorkspace week={activeWeek} onBack={() => setActiveWeek(null)} />;
    }

    switch (activeSection) {
      case AppSection.DASHBOARD:
      case AppSection.CURRICULUM:
        return <Dashboard onStartWeek={handleStartWeek} />;
      case AppSection.WORKSPACE:
        return <Workshop />;
      case AppSection.ECOSYSTEM:
        return <EcosystemView />;
      case AppSection.VAULT:
        return <VaultView />;
      default:
        return <Dashboard onStartWeek={handleStartWeek} />;
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
