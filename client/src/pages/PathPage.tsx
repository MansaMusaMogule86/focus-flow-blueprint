import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, LoadingSpinner } from '../components/ui';
import { api } from '../services/api';
import { useStore } from '../store';

interface PathStep {
    id: string;
    stepNumber: number;
    title: string;
    purpose: string;
    description: string;
    tools: string[];
    moduleId: string;
    vaultType: string;
    status: 'locked' | 'unlocked' | 'in_progress' | 'completed';
    completedAt?: string;
    vaultItemId?: string;
}

interface PathProgress {
    completed: number;
    total: number;
    percentage: number;
    currentStepId?: string;
}

export const PathPage: React.FC = () => {
    const navigate = useNavigate();
    const [steps, setSteps] = useState<PathStep[]>([]);
    const [progress, setProgress] = useState<PathProgress | null>(null);
    const [loading, setLoading] = useState(true);
    const theme = useStore((state) => state.theme);

    useEffect(() => {
        fetchPath();
    }, []);

    const fetchPath = async () => {
        try {
            const data = await api.path.get();
            setSteps(data.steps);
            setProgress(data.progress);
        } catch (e) {
            console.error('Failed to fetch path:', e);
        } finally {
            setLoading(false);
        }
    };

    const handleStepClick = (step: PathStep) => {
        if (step.status === 'locked') return;
        navigate(`/path/${step.stepNumber}`);
    };

    const statusConfig: Record<string, { color: string; bg: string; icon: string; label: string }> = {
        locked: { color: 'text-slate-400', bg: 'bg-slate-200 dark:bg-slate-700', icon: 'fa-lock', label: 'Locked' },
        unlocked: { color: 'text-amber-600', bg: 'bg-amber-500', icon: 'fa-unlock', label: 'Ready' },
        in_progress: { color: 'text-blue-600', bg: 'bg-blue-500 animate-pulse', icon: 'fa-circle-play', label: 'In Progress' },
        completed: { color: 'text-emerald-600', bg: 'bg-emerald-500', icon: 'fa-check', label: 'Complete' },
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <div className={`min-h-screen ${theme.mode === 'dark' ? 'dark bg-slate-950' : 'bg-slate-50'}`}>
            {/* Header */}
            <div className="bg-gradient-to-r from-violet-900 via-purple-900 to-fuchsia-900 text-white">
                <div className="max-w-5xl mx-auto px-6 py-10">
                    <div className="flex items-center justify-between mb-8">
                        <button
                            onClick={() => navigate('/')}
                            className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                            title="Go Back"
                            aria-label="Go Back"
                        >
                            <i className="fa-solid fa-arrow-left" />
                        </button>
                    </div>

                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                            <i className="fa-solid fa-route text-3xl" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-black uppercase tracking-tighter">
                                The Elevation Path
                            </h1>
                            <p className="text-white/70 text-sm">
                                8 steps to transform yourself with AI
                            </p>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    {progress && (
                        <div className="mt-6">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-white/70">
                                    Your Progress
                                </span>
                                <span className="text-sm font-bold">
                                    {progress.completed} / {progress.total} Steps
                                </span>
                            </div>
                            <div className="bg-white/10 rounded-full h-4 overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-violet-400 via-purple-400 to-fuchsia-400 transition-all duration-700 ease-out"
                                    style={{ width: `${progress.percentage}%` } as React.CSSProperties}
                                />
                            </div>
                            <p className="text-right text-[10px] font-bold uppercase tracking-widest text-white/50 mt-1">
                                {progress.percentage}% Complete
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Steps Grid */}
            <div className="max-w-5xl mx-auto px-6 py-10">
                <div className="grid gap-4">
                    {steps.map((step, index) => {
                        const config = statusConfig[step.status];
                        const isClickable = step.status !== 'locked';

                        return (
                            <Card
                                key={step.id}
                                className={`relative overflow-hidden transition-all duration-300 ${step.status === 'locked' ? 'opacity-50 grayscale' : ''
                                    } ${isClickable ? 'hover:shadow-lg hover:scale-[1.01] cursor-pointer' : 'cursor-not-allowed'}`}
                                onClick={() => handleStepClick(step)}
                            >
                                <div className="flex gap-5 p-6">
                                    {/* Step Number & Status */}
                                    <div className="flex flex-col items-center gap-2">
                                        <div className={`w-14 h-14 rounded-2xl ${config.bg} flex items-center justify-center text-white font-black text-xl shrink-0`}>
                                            {step.status === 'completed' ? (
                                                <i className="fa-solid fa-check" />
                                            ) : (
                                                step.stepNumber
                                            )}
                                        </div>
                                        {/* Connector Line */}
                                        {index < steps.length - 1 && (
                                            <div className={`w-0.5 flex-1 min-h-[2rem] ${step.status === 'completed' ? 'bg-emerald-300' : 'bg-slate-200 dark:bg-slate-700'
                                                }`} />
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                                            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${step.status === 'completed' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' :
                                                step.status === 'in_progress' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' :
                                                    step.status === 'unlocked' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600' :
                                                        'bg-slate-100 dark:bg-slate-800 text-slate-500'
                                                }`}>
                                                {config.label}
                                            </span>
                                        </div>

                                        <h3 className="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white mb-1">
                                            {step.title}
                                        </h3>
                                        <p className="text-sm font-medium text-violet-600 dark:text-violet-400 mb-2">
                                            {step.purpose}
                                        </p>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                                            {step.description}
                                        </p>

                                        {/* Tools */}
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {step.tools.map((tool) => (
                                                <span
                                                    key={tool}
                                                    className="text-[10px] font-bold uppercase tracking-widest bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-3 py-1 rounded-lg"
                                                >
                                                    <i className="fa-solid fa-cube mr-1" />
                                                    {tool}
                                                </span>
                                            ))}
                                        </div>

                                        {/* Status Messages */}
                                        {step.status === 'completed' && step.completedAt && (
                                            <div className="flex items-center gap-2 text-emerald-600">
                                                <i className="fa-solid fa-circle-check" />
                                                <span className="text-[10px] font-bold uppercase tracking-widest">
                                                    Completed {new Date(step.completedAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        )}

                                        {step.status === 'unlocked' && (
                                            <div className="flex items-center gap-2 text-amber-600">
                                                <i className="fa-solid fa-play-circle" />
                                                <span className="text-[10px] font-bold uppercase tracking-widest">
                                                    Click to begin this step
                                                </span>
                                            </div>
                                        )}

                                        {step.status === 'in_progress' && (
                                            <div className="flex items-center gap-2 text-blue-600">
                                                <i className="fa-solid fa-rocket" />
                                                <span className="text-[10px] font-bold uppercase tracking-widest">
                                                    Click to continue working
                                                </span>
                                            </div>
                                        )}

                                        {step.status === 'locked' && (
                                            <div className="flex items-center gap-2 text-slate-400">
                                                <i className="fa-solid fa-lock" />
                                                <span className="text-[10px] font-bold uppercase tracking-widest">
                                                    Complete previous step to unlock
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Arrow for clickable steps */}
                                    {isClickable && (
                                        <div className="flex items-center">
                                            <i className="fa-solid fa-chevron-right text-slate-300 dark:text-slate-600" />
                                        </div>
                                    )}
                                </div>
                            </Card>
                        );
                    })}
                </div>

                {/* Completion Message */}
                {progress && progress.completed === progress.total && (
                    <Card className="mt-8 bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
                        <div className="p-8 text-center">
                            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <i className="fa-solid fa-crown text-4xl" />
                            </div>
                            <h2 className="text-2xl font-black uppercase tracking-tighter mb-2">
                                Path Complete!
                            </h2>
                            <p className="text-white/80 mb-4">
                                You've completed all 8 steps of The Elevation Path. Your Clone is now powered by your complete journey.
                            </p>
                            <button
                                onClick={() => navigate('/clone')}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-emerald-600 rounded-2xl font-bold hover:bg-white/90 transition-colors"
                            >
                                <i className="fa-solid fa-robot" />
                                Talk to Your Clone
                            </button>
                        </div>
                    </Card>
                )}
            </div>
        </div>
    );
};
