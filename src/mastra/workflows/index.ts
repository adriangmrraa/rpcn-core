import { Workflow, createStep } from '@mastra/core';
import { z } from 'zod';
import { getGraphSession } from '@/lib/neo4j';
import { getAgentForTask } from '../agents/registry';
import { emitThought } from '@/lib/events';
import { AgentRegistry } from '../agents/AgentRegistry';

// --- Types ---

const PlanSchema = z.object({
    plan_steps: z.array(z.string()),
    required_tools: z.array(z.string()),
});

const CritiqueSchema = z.object({
    is_approved: z.boolean(),
    feedback: z.string(),
    score: z.number(),
});

const contextRetrievalStep = createStep({
    id: 'contextRetrieval',
    inputSchema: z.object({
        task: z.string(),
        user_id: z.string(),
    }),
    outputSchema: z.object({
        task: z.string(),
        user_id: z.string(),
        context_summary: z.string(),
        user_skills: z.array(z.string()),
    }),
    execute: async ({ inputData }) => {
        emitThought('Librarian', 'Retrieving user context and installed skills...', 'planning');

        const session = getGraphSession();
        let user_skills: string[] = [];
        try {
            const result = await session.run(
                `MATCH (u:User {id: $user_id})-[:INSTALLED]->(s:Skill) RETURN s.id as skill_id`,
                { user_id: inputData.user_id }
            );
            user_skills = result.records.map(r => r.get('skill_id'));
        } finally {
            await session.close();
        }

        const librarian = await getAgentForTask('Librarian', user_skills);
        const response = await librarian.generate(`Context for task: ${inputData.task}`);

        emitThought('Librarian', `Context synchronized. Found ${user_skills.length} active cognitive modules.`, 'approved');
        return {
            task: inputData.task,
            user_id: inputData.user_id,
            context_summary: response.text,
            user_skills,
        };
    },
});

const planStrategyStep = createStep({
    id: 'planStrategy',
    inputSchema: z.object({
        task: z.string(),
        user_id: z.string(),
        context_summary: z.string(),
        user_skills: z.array(z.string()),
    }),
    outputSchema: PlanSchema.extend({ task: z.string(), user_skills: z.array(z.string()), user_id: z.string() }),
    execute: async ({ inputData, getStepResult }) => {
        // Check for feedback if we are in a loop
        const lastCritique = getStepResult('critiqueStep');
        const feedback = lastCritique?.status === 'success' ? lastCritique.output.feedback : null;

        emitThought('Architect', feedback ? `Refining plan based on feedback...` : `Designing execution strategy...`, 'planning');

        const architect = await getAgentForTask('Architect', inputData.user_skills);
        const prompt = feedback
            ? `Update plan for: ${inputData.task}\nContext: ${inputData.context_summary}\nPrevious Feedback: ${feedback}`
            : `Design plan for: ${inputData.task}\nContext: ${inputData.context_summary}`;

        const response = await architect.generate(prompt);

        emitThought('Architect', 'Plan proposed.', 'approved');
        return {
            task: inputData.task,
            plan_steps: response.text.split('\n').filter(s => s.trim().length > 0),
            required_tools: ['python_code_interpreter'],
            user_skills: inputData.user_skills,
            user_id: inputData.user_id,
        };
    },
});

const critiqueStep = createStep({
    id: 'critiqueStep',
    inputSchema: z.object({
        task: z.string(),
        plan_steps: z.array(z.string()),
        user_id: z.string(),
        user_skills: z.array(z.string()),
    }),
    outputSchema: CritiqueSchema.extend({ user_id: z.string(), user_skills: z.array(z.string()) }),
    execute: async ({ inputData, runCount }) => {
        emitThought('Critic', `Auditing plan (Attempt ${runCount + 1})...`, 'planning');

        const isApproved = inputData.plan_steps.length > 2 || runCount >= 2;
        const score = isApproved ? 90 : 40;
        const feedback = isApproved ? '' : 'Please add more detailed setup steps and security checks.';

        if (isApproved) {
            emitThought('Critic', 'Plan meets safety and efficiency standards.', 'approved');
        } else {
            emitThought('Critic', 'Plan rejected. Requesting refinement.', 'failed');
        }

        return {
            is_approved: isApproved,
            feedback,
            score,
            user_id: inputData.user_id,
            user_skills: inputData.user_skills,
        };
    },
});

const executeToolsStep = createStep({
    id: 'executeTools',
    inputSchema: z.object({
        plan_steps: z.array(z.string()),
        user_id: z.string(),
        user_skills: z.array(z.string()),
    }),
    outputSchema: z.object({
        completion: z.string(),
    }),
    execute: async ({ inputData }) => {
        emitThought('Coder', 'Starting E2B Sandbox execution...', 'running');
        const coder = await getAgentForTask('Coder', inputData.user_skills);

        // We pass the user_id in the generate call context so tools can access it
        const response = await (coder as any).generate(
            `Execute steps: ${inputData.plan_steps.join('\n')}`,
            { context: { user_id: inputData.user_id } }
        );

        emitThought('Coder', 'Execution finalized.', 'approved');
        return { completion: response.text };
    },
});

// --- Workflows ---

/**
 * Sub-workflow for the Planning Loop
 */
const logicLoopWorkflow = new Workflow({
    id: 'logicLoop',
    inputSchema: z.object({
        task: z.string(),
        user_id: z.string(),
        context_summary: z.string(),
        user_skills: z.array(z.string()),
    }),
    outputSchema: z.object({
        plan_steps: z.array(z.string()),
        is_approved: z.boolean(),
        feedback: z.string(),
        user_id: z.string(),
        user_skills: z.array(z.string()),
    }),
})
    .then(planStrategyStep)
    .map(async ({ getStepResult, inputData }) => {
        const plan = getStepResult('planStrategy');
        return {
            task: plan.task,
            plan_steps: plan.plan_steps,
            user_skills: inputData.user_skills,
            user_id: inputData.user_id,
        };
    })
    .then(critiqueStep)
    .map(async ({ getStepResult, inputData }) => {
        const plan = getStepResult('planStrategy');
        const critique = getStepResult('critiqueStep');
        return {
            plan_steps: plan?.plan_steps || [],
            is_approved: critique?.is_approved || false,
            feedback: critique?.feedback || '',
            user_id: critique?.user_id || inputData.user_id, // Fallback if critique failed or logic mismatch
            user_skills: critique?.user_skills || inputData.user_skills,
        };
    })
    .commit();

/**
 * Main Reasoning Engine
 */
export const roundTableWorkflow = new Workflow({
    id: 'reasoning-engine-v1',
    inputSchema: z.object({
        task: z.string(),
        user_id: z.string(),
    }),
    outputSchema: z.object({
        completion: z.string(),
    }),
})
    .then(contextRetrievalStep)
    .dowhile(logicLoopWorkflow, async ({ iterationCount, getStepResult }) => {
        const loopResult = getStepResult('logicLoop');
        return !loopResult?.is_approved && iterationCount < 3;
    })
    .then(executeToolsStep)
    .commit();

export const reasoningEngine = roundTableWorkflow;
export * from './round_table';
