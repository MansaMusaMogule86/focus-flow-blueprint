import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Card, LoadingSpinner } from '../components/ui';
import { api } from '../services/api';
import { useStore } from '../store';

interface StepConfig {
    id: string;
    stepNumber: number;
    title: string;
    purpose: string;
    description: string;
    tools: string[];
    moduleId: string;
    vaultType: string;
    status: string;
    prompt: string;
    inputPlaceholder: string;
}

// Step-specific configurations
const STEP_CONFIGS: Record<number, { prompt: string; inputPlaceholder: string }> = {
    1: {
        prompt: 'Reflect on your current reality. What are your strengths? What challenges do you face? Where are you starting from?',
        inputPlaceholder: 'Describe your current situation, strengths, and areas for growth...',
    },
    2: {
        prompt: 'Envision your future self. Who do you want to become? What does success look like in 1 year? 5 years?',
        inputPlaceholder: 'Describe your vision for your future self in detail...',
    },
    3: {
        prompt: 'Design your daily habits. What routines will move you toward your vision? What systems will you build?',
        inputPlaceholder: 'List the daily habits and routines you will implement...',
    },
    4: {
        prompt: 'Craft your personal narrative. What is your story? How will you communicate your transformation?',
        inputPlaceholder: 'Write your personal story and brand message...',
    },
    5: {
        prompt: 'Master your communication. What message do you want to share? How will you speak your truth?',
        inputPlaceholder: 'Define your communication style and core messages...',
    },
    6: {
        prompt: 'Synthesize your wisdom. What knowledge do you need to acquire? What expertise will you develop?',
        inputPlaceholder: 'Outline the knowledge areas you will master...',
    },
    7: {
        prompt: 'Build your visual identity. What does your brand look like? Describe the imagery that represents you.',
        inputPlaceholder: 'Describe your visual brand, colors, style, and assets...',
    },
    8: {
        prompt: 'Activate your Clone. Review everything you\'ve created. Your Clone will learn from all your Vault items.',
        inputPlaceholder: 'Add any final thoughts or instructions for your Clone...',
    },
};

export const StepPage: React.FC = () => {
    const { stepNumber } = useParams<{ stepNumber: string }>();
    const navigate = useNavigate();
    const theme = useStore((state) => state.theme);

    const [step, setStep] = useState<StepConfig | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'input' | 'preview'>('input');
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [processing, setProcessing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        if (stepNumber) {
            fetchStep(parseInt(stepNumber));
        }
    }, [stepNumber]);

    const fetchStep = async (num: number) => {
        setLoading(true);
        try {
            const data = await api.path.get();
            const stepData = data.steps.find((s: any) => s.stepNumber === num);

            if (!stepData) {
                navigate('/path');
                return;
            }

            // Check if step is accessible
            if (stepData.status === 'locked') {
                navigate('/path');
                return;
            }

            const config = STEP_CONFIGS[num] || { prompt: '', inputPlaceholder: '' };
            setStep({ ...stepData, ...config });

            // Mark step as in_progress if not already
            if (stepData.status === 'unlocked') {
                await api.path.start(stepData.id);
            }
        } catch (e) {
            console.error('Failed to fetch step:', e);
            navigate('/path');
        } finally {
            setLoading(false);
        }
    };

    const handleSynthesize = async () => {
        if (!input.trim() || !step) return;

        setProcessing(true);
        setOutput('');

        try {
            // Use the AI module associated with this step
            const result = await api.ai.execute(step.moduleId, {
                content: `${step.prompt}\n\nUser Input:\n${input}`,
            });

            setOutput(result.output || result.result || 'Processing complete.');
            setActiveTab('preview');
        } catch (e: any) {
            setOutput(`Error: ${e.message}`);
        } finally {
            setProcessing(false);
        }
    };

    const handleSaveToVault = async () => {
        if (!output || !step) return;

        setSaving(true);
        try {
            await api.vault.save({
                type: step.vaultType as any,
                title: `Step ${step.stepNumber}: ${step.title}`,
                content: output,
                moduleId: step.moduleId,
                moduleName: step.title,
                tags: ['path', `step-${step.stepNumber}`, step.title.toLowerCase()],
            });
            setSaved(true);
        } catch (e) {
            console.error('Failed to save to vault:', e);
        } finally {
            setSaving(false);
        }
    };

    const handleCompleteStep = async () => {
        if (!step) return;

        setProcessing(true);
        try {
            await api.path.complete(step.id);

            // Navigate to next step or back to path
            const nextStep = step.stepNumber + 1;
            if (nextStep <= 8) {
                navigate(`/path/${nextStep}`);
            } else {
                navigate('/clone');
            }
        } catch (e) {
            console.error('Failed to complete step:', e);
        } finally {
            setProcessing(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (!step) {
        return null;
    }

    return (
        <div className={`min-h-screen ${theme.mode === 'dark' ? 'dark bg-slate-950' : 'bg-slate-50'}`}>
            {/* Header */}
            <div className="bg-gradient-to-r from-violet-900 via-purple-900 to-fuchsia-900 text-white">
                <div className="max-w-4xl mx-auto px-6 py-8">
                    <div className="flex items-center justify-between mb-6">
                        <button
                            onClick={() => navigate('/path')}
                            className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                        >
                            <i className="fa-solid fa-arrow-left" />
                        </button>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-white/50">
                            Step {step.stepNumber} of 8
                        </span>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm text-2xl font-black">
                            {step.stepNumber}
                        </div>
                        <div>
                            <h1 className="text-3xl font-black uppercase tracking-tighter">
                                {step.title}
                            </h1>
                            <p className="text-white/70">{step.purpose}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="max-w-4xl mx-auto px-6 pt-6">
                <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-fit">
                    <button
                        onClick={() => setActiveTab('input')}
                        className={`px-6 py-2 rounded-lg text-sm font-bold uppercase tracking-widest transition-all ${activeTab === 'input'
                                ? 'bg-white dark:bg-slate-700 text-violet-600 shadow'
                                : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        <i className="fa-solid fa-brain mr-2" />
                        Neural Input
                    </button>
                    <button
                        onClick={() => setActiveTab('preview')}
                        className={`px-6 py-2 rounded-lg text-sm font-bold uppercase tracking-widest transition-all ${activeTab === 'preview'
                                ? 'bg-white dark:bg-slate-700 text-violet-600 shadow'
                                : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        <i className="fa-solid fa-eye mr-2" />
                        Visual Preview
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-6 py-6">
                {/* Neural Input Tab */}
                {activeTab === 'input' && (
                    <Card className="p-6">
                        <div className="mb-6">
                            <h3 className="text-lg font-black uppercase tracking-tighter text-slate-900 dark:text-white mb-2">
                                Your Prompt
                            </h3>
                            <p className="text-slate-600 dark:text-slate-400">
                                {step.prompt}
                            </p>
                        </div>

                        <div className="mb-6">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2 block">
                                Your Response
                            </label>
                            <textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder={step.inputPlaceholder}
                                rows={8}
                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 resize-none"
                            />
                        </div>

                        <div className="flex gap-3">
                            <Button
                                variant="primary"
                                size="lg"
                                onClick={handleSynthesize}
                                loading={processing}
                                disabled={!input.trim()}
                                className="flex-1"
                            >
                                <i className="fa-solid fa-wand-magic-sparkles mr-2" />
                                Synthesize
                            </Button>
                        </div>
                    </Card>
                )}

                {/* Visual Preview Tab */}
                {activeTab === 'preview' && (
                    <Card className="p-6">
                        {output ? (
                            <>
                                <div className="mb-6">
                                    <h3 className="text-lg font-black uppercase tracking-tighter text-slate-900 dark:text-white mb-2">
                                        AI Synthesis
                                    </h3>
                                    <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-6 min-h-[200px]">
                                        <pre className="whitespace-pre-wrap text-slate-700 dark:text-slate-300 font-sans">
                                            {output}
                                        </pre>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <Button
                                        variant="secondary"
                                        size="lg"
                                        onClick={() => setActiveTab('input')}
                                        className="flex-1"
                                    >
                                        <i className="fa-solid fa-pen mr-2" />
                                        Edit Input
                                    </Button>
                                    <Button
                                        variant="primary"
                                        size="lg"
                                        onClick={handleSaveToVault}
                                        loading={saving}
                                        disabled={saved}
                                        className="flex-1"
                                    >
                                        {saved ? (
                                            <>
                                                <i className="fa-solid fa-check mr-2" />
                                                Saved to Vault
                                            </>
                                        ) : (
                                            <>
                                                <i className="fa-solid fa-vault mr-2" />
                                                Save to Vault
                                            </>
                                        )}
                                    </Button>
                                </div>

                                {saved && (
                                    <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                                        <Button
                                            variant="primary"
                                            size="lg"
                                            onClick={handleCompleteStep}
                                            loading={processing}
                                            className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
                                        >
                                            <i className="fa-solid fa-check-double mr-2" />
                                            Complete Step & Continue
                                        </Button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-16">
                                <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <i className="fa-solid fa-eye-slash text-3xl text-slate-300 dark:text-slate-600" />
                                </div>
                                <h3 className="text-lg font-black uppercase tracking-tighter text-slate-900 dark:text-white mb-2">
                                    No Preview Yet
                                </h3>
                                <p className="text-slate-500 mb-6">
                                    Complete the Neural Input and synthesize to see your preview.
                                </p>
                                <Button variant="secondary" onClick={() => setActiveTab('input')}>
                                    <i className="fa-solid fa-arrow-left mr-2" />
                                    Go to Input
                                </Button>
                            </div>
                        )}
                    </Card>
                )}
            </div>
        </div>
    );
};
