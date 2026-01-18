import { createTool } from '@mastra/core';
import { z } from 'zod';
import { getGraphSession } from '../../lib/neo4j';
import { getQdrantClient } from '../../lib/qdrant';

export const memoryManagerTool = createTool({
    id: 'memory_manager',
    description: 'Unified tool for retrieving and storing long-term memory (Graph + Vector).',
    inputSchema: z.object({
        operation: z.enum(['retrieve', 'learn']),
        user_id: z.string(),
        query: z.string().optional().describe('Search query for retrieval'),
        fact: z.object({
            type: z.enum(['preference', 'project', 'fact']),
            key: z.string(),
            value: z.string(),
        }).optional().describe('Structured fact to learn'),
    }),
    outputSchema: z.object({
        success: z.boolean(),
        context: z.any().optional(),
        error: z.string().optional(),
    }),
    execute: async ({ context }) => {
        const { operation, user_id, fact } = context;

        if (operation === 'retrieve') {
            const session = getGraphSession();
            const qdrant = getQdrantClient();
            try {
                // 1. Fetch from Neo4j (Graph)
                const graphResult = await session.run(
                    `MATCH (u:User {id: $user_id})-[r]->(n)
                     RETURN type(r) as rel, labels(n) as labels, n.name as name, n.content as content`,
                    { user_id }
                );
                const graphData = graphResult.records.map(r => ({
                    rel: r.get('rel'),
                    labels: r.get('labels'),
                    name: r.get('name'),
                    content: r.get('content')
                }));

                // 2. Fetch from Qdrant (Vector)
                let vectorData: any[] = [];
                try {
                    const searchResult = await qdrant.search('rpcn_memory', {
                        vector: Array(1536).fill(0), // Placeholder: In a real app we'd embed 'query'
                        filter: { must: [{ key: 'user_id', match: { value: user_id } }] },
                        limit: 3,
                    });
                    vectorData = searchResult.map(hit => hit.payload);
                } catch (e) {
                    console.warn('Vector search failed or collection missing:', e);
                }

                return {
                    success: true,
                    context: {
                        graph: graphData,
                        vector: vectorData
                    }
                };
            } finally {
                await session.close();
            }
        } else if (operation === 'learn' && fact) {
            const session = getGraphSession();
            try {
                const { type, key, value } = fact;
                const fact_id = `${user_id}_${type}_${key}`.toLowerCase().replace(/\s+/g, '_');

                // Idempotent MERGE logic with type-specific relationships
                let cypher = '';
                if (type === 'preference') {
                    cypher = `
                        MERGE (u:User {id: $user_id})
                        MERGE (t:Tech {id: $fact_id})
                        SET t.name = $key, t.value = $value
                        MERGE (u)-[:PREFERS]->(t)
                        RETURN t
                    `;
                } else {
                    cypher = `
                        MERGE (u:User {id: $user_id})
                        MERGE (f:Fact {id: $fact_id})
                        SET f.type = $type, f.name = $key, f.value = $value
                        MERGE (u)-[:LEARNED]->(f)
                        RETURN f
                    `;
                }

                await session.run(cypher, {
                    user_id,
                    fact_id,
                    type,
                    key,
                    value
                });

                return { success: true };
            } finally {
                await session.close();
            }
        }

        return { success: false, error: 'Invalid operation or missing data' };
    },
});
