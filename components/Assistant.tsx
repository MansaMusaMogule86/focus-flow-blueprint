
import React, { useState, useRef, useEffect } from 'react';
import { geminiService } from '../services/geminiService';
import { LiveSession } from '../services/liveApiService';
import { Message } from '../types';

const Assistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<(Message & { sources?: any[] })[]>([
    { role: 'model', text: "Hello! I'm Coach Kay. Ready to build your legacy today?" }
  ]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [activeTool, setActiveTool] = useState<'chat' | 'search' | 'maps'>('chat');
  
  const liveSessionRef = useRef<LiveSession | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const toggleVoice = async () => {
    if (isVoiceActive) {
      liveSessionRef.current?.stop();
      setIsVoiceActive(false);
    } else {
      liveSessionRef.current = new LiveSession((text, role) => {
        setMessages(prev => [...prev, { role, text }]);
      });
      await liveSessionRef.current.start();
      setIsVoiceActive(true);
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = input;
    const tool = activeTool;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsThinking(true);

    try {
      let result;
      if (tool === 'search') {
        result = await geminiService.searchGrounding(userMsg);
      } else if (tool === 'maps') {
        result = await geminiService.mapsGrounding(userMsg);
      } else {
        const text = await geminiService.chatWithThinking(userMsg);
        result = { text, sources: [] };
      }

      setMessages(prev => [
        ...prev, 
        { 
          role: 'model', 
          text: result.text || "I found some information, but I couldn't summarize it perfectly. See the sources below.", 
          sources: result.sources 
        }
      ]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'model', text: "I hit a snag connecting to the global intelligence hub. Please try again." }]);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="w-16 h-16 bg-indigo-600 rounded-full shadow-2xl flex items-center justify-center text-white hover:scale-110 transition-transform duration-200 ring-4 ring-white"
        >
          <i className="fa-solid fa-comment-dots text-2xl"></i>
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white"></span>
        </button>
      ) : (
        <div className="w-[90vw] sm:w-[450px] h-[80vh] sm:h-[650px] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 animate-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="bg-indigo-600 p-5 text-white flex justify-between items-center shrink-0">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-indigo-400 flex items-center justify-center font-bold border-2 border-indigo-300 shadow-inner">CK</div>
              <div>
                <p className="text-sm font-bold leading-none">Coach Kay Assistant</p>
                <p className="text-[9px] opacity-70 uppercase tracking-widest font-black mt-1.5 flex items-center">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mr-1.5 animate-pulse"></span>
                  Neural Core Live
                </p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors">
              <i className="fa-solid fa-times opacity-60"></i>
            </button>
          </div>

          {/* Tool Selector */}
          <div className="flex bg-slate-50 border-b border-slate-100 p-1.5 space-x-1 shrink-0">
            {[
              { id: 'chat', label: 'Pro Chat', icon: 'fa-brain' },
              { id: 'search', label: 'Search', icon: 'fa-globe' },
              { id: 'maps', label: 'Maps', icon: 'fa-map-pin' }
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setActiveTool(t.id as any)}
                className={`flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                  activeTool === t.id 
                    ? 'bg-white shadow-sm text-indigo-600 border border-slate-200' 
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <i className={`fa-solid ${t.icon} text-[12px]`}></i>
                <span className="hidden sm:inline">{t.label}</span>
              </button>
            ))}
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6 scrollbar-hide bg-slate-50/30">
            {messages.map((m, i) => (
              <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                {m.role === 'model' && i > 0 && (
                   <div className="flex items-center space-x-1.5 mb-2 ml-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-400"></div>
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Kay Engine v3</span>
                   </div>
                )}
                
                <div className={`max-w-[90%] px-5 py-3.5 rounded-2xl text-[13px] leading-relaxed shadow-sm border ${
                  m.role === 'user' 
                    ? 'bg-indigo-600 text-white rounded-tr-none border-indigo-500' 
                    : 'bg-white text-slate-800 rounded-tl-none border-slate-100'
                }`}>
                  {m.text}
                </div>
                
                {m.sources && m.sources.length > 0 && (
                  <div className="mt-4 w-full max-w-[95%] space-y-3 animate-in fade-in slide-in-from-top-2 duration-500">
                    <div className="flex items-center justify-between px-1">
                      <div className="flex items-center space-x-2">
                         <i className="fa-solid fa-circle-check text-emerald-500 text-[10px]"></i>
                         <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em]">Grounded Intelligence</p>
                      </div>
                      <span className="text-[8px] px-1.5 py-0.5 bg-indigo-50 text-indigo-500 rounded font-black uppercase tracking-widest border border-indigo-100">Verified</span>
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      {m.sources.map((chunk, idx) => (
                        <a 
                          key={idx} 
                          href={chunk.web?.uri || chunk.maps?.uri} 
                          target="_blank" 
                          rel="noreferrer"
                          className="flex items-center group bg-white border border-slate-200 p-3 rounded-2xl hover:border-indigo-300 hover:shadow-md transition-all"
                        >
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mr-3 transition-colors ${chunk.web ? 'bg-blue-50 text-blue-500 group-hover:bg-blue-500 group-hover:text-white' : 'bg-rose-50 text-rose-500 group-hover:bg-rose-500 group-hover:text-white'}`}>
                            <i className={`fa-solid ${chunk.web ? 'fa-link' : 'fa-location-dot'} text-xs`}></i>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[11px] font-bold text-slate-700 truncate">{chunk.web?.title || chunk.maps?.title || 'View Source'}</p>
                            <p className="text-[9px] text-slate-400 truncate font-medium">{new URL(chunk.web?.uri || chunk.maps?.uri || '').hostname}</p>
                          </div>
                          <i className="fa-solid fa-arrow-up-right-from-square text-[10px] text-slate-300 ml-2 group-hover:text-indigo-400"></i>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            {isThinking && (
              <div className="flex flex-col items-start space-y-2">
                <div className="flex items-center space-x-2 ml-1">
                  <div className="w-1 h-1 bg-indigo-300 rounded-full animate-ping"></div>
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
                    {activeTool === 'search' ? 'Searching the web...' : 'Synthesizing Thought...'}
                  </span>
                </div>
                <div className="bg-white border border-slate-100 px-5 py-3 rounded-2xl rounded-tl-none flex space-x-1.5 items-center">
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce"></div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} className="h-4" />
          </div>

          {/* Input Area */}
          <div className="p-4 sm:p-5 border-t bg-white space-y-3 shrink-0">
            <div className="flex space-x-3 items-center">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder={activeTool === 'search' ? "Ask the web anything..." : "Ask Coach Kay..."}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-5 py-3.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 shadow-inner transition-all"
                />
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                  <i className={`fa-solid ${activeTool === 'search' ? 'fa-magnifying-glass' : 'fa-sparkles'} text-xs`}></i>
                </div>
              </div>
              <button
                onClick={sendMessage}
                disabled={isThinking || !input.trim()}
                className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center hover:bg-indigo-700 disabled:opacity-30 disabled:grayscale transition-all shadow-lg shadow-indigo-100 active:scale-95 shrink-0"
              >
                <i className="fa-solid fa-paper-plane text-sm"></i>
              </button>
            </div>
            
            <button
              onClick={toggleVoice}
              className={`w-full py-3.5 rounded-2xl text-[9px] font-black uppercase tracking-[0.15em] transition-all duration-300 flex items-center justify-center space-x-3 border ${
                isVoiceActive 
                  ? 'bg-rose-500 border-rose-600 text-white shadow-xl shadow-rose-200' 
                  : 'bg-white border-slate-200 text-slate-500 hover:border-indigo-300 hover:text-indigo-600'
              }`}
            >
              <div className="relative">
                 <i className={`fa-solid ${isVoiceActive ? 'fa-stop' : 'fa-microphone-lines'} text-sm`}></i>
                 {isVoiceActive && <span className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full animate-ping"></span>}
              </div>
              <span>{isVoiceActive ? 'Stop Neural Audio Link' : 'Initialize Voice Core'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Assistant;
