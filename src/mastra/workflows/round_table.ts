import { Workflow, createStep } from '@mastra/core';
import { z } from 'zod';

// Re-defining steps for the updated Mastra SDK (v0.24+)
// Steps are now created via createStep factory function

const orchestratorStep = createStep({
    id: 'orchestrator',
    inputSchema: z.object({
        task: z.string(),
        context: z.array(z.any()).optional(),
    }),
    outputSchema: z.object({
        decision: z.object({
            status: z.enum(['running', 'complete', 'failed']),
            nextInstruction: z.string().optional(),
            specialistRequired: z.string().optional(),
        }),
        updatedState: z.any().optional(),
    }),
    execute: async ({ inputData }) => {
        const { task, context } = inputData;

        // In a real scenario, this would call an LLM to decide
        // For the "Cognitive Preview", we simulate a one-round decision
        const isFirstRound = !context || context.length === 0;

        if (isFirstRound) {
            return {
                decision: {
                    status: 'running' as const,
                    nextInstruction: `Analyze the task: ${task}`,
                    specialistRequired: 'generalist',
                },
                updatedState: { task, round: 1 }
            };
        }

        return {
            decision: {
                status: 'complete' as const,
                nextInstruction: 'Task finalized.',
            },
            updatedState: { ...context?.[0], round: 2 }
        };
    },
});

const specialistStep = createStep({
    id: 'specialist',
    inputSchema: z.object({
        instruction: z.string(),
        state: z.any().optional(),
    }),
    outputSchema: z.object({
        result: z.string(),
        observations: z.array(z.string()),
    }),
    execute: async ({ inputData }) => {
        const { instruction } = inputData;
        return {
            result: `Processed instruction: ${instruction}`,
            observations: ['Step execution successful', 'Context maintained'],
        };
    },
});

/**
 * Round Table Workflow
 * 
 * Implements the Agentic Cycle where an orchestrator directs specialists.
 * Updated for Mastra v0.24+:
 * - Uses createStep instead of new Step
 * - Uses Workflow constructor with id/inputSchema/outputSchema
 * - Uses .then() for linear steps (Cycles are now handled via state or manual rounds in this preview)
 */
export const roundTableWorkflow = new Workflow({
    id: 'roundTableWorkflow',
    inputSchema: z.object({
        task: z.string(),
        context: z.array(z.any()).optional(),
    }),
    outputSchema: z.object({
        completion: z.string().optional(),
        finalState: z.any().optional(),
    }),
})
    .then(orchestratorStep)
    .then(specialistStep)
    .commit();
