import React, { useState } from 'react';
import { Button, Card } from '../components/ui';
import { api } from '../services/api';
import { useStore } from '../store';

type OnboardingStep = 'welcome' | 'intent' | 'commit';

const GOALS_OPTIONS = [
    { id: 'content', label: 'Create compelling content', icon: 'fa-pen-fancy' },
    { id: 'automate', label: 'Automate my workflows', icon: 'fa-robot' },
    { id: 'learn', label: 'Master AI tools', icon: 'fa-brain' },
    { id: 'brand', label: 'Build my personal brand', icon: 'fa-star' },
    { id: 'business', label: 'Grow my business', icon: 'fa-chart-line' },
    { id: 'creativity', label: 'Unlock creativity', icon: 'fa-lightbulb' },
];

export const OnboardingPage: React.FC = () => {
    const [step, setStep] = useState<OnboardingStep>('welcome');
    const [loading, setLoading] = useState(false);
    const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
    const [timeline, setTimeline] = useState('');
    const [experience, setExperience] = useState('');
    const theme = useStore((state) => state.theme);

    const handleWelcome = async () => {
        setLoading(true);
        try {
            await api.onboarding.welcome();
            setStep('intent');
        } catch (e) {
            console.error('Failed to proceed:', e);
        } finally {
            setLoading(false);
        }
    };

    const handleIntent = async () => {
        if (selectedGoals.length === 0) {
            alert('Please select at least one goal');
            return;
        }

        setLoading(true);
        try {
            await api.onboarding.intent({
                goals: selectedGoals,
                timeline,
                experience,
            });
            setStep('commit');
        } catch (e) {
            console.error('Failed to save intent:', e);
        } finally {
            setLoading(false);
        }
    };

    const handleCommit = async () => {
        setLoading(true);
        try {
            const result = await api.onboarding.commit(true);
            if (result.redirectTo) {
                window.location.href = result.redirectTo;
            }
        } catch (e) {
            console.error('Failed to complete onboarding:', e);
        } finally {
            setLoading(false);
        }
    };

    const toggleGoal = (goalId: string) => {
        setSelectedGoals(prev =>
            prev.includes(goalId)
                ? prev.filter(g => g !== goalId)
                : [...prev, goalId]
        );
    };

    return (
        <div className={`min-h-screen ${theme.mode === 'dark' ? 'dark bg-slate-950' : 'bg-gradient-to-br from-violet-100 via-purple-50 to-fuchsia-100'}`}>
            <div className="max-w-2xl mx-auto px-6 py-16">
                {/* Progress */}
                <div className="flex items-center justify-center gap-2 mb-12">
                    {['welcome', 'intent', 'commit'].map((s, i) => (
                        <React.Fragment key={s}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${step === s ? 'bg-violet-600 text-white scale-110' :
                                    ['intent', 'commit'].indexOf(step) > i || step === 'commit' ? 'bg-emerald-500 text-white' :
                                        'bg-slate-200 dark:bg-slate-700 text-slate-500'
                                }`}>
                                {['intent', 'commit'].indexOf(step) > i ? (
                                    <i className="fa-solid fa-check" />
                                ) : (
                                    i + 1
                                )}
                            </div>
                            {i < 2 && (
                                <div className={`w-16 h-1 rounded-full transition-all ${['intent', 'commit'].indexOf(step) > i ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'
                                    }`} />
                            )}
                        </React.Fragment>
                    ))}
                </div>

                {/* Welcome Step */}
                {step === 'welcome' && (
                    <Card className="p-12 text-center">
                        <div className="w-24 h-24 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-full flex items-center justify-center mx-auto mb-8">
                            <i className="fa-solid fa-rocket text-4xl text-white" />
                        </div>
                        <h1 className="text-4xl font-black uppercase tracking-tighter text-slate-900 dark:text-white mb-4">
                            Welcome to Your Transformation
                        </h1>
                        <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto">
                            This is more than an AI platform. It's your personal evolution system.
                        </p>
                        <div className="space-y-4 text-left max-w-md mx-auto mb-8">
                            {[
                                { icon: 'fa-route', text: 'Follow The Path - 8 transformative steps' },
                                { icon: 'fa-vault', text: 'Build Your Vault - store your creations' },
                                { icon: 'fa-robot', text: 'Activate Your Clone - your AI twin' },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                                    <div className="w-10 h-10 bg-violet-100 dark:bg-violet-900/30 rounded-lg flex items-center justify-center">
                                        <i className={`fa-solid ${item.icon} text-violet-600`} />
                                    </div>
                                    <span className="font-medium text-slate-700 dark:text-slate-300">{item.text}</span>
                                </div>
                            ))}
                        </div>
                        <Button variant="primary" size="lg" onClick={handleWelcome} loading={loading}>
                            Begin My Journey <i className="fa-solid fa-arrow-right ml-2" />
                        </Button>
                    </Card>
                )}

                {/* Intent Step */}
                {step === 'intent' && (
                    <Card className="p-10">
                        <h2 className="text-3xl font-black uppercase tracking-tighter text-slate-900 dark:text-white mb-2 text-center">
                            What Brings You Here?
                        </h2>
                        <p className="text-slate-500 text-center mb-8">
                            Select your goals. This helps Coach Kay guide you better.
                        </p>

                        <div className="grid grid-cols-2 gap-3 mb-8">
                            {GOALS_OPTIONS.map((goal) => (
                                <button
                                    key={goal.id}
                                    onClick={() => toggleGoal(goal.id)}
                                    className={`p-4 rounded-xl border-2 transition-all text-left ${selectedGoals.includes(goal.id)
                                            ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/30'
                                            : 'border-slate-200 dark:border-slate-700 hover:border-violet-300'
                                        }`}
                                >
                                    <i className={`fa-solid ${goal.icon} text-violet-600 mb-2`} />
                                    <p className="font-medium text-sm text-slate-700 dark:text-slate-300">{goal.label}</p>
                                </button>
                            ))}
                        </div>

                        <div className="space-y-4 mb-8">
                            <div>
                                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2 block">
                                    Your Timeline
                                </label>
                                <select
                                    value={timeline}
                                    onChange={(e) => setTimeline(e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white"
                                >
                                    <option value="">Select timeline...</option>
                                    <option value="1-week">1 week sprint</option>
                                    <option value="1-month">1 month focus</option>
                                    <option value="3-months">3 month transformation</option>
                                    <option value="ongoing">Ongoing journey</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2 block">
                                    AI Experience
                                </label>
                                <select
                                    value={experience}
                                    onChange={(e) => setExperience(e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white"
                                >
                                    <option value="">Select experience level...</option>
                                    <option value="beginner">New to AI</option>
                                    <option value="intermediate">Used some AI tools</option>
                                    <option value="advanced">Power user</option>
                                </select>
                            </div>
                        </div>

                        <Button variant="primary" size="lg" className="w-full" onClick={handleIntent} loading={loading}>
                            Continue <i className="fa-solid fa-arrow-right ml-2" />
                        </Button>
                    </Card>
                )}

                {/* Commit Step */}
                {step === 'commit' && (
                    <Card className="p-12 text-center">
                        <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-8">
                            <i className="fa-solid fa-handshake text-4xl text-white" />
                        </div>
                        <h2 className="text-3xl font-black uppercase tracking-tighter text-slate-900 dark:text-white mb-4">
                            One Last Thing
                        </h2>
                        <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto">
                            Transformation requires commitment. Are you ready to show up for yourself?
                        </p>

                        <div className="bg-violet-50 dark:bg-violet-900/20 rounded-2xl p-6 mb-8 text-left">
                            <h3 className="font-bold text-violet-900 dark:text-violet-300 mb-3">My Commitment:</h3>
                            <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-400">
                                <li className="flex items-center gap-2">
                                    <i className="fa-solid fa-check text-emerald-500" />
                                    I will complete The Path step by step
                                </li>
                                <li className="flex items-center gap-2">
                                    <i className="fa-solid fa-check text-emerald-500" />
                                    I will save my work to the Vault
                                </li>
                                <li className="flex items-center gap-2">
                                    <i className="fa-solid fa-check text-emerald-500" />
                                    I will build my Clone with intention
                                </li>
                            </ul>
                        </div>

                        <Button variant="primary" size="lg" className="w-full" onClick={handleCommit} loading={loading}>
                            <i className="fa-solid fa-bolt mr-2" />
                            I'm Ready - Let's Begin
                        </Button>
                    </Card>
                )}
            </div>
        </div>
    );
};
