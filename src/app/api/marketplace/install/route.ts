import { NextRequest } from 'next/server';
import { getGraphSession } from '@/lib/neo4j';
import { logger } from '@/lib/logger';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { skill_id, user_id = 'default_user' } = body;

        if (!skill_id) {
            return new Response(JSON.stringify({ error: 'Missing skill_id' }), { status: 400 });
        }

        const session = getGraphSession();
        try {
            await session.run(
                `MATCH (u:User {id: $user_id})
                 MERGE (s:Skill {id: $skill_id})
                 MERGE (u)-[:INSTALLED]->(s)`,
                { user_id, skill_id }
            );
            return new Response(JSON.stringify({ success: true }), { status: 200 });
        } finally {
            await session.close();
        }
    } catch (error: any) {
        logger.error(error, 'Marketplace Install Error');
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}
