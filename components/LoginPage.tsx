import React, { useState } from 'react';
import BrandLogo from './BrandLogo';

interface LoginPageProps {
    onLogin: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Simulate auth - in production, call actual auth API
        setTimeout(() => {
            if (email && password && (isLogin || name)) {
                // Store auth in localStorage
                localStorage.setItem('auth_user', JSON.stringify({ email, name: name || email.split('@')[0] }));
                onLogin();
            } else {
                setError('Please fill in all fields');
            }
            setLoading(false);
        }, 800);
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background effects */}
            <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-indigo-600/10 rounded-full -ml-96 -mt-96 blur-[200px]"></div>
            <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-purple-600/10 rounded-full -mr-64 -mb-64 blur-[200px]"></div>

            <div className="w-full max-w-md relative z-10">
                {/* Logo */}
                <div className="text-center mb-12">
                    <BrandLogo size="lg" className="justify-center" />
                    <h1 className="text-4xl font-black uppercase tracking-tighter text-white mt-6">
                        {isLogin ? 'Welcome Back' : 'Join the Path'}
                    </h1>
                    <p className="text-slate-400 mt-3">
                        {isLogin ? 'Continue your transformation journey' : 'Begin your 8-week transformation'}
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="bg-white rounded-[3rem] p-10 shadow-2xl">
                    {error && (
                        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-600 text-sm font-medium">
                            {error}
                        </div>
                    )}

                    <div className="space-y-6">
                        {!isLogin && (
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">
                                    Your Name
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Enter your name"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                                />
                            </div>
                        )}

                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">
                                Email Address
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                            />
                        </div>

                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">
                                Password
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full mt-8 py-5 bg-slate-950 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-indigo-600 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <><i className="fa-solid fa-circle-notch fa-spin mr-2"></i>Processing...</>
                        ) : isLogin ? (
                            <><i className="fa-solid fa-right-to-bracket mr-2"></i>Sign In</>
                        ) : (
                            <><i className="fa-solid fa-rocket mr-2"></i>Create Account</>
                        )}
                    </button>

                    <div className="mt-6 text-center">
                        <button
                            type="button"
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                        >
                            {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
                        </button>
                    </div>
                </form>

                {/* Footer */}
                <p className="text-center text-slate-500 text-xs mt-8">
                    By continuing, you agree to begin your transformation journey.
                </p>
            </div>
        </div>
    );
};

export default LoginPage;
