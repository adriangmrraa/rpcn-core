'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login, signup } from './actions';

export default function LoginPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(event.currentTarget);
        const action = isLogin ? login : signup;

        try {
            const result = await action(formData);

            if (!result.success) {
                setError(result.error || 'Authentication failed');
                setLoading(false);
                return;
            }

            if (isLogin) {
                router.push('/');
                router.refresh();
            } else {
                // Signup Success
                setIsLogin(true); // Switch to login view
                alert("Identity Initialized successfully. You may now Establish Link.");
                setLoading(false);
            }

        } catch (err: any) {
            console.error('Auth error:', err);
            setError(err.message || 'An unexpected error occurred');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center font-mono">
            <div className="w-full max-w-md p-8 border border-green-900 bg-green-900/5 rounded-lg backdrop-blur-sm shadow-[0_0_20px_rgba(0,255,0,0.05)]">
                <header className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-green-500 mb-2">RPCN ACCESS</h1>
                    <p className="text-green-800 text-xs tracking-widest uppercase">
                        {isLogin ? 'Restricted Neural Interface' : 'Identity Initialization Protocol'}
                    </p>
                </header>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-green-700 text-xs uppercase mb-2">Subject ID (Email)</label>
                        <input
                            name="email"
                            type="email"
                            className="w-full bg-black border border-green-900 text-green-400 p-3 rounded focus:outline-none focus:border-green-500 transition-colors"
                            placeholder="agent@rpcn.network"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-green-700 text-xs uppercase mb-2">Access Key (Password)</label>
                        <input
                            name="password"
                            type="password"
                            className="w-full bg-black border border-green-900 text-green-400 p-3 rounded focus:outline-none focus:border-green-500 transition-colors"
                            placeholder="••••••••••••"
                            required
                            minLength={6}
                        />
                    </div>

                    {error && (
                        <div className="p-3 bg-red-900/20 border border-red-900/50 text-red-500 text-xs rounded animate-pulse">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-green-900/20 border border-green-500 text-green-400 py-3 rounded hover:bg-green-500 hover:text-black transition-all duration-300 uppercase tracking-widest text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_10px_rgba(0,255,0,0.1)] hover:shadow-[0_0_20px_rgba(0,255,0,0.3)]"
                    >
                        {loading
                            ? (isLogin ? 'Authenticating...' : 'Initializing...')
                            : (isLogin ? 'Establish Link' : 'Initialize Identity')
                        }
                    </button>

                    <div className="text-center mt-4">
                        <button
                            type="button"
                            onClick={() => {
                                setIsLogin(!isLogin);
                                setError(null);
                            }}
                            className="text-green-700 hover:text-green-400 text-xs uppercase tracking-wider underline decoration-green-900 underline-offset-4 transition-colors"
                        >
                            {isLogin
                                ? "No credentials? Initialize Identity"
                                : "Already initialized? Establish Link"
                            }
                        </button>
                    </div>
                </form>

                <footer className="mt-8 text-center text-[10px] text-green-900">
                    SECURE CONNECTION // ENCRYPTION: OFF
                </footer>
            </div>
        </div>
    );
}
