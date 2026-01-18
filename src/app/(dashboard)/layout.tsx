'use client';

import React from 'react';
import { Workspace } from '@/components/Workspace';
import { useUIStore } from '@/lib/store';
import { ThoughtSpace } from '@/components/ThoughtSpace';
import { MemoryGraph } from '@/components/MemoryGraph';
import { CodeArtifact } from '@/components/CodeArtifact';
import { LiveTerminal } from '@/components/LiveTerminal';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { rightPaneMode } = useUIStore();

    // Default right pane components based on mode
    const renderRightPane = () => {
        switch (rightPaneMode) {
            case 'graph':
                return <MemoryGraph />;
            case 'artifact':
                return <CodeArtifact />;
            case 'terminal':
                return <LiveTerminal />;
            case 'thoughts':
            default:
                // Note: Actual thoughts for the Thread page are managed via store/teleportation 
                // in the refactored version to avoid complex prop drilling from layout.
                return null;
        }
    };

    return (
        <Workspace>
            {children}
        </Workspace>
    );
}
