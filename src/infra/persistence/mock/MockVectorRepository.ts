import { IVectorRepository } from '../../../core/ports/repositories';
import { Result } from '../../../core/shared/Result';
import { MemoryFact } from '../../../core/domain/entities';

export class MockVectorRepository implements IVectorRepository {
    async upsertFact(userId: string, fact: MemoryFact): Promise<Result<void>> {
        console.log('[MockVector] Fact saved (in-memory):', fact.content);
        return Result.ok();
    }

    async upsertVector(userId: string, fact: MemoryFact): Promise<Result<void>> { return Result.ok(); }
    async deleteVector(userId: string, factId: string): Promise<Result<void>> { return Result.ok(); }

    async searchSimilar(userId: string, query: string): Promise<Result<MemoryFact[]>> {
        return Result.ok([
            {
                id: '1',
                content: 'Mocked context: RPCN is a Cognitive OS.',
                type: 'context',
                user_id: userId,
                metadata: {}
            },
            {
                id: '2',
                content: 'Mocked context: The Round Table architecture uses Hub-and-Spoke.',
                type: 'context',
                user_id: userId,
                metadata: {}
            }
        ]);
    }
}
