
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CURRICULUM } from '../constants';
import { geminiService } from '../services/geminiService';
import { AssetStatus, UserAsset } from '../types';

interface ModuleWorkspaceProps {
  week: number;
  onBack: () => void;
}

const LOGO_STYLES = [
  { id: 'minimalist', label: 'Minimalist', icon: 'fa-minus', prompt: 'clean minimalist vector logo, flat design, white background' },
  { id: 'futuristic', label: 'Futuristic', icon: 'fa-rocket', prompt: 'high-tech futuristic logo, neon accents, sharp geometric shapes, white background' },
  { id: 'organic', label: 'Organic', icon: 'fa-leaf', prompt: 'organic natural logo, soft curves, earthy tones, minimalist, white background' },
  { id: 'luxury', label: 'Luxury', icon: 'fa-crown', prompt: 'elegant luxury brand logo, gold and black palette, sophisticated serif typography icon, white background' },
];

const ModuleWorkspace: React.FC<ModuleWorkspaceProps> = ({ week, onBack }) => {
  const { state, updateAsset } = useApp();
  const weekData = CURRICULUM.find(w => w.week === week)!;
  const userAsset = state.progress[week];

  const [input, setInput] = useState(userAsset.data.text || '');
  const [selectedStyle, setSelectedStyle] = useState(userAsset.data.style || LOGO_STYLES[0].id);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<'build' | 'preview'>('build');

  const handleBuild = async () => {
    if (!input.trim()) return;
    setIsProcessing(true);
    try {
      let result = '';

      switch (week) {
        case 1: // Clarity Report
          result = await geminiService.chatWithThinking(`System Instruction: You are an expert neural patterns analyst. Analyze this reflection and produce a 'Clarity Report'. Structure it with 3 Core Patterns, 2 Neural Loops, and 1 Breakthrough insight. Reflection: ${input}`);
          break;
        case 2: // Vision Board
          const boardPrompt = `Hyper-realistic futuristic cinematic vision board representing this legacy: ${input}. Professional digital art, high fidelity.`;
          const imgResult = await geminiService.generateImage(boardPrompt, "16:9", "1K");
          result = imgResult || "Failed to generate vision board.";
          break;
        case 3: // Power Scripts
          result = await geminiService.quickChat(`Create a set of 3 'Power Scripts' to help the user set boundaries based on this leaking energy context: ${input}. Make them firm but professional.`);
          break;
        case 4: // 60s Story Video
          // We return the script/narrative text for display, the user would use Workshop for video
          result = await geminiService.chatWithThinking(`Draft a 60-second cinematic personal narrative script based on this survivor story: ${input}. Focus on the transition from survival to builder.`);
          break;
        case 5: // Brand Logo
          const style = LOGO_STYLES.find(s => s.id === selectedStyle);
          const logoPrompt = `Professional ${style?.label} logo for a brand named "${input}". ${style?.prompt}. Professional high-end branding.`;
          const logoResult = await geminiService.generateImage(logoPrompt, "1:1", "1K");
          result = logoResult || "Failed to generate logo.";
          break;
        case 6: // Knowledge Base
          result = await geminiService.chatWithThinking(`You are the Knowledge Synthesis Core. Create a comprehensive 'Knowledge Base Architecture' for a user mastering this domain: ${input}. Include core pillars and growth nodes.`);
          break;
        case 7: // Website Architecture
          result = await geminiService.quickChat(`Draft the high-level architecture and copy for a Legacy Portfolio Website for someone focused on: ${input}. Include Hero section, About legacy, and Project hubs.`);
          break;
        case 8: // AI Clone
          const history = (Object.values(state.progress) as UserAsset[])
            .filter(a => a.week < 8 && a.status === AssetStatus.COMPLETED)
            .map(a => `Week ${a.week} Asset (${CURRICULUM[a.week - 1].build_asset}): ${a.generatedAsset?.substring(0, 300)}...`)
            .join('\n\n');
          result = await geminiService.chatWithThinking(`System Instruction: You are a Custom AI Chatbot Clone for the user. Base your persona on their 7-week growth history below. Answer as their 'Digital Twin'. History: ${history}. User says: ${input}`);
          break;
        default:
          result = await geminiService.quickChat(`Generate high quality ${weekData.build_asset} for: ${input}`);
      }

      updateAsset(week, { text: input, style: selectedStyle }, AssetStatus.COMPLETED, result);
      setActiveTab('preview');
    } catch (error: any) {
      const errorMessage = error?.message || 'Unknown error occurred';
      console.error('Module synthesis failed:', error);

      // Provide user-friendly error feedback
      const isImageWeek = week === 2 || week === 5;
      const suggestion = isImageWeek
        ? 'Image generation may require specific API permissions. Try a simpler prompt.'
        : 'Please check your API key and network connection, then try again.';

      alert(`Neural synthesis interrupted.\n\n${errorMessage}\n\n${suggestion}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const renderOutput = () => {
    if (!userAsset.generatedAsset) return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-slate-300 border-2 border-dashed border-slate-100 rounded-[3rem] bg-slate-50/50">
        <i className="fa-solid fa-atom text-5xl mb-6 animate-spin-slow opacity-20"></i>
        <p className="text-xs font-black uppercase tracking-widest">Awaiting Neural Synthesis</p>
      </div>
    );

    const isImage = userAsset.generatedAsset.startsWith('data:image');

    if (isImage) {
      return (
        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-700">
          <div className="rounded-[3rem] overflow-hidden shadow-2xl border-8 border-white ring-1 ring-slate-200 bg-white p-2">
            <img src={userAsset.generatedAsset} alt="Built Asset" className="w-full h-auto rounded-[2.5rem]" />
          </div>
          <div className="flex justify-center space-x-4">
            <button onClick={() => window.open(userAsset.generatedAsset, '_blank')} className="px-8 py-3 bg-slate-900 text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all flex items-center space-x-2"><i className="fa-solid fa-download"></i><span>Export</span></button>
            <button onClick={() => setActiveTab('build')} className="px-8 py-3 bg-white border border-slate-200 rounded-full text-[10px] font-black uppercase tracking-widest hover:border-indigo-600 transition-all flex items-center space-x-2 text-slate-600"><i className="fa-solid fa-rotate"></i><span>Rebuild</span></button>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-slate-950 text-indigo-100 p-12 rounded-[3rem] shadow-2xl font-medium leading-relaxed prose prose-invert max-w-none animate-in slide-in-from-right-8 duration-700 border border-white/5">
        <div className="flex items-center justify-between mb-10 pb-6 border-b border-white/10">
          <div>
            <h3 className="text-2xl font-black uppercase tracking-tighter m-0 text-white">{weekData.build_asset}</h3>
            <p className="text-[10px] font-black tracking-widest text-indigo-400 uppercase mt-1">Certified Legacy Artifact</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
            <i className="fa-solid fa-fingerprint text-indigo-400 text-xl"></i>
          </div>
        </div>
        <div className="text-slate-300 whitespace-pre-wrap leading-relaxed text-sm">
          {userAsset.generatedAsset}
        </div>
        <div className="mt-12 flex justify-end">
          <button onClick={() => setActiveTab('build')} className="text-[10px] font-black uppercase tracking-widest text-indigo-400 hover:text-white transition-colors">Adjust Reflection Core <i className="fa-solid fa-arrow-right ml-2"></i></button>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <button onClick={onBack} className="flex items-center space-x-2 text-slate-400 hover:text-indigo-600 transition-colors group">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-slate-200 group-hover:border-indigo-200 shadow-sm transition-all">
            <i className="fa-solid fa-chevron-left"></i>
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest">Blueprint Exit</span>
        </button>
        <div className="text-right">
          <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1">{weekData.phase}</p>
          <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter leading-none">Week {week}: {weekData.title}</h2>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 mb-10 bg-white p-1.5 rounded-[1.5rem] w-fit border border-slate-200 shadow-sm">
        <button
          onClick={() => setActiveTab('build')}
          className={`px-10 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'build' ? 'bg-indigo-600 shadow-lg shadow-indigo-200 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
        >
          <i className="fa-solid fa-hammer mr-2"></i> Neural Input
        </button>
        <button
          onClick={() => setActiveTab('preview')}
          className={`px-10 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'preview' ? 'bg-indigo-600 shadow-lg shadow-indigo-200 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
        >
          <i className="fa-solid fa-cube mr-2"></i> Visual Preview
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left: Input */}
        <div className={`lg:col-span-5 space-y-8 ${activeTab === 'preview' ? 'hidden lg:block' : ''}`}>
          <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-xl space-y-8">
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                  <i className={`fa-solid ${week === 5 ? 'fa-pen-nib' : 'fa-brain'} text-indigo-600 text-sm`}></i>
                </div>
                <h4 className="font-black text-slate-900 uppercase tracking-tighter text-xl">Core Reflection</h4>
              </div>
              <p className="text-xs text-slate-500 font-medium leading-relaxed bg-slate-50 p-5 rounded-2xl border border-slate-100">
                {week === 5 ? "Input your brand name for visual synthesis." : `${weekData.core_question}?`}
              </p>
            </div>

            {week === 5 && (
              <div className="space-y-4 animate-in fade-in duration-500">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Identity Aesthetic</label>
                <div className="grid grid-cols-2 gap-3">
                  {LOGO_STYLES.map(style => (
                    <button
                      key={style.id}
                      onClick={() => setSelectedStyle(style.id)}
                      className={`flex items-center space-x-3 p-4 rounded-2xl border transition-all ${selectedStyle === style.id
                          ? 'bg-indigo-50 border-indigo-200 ring-2 ring-indigo-500/10'
                          : 'bg-white border-slate-100 hover:border-slate-300'
                        }`}
                    >
                      <i className={`fa-solid ${style.icon} ${selectedStyle === style.id ? 'text-indigo-600' : 'text-slate-300'}`}></i>
                      <span className={`text-[10px] font-bold uppercase tracking-tight ${selectedStyle === style.id ? 'text-indigo-900' : 'text-slate-500'}`}>
                        {style.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Reflection Context
              </label>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Deep dive into your thoughts here..."
                className="w-full bg-slate-50 border border-slate-200 rounded-[2rem] p-6 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/5 min-h-[220px] shadow-inner transition-all resize-none"
              />
            </div>

            <button
              onClick={handleBuild}
              disabled={isProcessing || !input.trim()}
              className="w-full py-5 bg-slate-950 text-white rounded-[1.8rem] font-black uppercase tracking-widest text-xs shadow-2xl shadow-slate-200 hover:bg-indigo-600 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center space-x-3 disabled:opacity-50"
            >
              {isProcessing ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <i className={`fa-solid ${week === 5 ? 'fa-palette' : 'fa-atom'}`}></i>
                  <span>Synthesize {weekData.build_asset}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right: Output */}
        <div className={`lg:col-span-7 ${activeTab === 'build' ? 'hidden lg:block' : ''}`}>
          <div className="sticky top-8">
            {renderOutput()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModuleWorkspace;
