import { IVectorRepository } from '../../../core/ports/repositories';
import { Result } from '../../../core/shared/Result';
import { getQdrantClient } from '../../../lib/qdrant';

export class QdrantRepository implements IVectorRepository {
    async upsertVector(userId: string, data: any): Promise<Result<void>> {
        const qdrant = getQdrantClient();
        try {
            await qdrant.upsert('rpcn_memory', {
                points: [{
                    id: data.id,
                    vector: data.vector || [0.1, 0.2], // Placeholder
                    payload: { ...data.payload, user_id: userId }
                }]
            });
            return Result.ok();
        } catch (error: any) {
            return Result.fail({ code: 'VECTOR_DB_ERROR', message: error.message });
        }
    }

    async searchSimilar(userId: string, query: string, limit: number = 5): Promise<Result<any[]>> {
        const qdrant = getQdrantClient();
        try {
            const results = await qdrant.search('rpcn_memory', {
                vector: [0.1, 0.2], // Placeholder embedding logic should be separate
                filter: {
                    must: [{ key: 'user_id', match: { value: userId } }]
                },
                limit,
                with_payload: true,
            });
            return Result.ok(results);
        } catch (error: any) {
            return Result.fail({ code: 'VECTOR_DB_ERROR', message: error.message });
        }
    }

    async deleteVector(userId: string, vectorId: string): Promise<Result<void>> {
        const qdrant = getQdrantClient();
        try {
            await qdrant.delete('rpcn_memory', {
                points: [vectorId]
            });
            return Result.ok();
        } catch (error: any) {
            return Result.fail({ code: 'VECTOR_DB_ERROR', message: error.message });
        }
    }
}
