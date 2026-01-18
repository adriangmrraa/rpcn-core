import { Tool } from '@mastra/core';
import { z } from 'zod';
import { getQdrantClient } from '../../lib/qdrant';

export const vectorMemorySearchTool = new Tool({
    id: 'vector_memory_search',
    description: 'Semantic search in isolated user memory.',
    inputSchema: z.object({
        query: z.string(),
        limit: z.number().optional().default(5),
        user_id: z.string().describe('Injected by context'),
    }),
    outputSchema: z.object({
        success: z.boolean(),
        results: z.array(z.any()),
        error: z.string().optional(),
    }),
    execute: async ({ context }) => {
        const qdrant = getQdrantClient();
        try {
            // ENFORCE MULTI-TENANCY: Strict metadata filter
            const filter = {
                must: [
                    { key: 'user_id', match: { value: context.user_id } }
                ]
            };

            const results = await qdrant.search('rpcn_memory', {
                vector: [0.1, 0.2], // Placeholder embedding
                filter,
                limit: context.limit,
                with_payload: true,
            });

            return { success: true, results };
        } catch (error: any) {
            console.error('Qdrant Secure Tool Error:', error);
            return { success: false, error: error.message };
        }
    },
});
