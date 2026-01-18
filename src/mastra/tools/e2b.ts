import { Tool } from '@mastra/core';
import { z } from 'zod';
import { Sandbox } from '@e2b/code-interpreter';
import { emitToolUse } from '@/lib/events';
import { vaultManagerTool } from './vault';

export const pythonCodeInterpreterTool = new Tool({
    id: 'python_code_interpreter',
    description: 'Execute Python code in a secure sandboxed environment (E2B).',
    inputSchema: z.object({
        code: z.string().describe('The Python code to execute'),
        user_id: z.string().describe('Injected by context'),
    }),
    outputSchema: z.object({
        stdout: z.string(),
        stderr: z.string(),
        results: z.array(z.any()),
        error: z.string().optional(),
    }),
    execute: async ({ context }) => {
        emitToolUse('python_code_interpreter', context.code);
        try {
            // PHASE 11: Hard Hardening - 硬 Hard Timeout (60s)

            // 1. Fetch Secrets from Vault at runtime
            const vaultResult = await (vaultManagerTool as any).execute({
                context: { action: 'get_all', user_id: context.user_id },
                runtimeContext: {} as any,
                suspend: async () => { }
            });

            const userEnv = vaultResult.success ? vaultResult.secrets : {};

            // 2. Initialize E2B Sandbox with Injected Keys
            const sandbox = await Sandbox.create({
                apiKey: process.env.E2B_API_KEY,
                envs: userEnv,
            });

            // Use Promise.race to enforce a hard timeout
            const executionPromise = sandbox.runCode(context.code);
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('EXECUTION_TIMEOUT: Sandbox exceeded 60s limit')), 60000)
            );

            const execution = await Promise.race([executionPromise, timeoutPromise]) as any;
            await sandbox.kill();

            return {
                stdout: execution.logs.stdout.join('\n'),
                stderr: execution.logs.stderr.join('\n'),
                results: execution.results,
            };
        } catch (error: any) {
            console.error('E2B Hardened Tool Error:', error);
            return {
                stdout: '',
                stderr: '',
                results: [],
                error: error.message || 'Sandbox execution failed or timed out.'
            };
        }
    },
});
