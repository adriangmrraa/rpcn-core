export interface Message {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

export interface RoundTableState {
    // THE GOAL
    user_objective: string;

    // THE KNOWLEDGE (Updated by Librarian)
    memory_context: {
        long_term_facts: string[];
        short_term_rag: string[];
    };

    // THE STRATEGY (Updated by Architect)
    current_plan: {
        steps: string[];
        current_step_index: number;
        status: 'planning' | 'executing' | 'blocked' | 'finished';
    };

    // THE EXECUTION (Updated by Coder / Specialists)
    artifacts: {
        files_created: string[];
        terminal_logs: string[];
        last_error: string | null;
    };

    // THE META
    conversation_history: Message[];
}
