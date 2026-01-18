'use client';

import React, { useEffect, useState } from 'react';
import { ReactFlow, Background, Controls, Node, Edge, BackgroundVariant, useNodesState, useEdgesState } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useUIStore } from '@/lib/store';

export default function MemoryPalace() {
    const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
    const { setRightPaneMode, setRightPaneContent } = useUIStore();

    const [injectionText, setInjectionText] = useState('');
    const [isInjecting, setIsInjecting] = useState(false);

    const handleTeach = async () => {
        if (!injectionText.trim()) return;
        setIsInjecting(true);
        try {
            const res = await fetch('/api/memory/learn', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'preference',
                    key: 'User Input',
                    value: injectionText
                })
            });
            if (res.ok) {
                setInjectionText('');
                // Refresh memory map
                window.location.reload();
            }
        } catch (err) {
            console.error('Failed to teach agent:', err);
        } finally {
            setIsInjecting(false);
        }
    };

    useEffect(() => {
        setRightPaneMode('graph');

        const fetchMemory = async () => {
            try {
                const res = await fetch('/api/memory/context');
                const data = await res.json();

                // Use the knowledge_graph wrapper if present, otherwise fallback
                const kg = data.knowledge_graph || data;
                const nodesData = kg.nodes || [];
                const edgesData = kg.edges || [];

                const flowNodes = nodesData.map((n: any, idx: number) => ({
                    id: n.id,
                    data: { label: n.label || n.id },
                    // Improved positioning: circular or grid-like base to avoid overlap
                    position: {
                        x: 400 + Math.cos(idx * 0.8) * (200 + idx * 20),
                        y: 300 + Math.sin(idx * 0.8) * (200 + idx * 20)
                    },
                    style: {
                        background: n.label === 'User' ? '#8b5cf6' : '#1e1e24',
                        color: '#fff',
                        borderRadius: '8px',
                        border: '1px solid rgba(255,255,255,0.1)',
                        padding: '12px',
                        fontSize: '12px',
                        width: 150,
                    }
                }));

                const flowEdges = edgesData.map((e: any, i: number) => ({
                    id: `e-${i}`,
                    source: e.from || e.source,
                    target: e.to || e.target,
                    label: e.label,
                    animated: true,
                    style: { stroke: '#4b5563', strokeWidth: 1 },
                    labelStyle: { fill: '#fff', fontSize: 10, fontWeight: 700 }
                }));

                setNodes(flowNodes);
                setEdges(flowEdges);
            } catch (err) {
                console.error('Failed to fetch memory map:', err);
            }
        };

        fetchMemory();
    }, [setRightPaneMode]);

    return (
        <div className="flex flex-col h-full bg-[#0a0a0c] text-white">
            <div className="flex-1 relative">
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    fitView
                >
                    <Background color="#111" gap={20} variant={BackgroundVariant.Dots} />
                    <Controls className="bg-black/40 border-white/10" />
                </ReactFlow>
            </div>

            {/* Teaching Overlay */}
            <div className="absolute top-6 right-6 w-72 rounded-xl bg-black/60 border border-white/10 p-5 backdrop-blur-xl shadow-2xl">
                <h3 className="text-[10px] font-bold uppercase tracking-widest mb-3 text-white/40">Knowledge Injection</h3>
                <textarea
                    placeholder="Example: I prefer using Rust for performance-critical systems..."
                    className="w-full bg-white/5 border border-white/5 rounded-lg p-3 text-xs outline-none focus:border-agent-thinking transition-all min-h-[120px] resize-none"
                    value={injectionText}
                    onChange={(e) => setInjectionText(e.target.value)}
                    disabled={isInjecting}
                />
                <button
                    onClick={handleTeach}
                    disabled={isInjecting}
                    className="mt-4 w-full bg-agent-thinking py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-agent-thinking/80 transition-all active:scale-95 shadow-lg shadow-agent-thinking/20 disabled:opacity-50"
                >
                    {isInjecting ? 'Processing...' : 'Update Neural Map'}
                </button>
            </div>
        </div>
    );
}
