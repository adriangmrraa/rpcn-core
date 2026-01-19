import { create } from 'zustand';

export type PaneMode = 'thoughts' | 'graph' | 'artifact' | 'terminal' | 'settings';

interface UIState {
    rightPaneMode: PaneMode;
    setRightPaneMode: (mode: PaneMode) => void;

    isCommandMenuOpen: boolean;
    setCommandMenuOpen: (open: boolean) => void;

    isThinking: boolean;
    setIsThinking: (thinking: boolean) => void;

    rightPaneContent: React.ReactNode | null;
    setRightPaneContent: (content: React.ReactNode | null) => void;

    currentArtifact: {
        language: string;
        code: string;
        filename: string;
    } | null;
    setCurrentArtifact: (artifact: { language: string, code: string, filename: string } | null) => void;

    installedSkills: string[];
    setInstalledSkills: (skills: string[]) => void;
}

export const useUIStore = create<UIState>((set) => ({
    rightPaneMode: 'thoughts',
    setRightPaneMode: (mode) => set({ rightPaneMode: mode }),

    isCommandMenuOpen: false,
    setCommandMenuOpen: (open) => set({ isCommandMenuOpen: open }),

    isThinking: false,
    setIsThinking: (thinking) => set({ isThinking: thinking }),

    rightPaneContent: null,
    setRightPaneContent: (content) => set({ rightPaneContent: content }),

    currentArtifact: null,
    setCurrentArtifact: (artifact) => set({
        currentArtifact: artifact,
        rightPaneMode: artifact ? 'artifact' : 'thoughts'
    }),

    installedSkills: [],
    setInstalledSkills: (skills) => set({ installedSkills: skills }),
}));
