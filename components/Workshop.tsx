
import React, { useState, useRef, useEffect } from 'react';
import { geminiService } from '../services/geminiService';
import { ASPECT_RATIOS, IMAGE_SIZES } from '../constants';

type ToolType = 'vision' | 'vids' | 'analyze' | 'audio';

interface WorkshopProps {
  initialTool?: ToolType;
}

const Workshop: React.FC<WorkshopProps> = ({ initialTool = 'vision' }) => {
  const [activeTool, setActiveTool] = useState<ToolType>(initialTool);
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [imageSize, setImageSize] = useState('1K');
  const [loading, setLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState('');
  
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [resultVideo, setResultVideo] = useState<string | null>(null);
  const [lastOperation, setLastOperation] = useState<any>(null);
  const [analysisText, setAnalysisText] = useState<string | null>(null);
  const [transcription, setTranscription] = useState<string | null>(null);
  
  // Google Vids Specific State
  const [vidsScript, setVidsScript] = useState<string | null>(null);
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
  const [scenes, setScenes] = useState<{title: string, desc: string}[]>([]);
  const [startFrame, setStartFrame] = useState<string | null>(null);
  const [endFrame, setEndFrame] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const startFrameRef = useRef<HTMLInputElement>(null);
  const endFrameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setActiveTool(initialTool);
  }, [initialTool]);

  const handleGenerateImage = async () => {
    setLoading(true);
    setLoadingStatus('Conjuring visual data...');
    try {
      const img = await geminiService.generateImage(prompt, aspectRatio, imageSize);
      if (img) setResultImage(img);
    } catch (e) {
      alert("Vision failed. Check your prompt constraints.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditImage = async () => {
    if (!resultImage) return;
    setLoading(true);
    setLoadingStatus('Refining visual structures...');
    try {
      const edited = await geminiService.editImage(resultImage, prompt);
      if (edited) setResultImage(edited);
    } catch (e) {
      alert("Edit failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateVideo = async () => {
    setLoading(true);
    setLoadingStatus('Baking cinematic sequences with Veo...');
    try {
      const finalPrompt = vidsScript ? `Narrative Video. Story: ${vidsScript}. Action: ${prompt}` : prompt;
      const result = await geminiService.generateVideo(
        finalPrompt, 
        (aspectRatio === '9:16' ? '9:16' : '16:9'), 
        startFrame || undefined,
        endFrame || undefined
      );
      setResultVideo(result.url);
      setLastOperation(result.operation);
    } catch (e) {
      alert("Veo synthesis failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleExtendVideo = async () => {
    if (!lastOperation) return;
    setLoading(true);
    setLoadingStatus('Extending narrative timeline (+7s)...');
    try {
      const result = await geminiService.extendVideo(lastOperation, prompt || "Continue the sequence smoothly.");
      setResultVideo(result.url);
      setLastOperation(result.operation);
    } catch (e) {
      alert("Extension failed. Extensions work best with 16:9 content.");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateScript = async () => {
    if (!prompt) return alert("Please enter a story theme or topic first.");
    setIsGeneratingScript(true);
    try {
      const script = await geminiService.chatWithThinking(`Create a 60-second cinematic script for a Google Vid about: ${prompt}. Structure it as a JSON-like array of 3 scenes, each with a 'title' and 'desc' (visual description). Output ONLY the script text.`);
      setVidsScript(script);
      
      if (script.includes('Scene')) {
        const parts = script.split(/Scene \d:/i).filter(p => p.trim());
        setScenes(parts.map((p, i) => ({ title: `Scene ${i+1}`, desc: p.trim() })));
      } else {
        setScenes([{ title: 'Full Narrative', desc: script }]);
      }
    } catch (e) {
      alert("Script generation failed.");
    } finally {
      setIsGeneratingScript(false);
    }
  };

  const handleFrameUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'start' | 'end') => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      if (type === 'start') setStartFrame(base64);
      else setEndFrame(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyzeMedia = async (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    setLoadingStatus(`Decoding ${type} insights...`);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const data = reader.result as string;
      if (type === 'image') setResultImage(data);
      try {
        const analysis = await geminiService.analyzeMedia(data, prompt || "Describe this media in detail.", file.type);
        setAnalysisText(analysis);
      } catch (e) {
        alert("Multimodal analysis failed.");
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleTranscribe = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    setLoadingStatus('Synthesizing audio to text...');
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const text = await geminiService.transcribeAudio(reader.result as string);
        setTranscription(text);
      } catch (e) {
        alert("Transcription failed.");
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-24 animate-in fade-in duration-500">
      {/* Magic Tool Header */}
      <div className="flex overflow-x-auto space-x-4 pb-4 scrollbar-hide px-1">
        {[
          { id: 'vision', icon: 'fa-wand-magic-spark', label: 'Vision Studio', color: 'indigo' },
          { id: 'vids', icon: 'fa-clapperboard', label: 'Google Vids Studio', color: 'purple' },
          { id: 'analyze', icon: 'fa-brain', label: 'Insight Lab', color: 'emerald' },
          { id: 'audio', icon: 'fa-microphone-lines', label: 'Sonic Suite', color: 'blue' }
        ].map(tool => (
          <button
            key={tool.id}
            onClick={() => setActiveTool(tool.id as ToolType)}
            className={`flex-shrink-0 flex items-center space-x-3 px-8 py-4 rounded-2xl transition-all duration-300 ${
              activeTool === tool.id 
                ? `bg-${tool.color}-600 text-white shadow-xl shadow-${tool.color}-200 scale-105` 
                : 'bg-white text-slate-500 border border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
            }`}
          >
            <i className={`fa-solid ${tool.icon} text-lg`}></i>
            <span className="font-black text-sm uppercase tracking-widest">{tool.label}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Command Panel */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl space-y-6 sticky top-8 transition-all">
            <div className="flex items-center justify-between">
              <h4 className="font-black text-slate-800 flex items-center uppercase tracking-tighter text-lg">
                <i className={`fa-solid fa-bolt mr-3 text-${activeTool === 'vids' ? 'purple' : 'indigo'}-500 animate-pulse`}></i>
                {activeTool === 'vids' ? 'Vids Storyteller' : 'Magic Console'}
              </h4>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Live Engine</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Creator Prompt</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={activeTool === 'vids' ? "Surprise me with a life-changing story theme..." : `What shall we create in the ${activeTool} suite?`}
                className="w-full bg-slate-50 border border-slate-200 rounded-3xl p-5 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 min-h-[140px] shadow-inner transition-all resize-none"
              />
            </div>

            {activeTool === 'vids' && (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-4">
                <div className="p-4 bg-purple-50 rounded-3xl border border-purple-100 space-y-3 shadow-inner">
                  <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest">Stage 1: Narrative Intelligence</p>
                  <button
                    onClick={handleGenerateScript}
                    disabled={isGeneratingScript || !prompt}
                    className="group w-full py-3 bg-white text-purple-600 border border-purple-200 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-purple-600 hover:text-white disabled:opacity-50 transition-all flex items-center justify-center space-x-2"
                  >
                    <i className="fa-solid fa-pen-nib group-hover:animate-bounce"></i>
                    <span>{isGeneratingScript ? 'Drafting Script...' : 'Generate 60s Storyboard'}</span>
                  </button>
                </div>
                
                {/* Editing Suite: Frame Uploads */}
                <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 border border-slate-200 rounded-3xl">
                   <div className="space-y-2">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Start Frame</p>
                      <button 
                        onClick={() => startFrameRef.current?.click()}
                        className={`w-full aspect-square rounded-xl border-2 border-dashed flex items-center justify-center transition-all overflow-hidden bg-white ${startFrame ? 'border-purple-500' : 'border-slate-200 hover:border-purple-300'}`}
                      >
                        {startFrame ? <img src={startFrame} className="w-full h-full object-cover" /> : <i className="fa-solid fa-plus text-slate-300"></i>}
                      </button>
                      <input type="file" ref={startFrameRef} hidden accept="image/*" onChange={(e) => handleFrameUpload(e, 'start')} />
                   </div>
                   <div className="space-y-2">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">End Frame</p>
                      <button 
                        onClick={() => endFrameRef.current?.click()}
                        className={`w-full aspect-square rounded-xl border-2 border-dashed flex items-center justify-center transition-all overflow-hidden bg-white ${endFrame ? 'border-purple-500' : 'border-slate-200 hover:border-purple-300'}`}
                      >
                        {endFrame ? <img src={endFrame} className="w-full h-full object-cover" /> : <i className="fa-solid fa-plus text-slate-300"></i>}
                      </button>
                      <input type="file" ref={endFrameRef} hidden accept="image/*" onChange={(e) => handleFrameUpload(e, 'end')} />
                   </div>
                </div>

                <div className="space-y-3">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Stage 2: Cinematic Rendering</p>
                  <select
                    value={aspectRatio}
                    onChange={(e) => setAspectRatio(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs font-bold appearance-none cursor-pointer focus:ring-2 focus:ring-purple-500/20"
                  >
                    <option value="16:9">Format: 16:9 Landscape (TV/Youtube)</option>
                    <option value="9:16">Format: 9:16 Portrait (Mobile/TikTok)</option>
                  </select>
                  <div className="flex space-x-2">
                    <button
                      onClick={handleGenerateVideo}
                      disabled={loading || !prompt}
                      className="flex-[2] py-4 bg-slate-900 text-white rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-black disabled:opacity-50 shadow-xl transition-all flex items-center justify-center space-x-3 transform active:scale-95"
                    >
                      <i className="fa-solid fa-clapperboard"></i>
                      <span>{resultVideo ? 'Regenerate' : 'Produce Cut'}</span>
                    </button>
                    {resultVideo && (
                      <button
                        onClick={handleExtendVideo}
                        disabled={loading}
                        className="flex-1 py-4 bg-purple-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-purple-700 disabled:opacity-50 shadow-xl transition-all flex items-center justify-center space-x-2"
                        title="Extend current video by 7 seconds"
                      >
                        <i className="fa-solid fa-plus"></i>
                        <span>+7s</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTool === 'vision' && (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-4">
                <div className="grid grid-cols-2 gap-3">
                  <select
                    value={aspectRatio}
                    onChange={(e) => setAspectRatio(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs font-bold appearance-none cursor-pointer"
                  >
                    {ASPECT_RATIOS.map(r => <option key={r} value={r}>Ratio: {r}</option>)}
                  </select>
                  <select
                    value={imageSize}
                    onChange={(e) => setImageSize(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs font-bold appearance-none cursor-pointer"
                  >
                    {IMAGE_SIZES.map(s => <option key={s} value={s}>Size: {s}</option>)}
                  </select>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={handleGenerateImage}
                    disabled={loading}
                    className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 disabled:opacity-50 shadow-lg shadow-indigo-100 transition-all"
                  >
                    Generate
                  </button>
                  <button
                    onClick={handleEditImage}
                    disabled={loading || !resultImage}
                    className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-emerald-700 disabled:opacity-50 shadow-lg shadow-emerald-100 transition-all"
                  >
                    Edit
                  </button>
                </div>
              </div>
            )}

            {activeTool === 'analyze' && (
              <div className="space-y-3 animate-in fade-in slide-in-from-top-4">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-4 bg-slate-50 text-slate-700 border border-slate-200 rounded-2xl text-xs font-bold hover:bg-white hover:shadow-md transition-all"
                >
                  <i className="fa-solid fa-image mr-3 text-indigo-400"></i> Upload Asset
                </button>
                <button
                  onClick={() => videoInputRef.current?.click()}
                  className="w-full py-4 bg-slate-50 text-slate-700 border border-slate-200 rounded-2xl text-xs font-bold hover:bg-white hover:shadow-md transition-all"
                >
                  <i className="fa-solid fa-video mr-3 text-purple-400"></i> Upload MP4
                </button>
                <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={(e) => handleAnalyzeMedia(e, 'image')} />
                <input type="file" ref={videoInputRef} hidden accept="video/*" onChange={(e) => handleAnalyzeMedia(e, 'video')} />
              </div>
            )}

            {activeTool === 'audio' && (
              <div className="space-y-3 animate-in fade-in slide-in-from-top-4">
                 <button
                  onClick={() => audioInputRef.current?.click()}
                  className="w-full py-4 bg-slate-50 text-slate-700 border border-slate-200 rounded-2xl text-xs font-bold hover:bg-white hover:shadow-md transition-all"
                >
                  <i className="fa-solid fa-file-audio mr-3 text-blue-400"></i> Open Voice File
                </button>
                <input type="file" ref={audioInputRef} hidden accept="audio/*" onChange={handleTranscribe} />
                <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 text-center">
                  <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Hi-Fi Transcription Engine</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Output Canvas */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-slate-950 rounded-[3rem] p-2 shadow-2xl overflow-hidden min-h-[600px] flex items-center justify-center relative border-[12px] border-slate-900 shadow-indigo-500/10">
            {loading && (
              <div className="absolute inset-0 bg-slate-950/90 z-20 flex flex-col items-center justify-center text-white p-12 text-center animate-in fade-in duration-500">
                <div className="relative">
                  <div className="w-24 h-24 border-8 border-indigo-400/20 border-t-indigo-500 rounded-full animate-spin mb-8"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <i className="fa-solid fa-wand-sparkles text-2xl text-indigo-400 animate-pulse"></i>
                  </div>
                </div>
                <h3 className="text-2xl font-black uppercase tracking-widest mb-2">{loadingStatus}</h3>
                <p className="text-slate-500 text-sm font-medium">Bypassing standard limits with Focus Flow Cloud.</p>
                <div className="mt-8 flex space-x-1">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className={`w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:${i*0.2}s]`}></div>
                  ))}
                </div>
              </div>
            )}

            <div className="w-full h-full flex items-center justify-center p-4">
              {/* Empty State */}
              {!loading && !resultImage && !resultVideo && !analysisText && !transcription && scenes.length === 0 && (
                <div className="text-center text-slate-800 space-y-4">
                  <div className="w-32 h-32 bg-slate-900 rounded-full flex items-center justify-center mx-auto border border-slate-800 shadow-inner">
                    <i className="fa-solid fa-atom text-5xl opacity-20 animate-spin-slow"></i>
                  </div>
                  <h3 className="text-xl font-black text-slate-700 uppercase tracking-tighter">System Idle</h3>
                  <p className="text-slate-800 text-xs font-bold uppercase tracking-widest opacity-30 italic">Focus Flow Neural Core v2.5</p>
                </div>
              )}

              {/* Storyboard View (Vids Specific) */}
              {activeTool === 'vids' && !loading && scenes.length > 0 && !resultVideo && (
                <div className="w-full h-full p-8 grid grid-cols-1 md:grid-cols-3 gap-6 overflow-y-auto max-h-[580px] scrollbar-hide animate-in slide-in-from-bottom-12 duration-700">
                  {scenes.map((scene, i) => (
                    <div key={i} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 flex flex-col space-y-4 group hover:bg-white/10 transition-all">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest">Scene 0{i+1}</span>
                        <i className="fa-solid fa-camera-retro text-white/20 group-hover:text-purple-400 transition-colors"></i>
                      </div>
                      <h6 className="text-white font-bold text-sm uppercase tracking-tight">{scene.title}</h6>
                      <p className="text-slate-400 text-xs leading-relaxed italic line-clamp-4">"{scene.desc}"</p>
                      <div className="mt-auto pt-4 flex space-x-2">
                        <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-purple-500 w-full animate-shimmer"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {resultImage && !loading && activeTool !== 'vids' && (
                <div className="relative group animate-in zoom-in-95 duration-500">
                  <img src={resultImage} alt="Workshop Output" className="max-w-full max-h-[500px] rounded-3xl shadow-2xl border border-white/5 object-cover" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center rounded-3xl backdrop-blur-sm">
                     <button onClick={() => window.open(resultImage, '_blank')} className="px-8 py-4 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-110 transition-transform shadow-xl">Export 4K Asset</button>
                     <p className="text-white/40 text-[10px] font-bold uppercase mt-4 tracking-widest">Signed by Coach Kay AI</p>
                  </div>
                </div>
              )}

              {resultVideo && !loading && (
                <div className="relative w-full flex justify-center animate-in scale-95 duration-700">
                  <video src={resultVideo} controls autoPlay loop className="max-w-full max-h-[500px] rounded-3xl shadow-2xl border border-white/10 shadow-purple-500/20" />
                </div>
              )}

              {analysisText && !loading && activeTool === 'analyze' && (
                <div className="bg-white/5 backdrop-blur-3xl p-12 rounded-[2.5rem] text-slate-200 w-full max-h-[500px] overflow-y-auto border border-white/10 scrollbar-hide animate-in fade-in duration-500">
                  <div className="flex items-center space-x-3 mb-8">
                    <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center shadow-lg shadow-indigo-500/40">
                      <i className="fa-solid fa-microchip text-white text-xs"></i>
                    </div>
                    <h5 className="font-black text-indigo-400 uppercase tracking-widest text-xs">Structural Insights Generated</h5>
                  </div>
                  <div className="prose prose-invert prose-sm max-w-none">
                     <p className="text-lg font-medium leading-relaxed whitespace-pre-wrap selection:bg-indigo-500 selection:text-white">{analysisText}</p>
                  </div>
                </div>
              )}

              {transcription && !loading && activeTool === 'audio' && (
                <div className="bg-white/5 backdrop-blur-3xl p-12 rounded-[2.5rem] text-slate-200 w-full max-h-[500px] overflow-y-auto border border-white/10 scrollbar-hide animate-in slide-in-from-right-8 duration-500">
                  <div className="flex items-center space-x-3 mb-8">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/40">
                      <i className="fa-solid fa-wave-square text-white text-xs"></i>
                    </div>
                    <h5 className="font-black text-blue-400 uppercase tracking-widest text-xs">Sonic Transcription Layer</h5>
                  </div>
                  <p className="text-3xl font-serif italic leading-relaxed text-slate-100 bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">"{transcription}"</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center justify-between px-8 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
            <div className="flex items-center space-x-2">
              <i className="fa-solid fa-network-wired text-indigo-500"></i>
              <span>Cluster: Gemini-3-Pro-X</span>
            </div>
            <div className="flex items-center space-x-6">
              <span className="opacity-50">Encryption: AES-256</span>
              <div className="flex items-center space-x-2">
                <span className="text-emerald-500">Live Sync</span>
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-sm shadow-emerald-500"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Workshop;
