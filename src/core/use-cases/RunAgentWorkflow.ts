import { IGraphRepository, IVectorRepository, IAgentService } from '../ports/repositories';
import { Result } from '../shared/Result';

export class RunAgentWorkflow {
    constructor(
        private graphRepo: IGraphRepository,
        private vectorRepo: IVectorRepository,
        private agentService: IAgentService
    ) { }

    async execute(userId: string, query: string, onProgress?: (event: any) => void): Promise<Result<any>> {
        // 1. Validate User
        const userResult = await this.graphRepo.findUserById(userId);
        if (userResult.isFailure) return Result.fail(userResult.error);

        if (userResult.getValue().subscription_status !== 'active') {
            return Result.fail({ code: 'SUBSCRIPTION_REQUIRED', message: 'Active sub required' });
        }

        // 2. Initial Context
        if (onProgress) onProgress({ type: 'thought', agent: 'System', content: 'Authenticating and retrieving user context...' });

        const contextResult = await this.vectorRepo.searchSimilar(userId, query);
        const contextSummary = contextResult.isSuccess ? JSON.stringify(contextResult.getValue()) : '';

        // 3. Delegate to the Round Table
        const agentResult = await this.agentService.executeTask(userId, query, onProgress);

        if (agentResult.isFailure) return Result.fail(agentResult.error);

        return Result.ok({
            output: agentResult.getValue(),
            context_summary: contextSummary
        });
    }
}
