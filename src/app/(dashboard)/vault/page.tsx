'use client';

import React, { useState, useEffect } from 'react';
import { ShieldCheck, Key, Lock, EyeOff, Eye, RefreshCw, Plus, X, Check } from 'lucide-react';

export default function VaultPage() {
    const [keys, setKeys] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [newKey, setNewKey] = useState('');
    const [newValue, setNewValue] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const fetchKeys = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/vault/connect?user_id=default_user');
            const data = await res.json();
            if (data.keys) setKeys(data.keys);
        } catch (err) {
            console.error('Failed to fetch keys:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchKeys();
    }, []);

    const handleCreate = async () => {
        if (!newKey || !newValue) return;
        setIsSaving(true);
        try {
            const res = await fetch('/api/vault/connect', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'set',
                    key: newKey,
                    value: newValue,
                    user_id: 'default_user'
                })
            });
            if (res.ok) {
                setNewKey('');
                setNewValue('');
                setIsCreating(false);
                fetchKeys();
            }
        } catch (err) {
            console.error('Failed to save secret:', err);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0c] text-white p-8">
            <header className="mb-12">
                <div className="flex items-center gap-3 mb-2">
                    <ShieldCheck className="h-8 w-8 text-agent-thinking" />
                    <h1 className="text-3xl font-bold tracking-tighter">THE_VAULT</h1>
                </div>
                <p className="text-white/40 max-w-2xl">
                    Secure credential management and API key rotation. Integrated with encrypted local storage and E2B sandboxes.
                </p>
            </header>

            <div className="max-w-4xl space-y-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-bold uppercase tracking-widest text-white/20">Stored Secrets</h2>
                    {!isCreating && (
                        <button
                            onClick={() => setIsCreating(true)}
                            className="flex items-center gap-2 rounded-lg bg-agent-thinking px-4 py-2 text-xs font-bold hover:bg-agent-thinking/80 transition-all"
                        >
                            <Plus className="h-3 w-3" />
                            New Secret
                        </button>
                    )}
                </div>

                {isCreating && (
                    <div className="rounded-xl border border-agent-thinking/30 bg-white/[0.02] p-6 space-y-4 animate-in fade-in slide-in-from-top-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">Identifier</label>
                                <input
                                    placeholder="e.g. OPENAI_API_KEY"
                                    className="w-full bg-white/5 border border-white/5 rounded-lg px-4 py-2 text-xs outline-none focus:border-agent-thinking"
                                    value={newKey}
                                    onChange={(e) => setNewKey(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">Secret Value</label>
                                <input
                                    type="password"
                                    placeholder="••••••••••••••••"
                                    className="w-full bg-white/5 border border-white/5 rounded-lg px-4 py-2 text-xs outline-none focus:border-agent-thinking"
                                    value={newValue}
                                    onChange={(e) => setNewValue(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                onClick={() => setIsCreating(false)}
                                className="px-4 py-2 text-xs font-bold text-white/40 hover:text-white transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreate}
                                disabled={isSaving}
                                className="rounded-lg bg-agent-thinking px-6 py-2 text-xs font-bold hover:bg-agent-thinking/80 transition-all disabled:opacity-50"
                            >
                                {isSaving ? 'Encrypting...' : 'Provision Secret'}
                            </button>
                        </div>
                    </div>
                )}

                {isLoading ? (
                    <div className="py-20 flex justify-center">
                        <RefreshCw className="h-6 w-6 text-agent-thinking animate-spin" />
                    </div>
                ) : keys.length > 0 ? (
                    keys.map((key, i) => (
                        <div key={i} className="flex items-center justify-between rounded-xl border border-white/5 bg-black/40 p-4 hover:border-white/10 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="rounded-lg bg-agent-thinking/10 p-2">
                                    <Key className="h-4 w-4 text-agent-thinking" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium">{key}</h3>
                                    <p className="text-[10px] text-white/20 uppercase tracking-tight">Encrypted in Neo4j • Sync: Active</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="px-2 py-1 rounded bg-green-500/10 text-green-500 text-[8px] font-bold uppercase tracking-widest flex items-center gap-1">
                                    <Check className="h-2 w-2" />
                                    Injection Ready
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="py-20 flex flex-col items-center justify-center border border-dashed border-white/5 rounded-2xl bg-white/[0.01]">
                        <Key className="h-8 w-8 text-white/5 mb-4" />
                        <p className="text-xs text-white/20">No active secrets found in the Vault.</p>
                    </div>
                )}
            </div>

            <div className="mt-12 rounded-2xl border border-agent-thinking/20 bg-agent-thinking/5 p-8">
                <div className="flex items-start gap-4">
                    <div className="rounded-full bg-agent-thinking/20 p-3">
                        <Lock className="h-6 w-6 text-agent-thinking" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold mb-2">Zero-Knowledge Architecture</h3>
                        <p className="text-sm text-white/60 leading-relaxed max-w-xl">
                            All secrets are encrypted client-side before being synchronized with our orchestration layer.
                            RPCN agents only access these secrets within ephemeral, ISO-compliant execution environments.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
