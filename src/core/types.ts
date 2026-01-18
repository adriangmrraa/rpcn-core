export interface Message {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

export interface RoundTableState {
    // The Goal
    user_objective: string;

    // The Knowledge (Updated by Librarian)
    memory_context: {
        long_term_facts: string[];
        short_term_rag: string[];
    };

    // The Strategy (Updated by Architect)
    current_plan: {
        steps: string[];
        current_step_index: number;
        status: 'planning' | 'executing' | 'blocked' | 'finished';
    };

    // The Execution (Updated by Coder)
    artifacts: {
        files_created: string[];
        terminal_logs: string[];
        last_error: string | null;
    };

    // The Meta
    conversation_history: Message[];
}
