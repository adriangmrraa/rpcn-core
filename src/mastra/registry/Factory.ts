import { Agent } from '@mastra/core';
import { openai } from '@ai-sdk/openai';
import { librarianAgent } from '../agents/librarian';
import { architectAgent } from '../agents/architect';
import { coderAgent } from '../agents/coder';
import { orchestratorAgent } from '../agents/orchestrator';
import { dataAnalystAgent } from '../agents/dataAnalyst';
import { marketingStrategistAgent } from '../agents/marketingStrategist';

/**
 * THE AGENT REGISTRY & FACTORY (LEVEL 10)
 */
const CORE_AGENTS: Record<string, Agent> = {
    'Orchestrator': orchestratorAgent,
    'Librarian': librarianAgent,
    'Architect': architectAgent,
    'Coder': coderAgent,
    'DataAnalyst': dataAnalystAgent,
    'MarketingStrategist': marketingStrategistAgent,
};

const SPECIALIST_TEMPLATES: Record<string, any> = {
    'SecurityAuditor': { base_model: 'gpt-4o', tools: ['code_scan'] },
    'FinanceExpert': { base_model: 'gpt-4o', tools: ['web_search'] },
};

export class AgentFactory {
    /**
     * Main entry point to get an agent.
     */
    static async getAgent(role: string): Promise<Agent> {
        // 1. Check Core Agents
        if (CORE_AGENTS[role]) {
            return CORE_AGENTS[role];
        }

        // 2. Check Specialist Templates
        if (SPECIALIST_TEMPLATES[role]) {
            return this.createSpecialistFromTemplate(role, SPECIALIST_TEMPLATES[role]);
        }

        // 3. Dynamic Factory: Create Transient Agent on the fly
        return this.createTransientAgent(role);
    }

    private static createSpecialistFromTemplate(role: string, config: any): Agent {
        return new Agent({
            name: role,
            instructions: `You are a specialist in ${role}. Focus strictly on your domain.`,
            model: openai(config.base_model || 'gpt-4o-mini') as any,
        });
    }

    /**
     * SECTION 3.2: The Factory (Dynamic Instantiation)
     */
    private static async createTransientAgent(role: string): Promise<Agent> {
        console.log(`[Factory] Spawning transient agent for niche role: ${role}`);

        const promptGenerator = new Agent({
            name: 'SystemPromptGenerator',
            instructions: 'Generate a precision system prompt for a specialized AI agent.',
            model: openai('gpt-4o-mini') as any
        });

        const response = await promptGenerator.generate(
            `Create a system prompt for an agent with the role: ${role}. 
        Keep it concise, expert-level, and focused on this specific niche.`
        );

        return new Agent({
            name: `Expert_${role}`,
            instructions: response.text,
            model: openai('gpt-4o-mini') as any,
        });
    }
}
