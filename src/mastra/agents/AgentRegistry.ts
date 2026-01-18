import { Agent } from '@mastra/core';
import { openai } from '@ai-sdk/openai';
import { librarianAgent } from './librarian';
import { architectAgent } from './architect';
import { coderAgent } from './coder';
import { orchestratorAgent } from './orchestrator';

/**
 * SECTION 3: The Agent Registry (Factory Pattern)
 */
export class AgentRegistry {
    private static agents: Record<string, Agent> = {
        Orchestrator: orchestratorAgent,
        Librarian: librarianAgent,
        Architect: architectAgent,
        Coder: coderAgent,
    };

    /**
     * Retrieves a persistent agent by role.
     */
    static getAgent(role: string): Agent {
        const agent = this.agents[role];
        if (!agent) {
            return this.createTransientAgent(role);
        }
        return agent;
    }

    /**
     * Creates a "Transient Agent" for niche skills on the fly.
     */
    private static createTransientAgent(role: string): Agent {
        console.log(`[Registry] Creating transient agent for role: ${role}`);

        return new Agent({
            name: `Expert_${role}`,
            instructions: `
        You are a specialized transient agent in the RPCN network.
        Your expertise is: ${role}.
        Execute only the portion of the task related to your domain.
        Return your findings to the Orchestrator.
      `,
            model: openai('gpt-4o-mini'), // Cheaper model for transient tasks
        });
    }

    static getAllPersistentAgents(): Agent[] {
        return Object.values(this.agents);
    }
}
