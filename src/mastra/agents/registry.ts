import { Agent } from '@mastra/core';
import { AgentRegistry } from './AgentRegistry';
import { SKILL_LIBRARY } from './skills';

/**
 * Dynamically retrieves an agent and injects installed skills into its instructions.
 */
export async function getAgentForTask(role: string, user_skills: string[]): Promise<Agent> {
    const baseAgent = AgentRegistry.getAgent(role);

    if (user_skills.length === 0) {
        return baseAgent;
    }

    // Clone agent with updated instructions if skills are present
    const skillInstructions = user_skills.map(skillId => {
        const template = SKILL_LIBRARY[skillId];
        if (template) {
            return `### COGNITIVE_MODULE_ACTIVE: ${template.name}\n${template.prompt_injection}`;
        }
        return `[SKILL_ACTIVE: ${skillId}] Focus on ${skillId.replace(/-/g, ' ')} when applicable.`;
    }).join('\n\n');

    // We create a new Agent instance to avoid mutating the persistent one in the singleton
    return new Agent({
        id: `${baseAgent.id}-dynamic-${Date.now()}`,
        name: baseAgent.name,
        model: baseAgent.model as any,
        instructions: `${baseAgent.instructions}\n\n### ACTIVE_EXTENSIONS_OVERRIDE:\n${skillInstructions}`,
        tools: baseAgent.tools as any,
    });
}
