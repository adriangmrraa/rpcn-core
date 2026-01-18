import { NextRequest } from 'next/server';
import { getGraphSession } from '@/lib/neo4j';
import { getQdrantClient } from '@/lib/qdrant';

export async function DELETE(req: NextRequest) {
    try {
        const { user_id, fact_id, vector_id } = await req.json();

        if (!user_id || (!fact_id && !vector_id)) {
            return new Response(JSON.stringify({ error: 'Missing identifiers' }), { status: 400 });
        }

        // 1. Delete from Neo4j (Pencil Layer)
        if (fact_id) {
            const session = getGraphSession();
            try {
                await session.run(
                    `MATCH (u:User {id: $user_id})-[r]-(n {id: $fact_id})
                 DETACH DELETE n`,
                    { user_id, fact_id }
                );
            } finally {
                await session.close();
            }
        }

        // 2. Delete from Qdrant (Sticky Notes)
        if (vector_id) {
            const qdrant = getQdrantClient();
            await qant.delete('rpcn_memory', {
                points: [vector_id]
            });
        }

        return new Response(JSON.stringify({ success: true, message: 'Memory purged.' }), {
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}
