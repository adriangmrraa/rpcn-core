import { Workflow, Step } from '@mastra/core';
import { z } from 'zod';
import { AgentRegistry } from '../agents/AgentRegistry';
import { RPCNState, OrchestratorDecisionSchema } from '../agents/orchestrator';

/**
 * Helper to simulate "Glass Box" events for the UI
 * In a real Mastra setup, we'd use an event emitter or telemetry.
 */
const emitThought = (agent: string, content: string, status: string = 'running') => {
    // This will be picked up by the logging layer or context
    console.log(`TRM_EVENT|${JSON.stringify({ type: 'thought', agent, content, status })}`);
};

// Step 1: Brain (The Orchestrator Hub)
const orchestrationHubStep = new Step({
    id: 'orchestrationHub',
    inputSchema: z.object({
        task: z.string(),
        state: z.any(),
    }),
    execute: async ({ context }) => {
        const orchestrator = AgentRegistry.getAgent('Orchestrator');
        const state = context.state as RPCNState;

        emitThought('Orchestrator', `Evaluating next steps for task: "${context.task}"...`);

        const response = await orchestrator.generate(
            `Task: ${context.task}\n\nCurrent State: ${JSON.stringify(state)}`,
            { output: OrchestratorDecisionSchema }
        );

        const decision = response.object as z.infer<typeof OrchestratorDecisionSchema>;

        emitThought('Orchestrator', decision.reasoning, 'approved');

        return {
            decision,
            updatedState: {
                ...state,
                nextAgent: decision.nextAgent,
                plan: decision.updatedPlan,
                status: decision.nextAgent === 'None' ? 'completed' : 'running',
            }
        };
    },
});

// Step 2: Spoke (Delegate to Librarian)
const librarianSpokeStep = new Step({
    id: 'librarianSpoke',
    execute: async ({ context }) => {
        emitThought('Librarian', 'Gathering relevant context from Knowledge Graph and Vector Memory...');
        const librarian = AgentRegistry.getAgent('Librarian');
        const response = await librarian.generate(`Execute your part: ${context.task}`);
        emitThought('Librarian', 'Found relevant insights. Returning to Orchestrator.', 'approved');
        return { finding: response.text };
    },
});

// Step 3: Spoke (Delegate to Architect)
const architectSpokeStep = new Step({
    id: 'architectSpoke',
    execute: async ({ context }) => {
        emitThought('Architect', 'Synthesizing technical plan and structuring data models...');
        const architect = AgentRegistry.getAgent('Architect');
        const response = await architect.generate(`Refine design for: ${context.task}`);
        emitThought('Architect', 'Architecture proposal ready.', 'approved');
        return { finding: response.text };
    },
});

// Step 4: Spoke (Delegate to Coder)
const coderSpokeStep = new Step({
    id: 'coderSpoke',
    execute: async ({ context }) => {
        emitThought('Coder', 'Running environment checks and executing E2B sandbox tools...');
        const coder = AgentRegistry.getAgent('Coder');
        const response = await coder.generate(`Implement/Execute: ${context.task}`);
        emitThought('Coder', 'Tool execution complete. Reviewing output.', 'approved');
        return { finding: response.text };
    },
});

export const dynamicEngine = new Workflow({
    name: 'dynamic-round-table',
    triggerSchema: z.object({
        task: z.string(),
        user_id: z.string(),
        state: z.any(),
    }),
})
    .step(orchestrationHubStep)
    .step(librarianSpokeStep)
    .step(architectSpokeStep)
    .step(coderSpokeStep)
    .commit();

// Routing Logic
dynamicEngine.addTransition({
    from: orchestrationHubStep,
    to: librarianSpokeStep,
    condition: (data) => data.decision.nextAgent === 'Librarian',
});

dynamicEngine.addTransition({
    from: orchestrationHubStep,
    to: architectSpokeStep,
    condition: (data) => data.decision.nextAgent === 'Architect',
});

dynamicEngine.addTransition({
    from: orchestrationHubStep,
    to: coderSpokeStep,
    condition: (data) => data.decision.nextAgent === 'Coder',
});

dynamicEngine.addTransition({ from: librarianSpokeStep, to: orchestrationHubStep });
dynamicEngine.addTransition({ from: architectSpokeStep, to: orchestrationHubStep });
dynamicEngine.addTransition({ from: coderSpokeStep, to: orchestrationHubStep });
