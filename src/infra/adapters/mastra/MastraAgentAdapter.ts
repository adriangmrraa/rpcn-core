import { IAgentService } from '../../../core/ports/repositories';
import { Result } from '../../../core/shared/Result';
import { rpcNetwork } from '../../../mastra';
import { RoundTableState } from '../../../core/types/State';
import { cognitiveBus } from '../../../lib/events';

export class MastraAgentAdapter implements IAgentService {
    async executeTask(userId: string, task: string, onEvent?: (event: any) => void): Promise<Result<string>> {
        // Subscribe to cognitive bus for this execution
        const handleThought = (event: any) => {
            if (onEvent) onEvent(event);
        };

        cognitiveBus.on('thought', handleThought);

        try {
            const workflow = rpcNetwork.getWorkflow('reasoning-engine-v1');

            const initialState: RoundTableState = {
                user_objective: task,
                memory_context: {
                    long_term_facts: [],
                    short_term_rag: []
                },
                current_plan: {
                    steps: [],
                    current_step_index: 0,
                    status: 'planning'
                },
                artifacts: {
                    files_created: [],
                    terminal_logs: [],
                    last_error: null
                },
                conversation_history: [
                    { role: 'user', content: task }
                ]
            };

            // 2. Create and start the workflow run
            const run = await workflow.createRunAsync();
            const result = await run.start({
                inputData: {
                    task: task,
                    user_id: userId
                }
            });

            // 3. Extract final completion from workflow results
            // In v0.24, final output is available in result.results
            const completion = (result as any)?.results?.completion || 'Task completed without specific output.';

            return Result.ok(completion);
        } catch (error: any) {
            return Result.fail({
                code: 'AGENT_CRITICAL_ERROR',
                message: error.message
            });
        } finally {
            // Clean up subscription
            cognitiveBus.off('thought', handleThought);
        }
    }
}
