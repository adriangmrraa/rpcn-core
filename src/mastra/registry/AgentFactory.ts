import { Agent } from '@mastra/core';
import { openai } from '@ai-sdk/openai';
import { librarianAgent } from '../agents/librarian';
import { architectAgent } from '../agents/architect';
import { coderAgent } from '../agents/coder';
import { orchestratorAgent } from '../agents/orchestrator';

/**
 * SECTION 3: THE AGENT REGISTRY & FACTORY
 */
const AGENT_REGISTRY: Record<string, any> = {
    core: {
        'Orchestrator': orchestratorAgent,
        'Librarian': librarianAgent,
        'Architect': architectAgent,
        'Coder': coderAgent,
    },
    specialists: {
        'DataAnalyst': { base_model: 'gpt-4o', tools: ['python_pandas'] },
        'MarketingStrategist': { base_model: 'gpt-4o', tools: ['web_search'] },
        'SecurityAuditor': { base_model: 'gpt-4o', tools: ['code_scan'] }
    }
};

export class AgentFactory {
    /**
     * Main entry point to get an agent.
     */
    static async getAgent(role: string): Promise<Agent> {
        // 1. Check Core Agents
        if (AGENT_REGISTRY.core[role]) {
            return AGENT_REGISTRY.core[role];
        }

        // 2. Check Registry Specialists (Template check)
        if (AGENT_REGISTRY.specialists[role]) {
            return this.createSpecialist(role, AGENT_REGISTRY.specialists[role]);
        }

        // 3. Fallback: Create Transient Agent on the fly
        return this.createTransientAgent(role);
    }

    private static createSpecialist(role: string, config: any): Agent {
        return new Agent({
            name: role,
            instructions: `You are a specialist in ${role}. Focus strictly on your domain.`,
            model: openai(config.base_model || 'gpt-4o-mini') as any,
        });
    }

    private static async createTransientAgent(role: string): Promise<Agent> {
        console.log(`[Factory] Generating transient system prompt for niche role: ${role}`);

        // We use a fast model to generate the specialist's personality
        const promptGenerator = new Agent({
            name: 'SystemPromptGenerator',
            instructions: 'Generate a precision system prompt for a specialized AI agent.',
            model: openai('gpt-4o-mini') as any
        });

        const response = await promptGenerator.generate(
            `Create a system prompt for an agent with the role: ${role}. 
        Keep it concise and focus on expert-level domain knowledge.`
        );

        return new Agent({
            name: `Expert_${role}`,
            instructions: response.text,
            model: openai('gpt-4o-mini') as any,
        });
    }
}
