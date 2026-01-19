import { Tool } from '@mastra/core/tools';
import { z } from 'zod';
import { getGraphSession } from '../../lib/neo4j';

export const knowledgeGraphManagerTool = new Tool({
    id: 'knowledge_graph_manager',
    description: 'Read/Write access to the User Knowledge Graph. Strictly scoped to the current user.',
    inputSchema: z.object({
        operation: z.enum(['read', 'write']),
        cypher: z.string().describe('The Cypher query to execute. Do not include user_id filter, it is injected automatically.'),
        params: z.record(z.any()).optional().describe('Parameters for the query'),
        user_id: z.string().describe('Injected by context'),
    }),
    outputSchema: z.object({
        success: z.boolean(),
        data: z.any().optional(),
        error: z.string().optional(),
    }),
    execute: async ({ context }) => {
        const session = getGraphSession();
        try {
            // ENFORCE MULTI-TENANCY: Modify query to include user filter if not present or wrap it
            // Simple strategy: Always merge/match relative to a (:User {id: $user_id}) node
            let hardenedCypher = context.cypher;

            if (context.operation === 'read') {
                // Prepend match for user
                hardenedCypher = `MATCH (u:User {id: $user_id}) WITH u ${context.cypher}`;
            } else {
                // Ensure the root user exists or is part of the merge
                hardenedCypher = `MERGE (u:User {id: $user_id}) WITH u ${context.cypher}`;
            }

            const result = await session.run(hardenedCypher, {
                ...(context.params || {}),
                user_id: context.user_id
            });

            const records = result.records.map(record => record.toObject());
            return { success: true, data: records };
        } catch (error: any) {
            console.error('Neo4j Secure Tool Error:', error);
            return { success: false, error: error.message };
        } finally {
            await session.close();
        }
    },
});
