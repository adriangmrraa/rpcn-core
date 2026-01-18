'use client';

import React, { useMemo } from 'react';
import {
    ReactFlow,
    Background,
    Controls,
    Edge,
    Node,
    Panel,
    Handle,
    Position
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

const initialNodes: Node[] = [
    { id: '1', position: { x: 0, y: 0 }, data: { label: 'User: Default' }, type: 'input' },
    { id: '2', position: { x: 0, y: 100 }, data: { label: 'Project: RPCN' } },
    { id: '3', position: { x: -100, y: 200 }, data: { label: 'Preference: Dark Mode' } },
    { id: '4', position: { x: 100, y: 200 }, data: { label: 'Tech: Next.js' } },
];

const initialEdges: Edge[] = [
    { id: 'e1-2', source: '1', target: '2', animated: true },
    { id: 'e2-3', source: '2', target: '3' },
    { id: 'e2-4', source: '2', target: '4' },
];

export function MemoryGraph() {
    const nodeTypes = useMemo(() => ({
        // Custom nodes can be added here
    }), []);

    return (
        <div className="h-full w-full rounded-xl overflow-hidden border border-white/5 bg-[#050505]">
            <ReactFlow
                nodes={initialNodes}
                edges={initialEdges}
                colorMode="dark"
                fitView
            >
                <Background gap={20} color="#111" />
                <Controls showInteractive={false} className="bg-black/50 border-white/10" />
                <Panel position="top-right" className="bg-black/80 p-2 rounded border border-white/10 text-[10px] text-foreground/40 font-bold uppercase tracking-widest">
                    Live Knowledge Graph
                </Panel>
            </ReactFlow>
        </div>
    );
}
