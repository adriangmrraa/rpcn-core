import { NextRequest } from 'next/server';
import { getGraphSession } from '@/lib/neo4j';

export async function GET(req: NextRequest) {
    const isMock = process.env.USE_MOCKS === 'true';

    if (isMock) {
        return new Response(JSON.stringify({
            knowledge_graph: {
                nodes: [
                    { id: 'default_user', label: 'User', properties: { email: 'preview@rpcn.ai' } },
                    { id: 'proj_1', label: 'Project', properties: { name: 'Growth Engine v2' } },
                    { id: 'fact_1', label: 'Preference', properties: { content: 'Uses Rust for scaling' } },
                    { id: 'skill_1', label: 'Skill', properties: { name: 'Python Expert' } },
                ],
                edges: [
                    { from: 'default_user', to: 'proj_1', label: 'OWNS' },
                    { from: 'default_user', to: 'fact_1', label: 'PREFERS' },
                    { from: 'default_user', to: 'skill_1', label: 'INSTALLED' },
                ]
            }
        }), {
            headers: { 'Content-Type': 'application/json' },
        });
    }

    const session = getGraphSession();
    try {
        const result = await session.run(
            `MATCH (n)
             OPTIONAL MATCH (n)-[r]->(m)
             RETURN n, r, m, labels(n) as nLabels, labels(m) as mLabels`
        );

        const nodesMap = new Map();
        const edges: any[] = [];

        result.records.forEach(record => {
            const n = record.get('n');
            const r = record.get('r');
            const m = record.get('m');

            if (n) {
                const nId = n.properties.id || n.identity.toString();
                nodesMap.set(nId, {
                    id: nId,
                    label: record.get('nLabels')[0] || 'Node',
                    properties: n.properties
                });
            }

            if (m) {
                const mId = m.properties.id || m.identity.toString();
                nodesMap.set(mId, {
                    id: mId,
                    label: record.get('mLabels')[0] || 'Node',
                    properties: m.properties
                });

                if (r) {
                    edges.push({
                        from: n.properties.id || n.identity.toString(),
                        to: mId,
                        label: r.type
                    });
                }
            }
        });

        // Ensure at least default_user exists
        if (!nodesMap.has('default_user')) {
            nodesMap.set('default_user', { id: 'default_user', label: 'User', properties: {} });
        }

        return new Response(JSON.stringify({
            knowledge_graph: {
                nodes: Array.from(nodesMap.values()),
                edges
            }
        }), {
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error: any) {
        console.error('Neo4j Error, falling back to mock:', error);
        // Fallback to mock for better developer experience if DB is down
        return new Response(JSON.stringify({
            knowledge_graph: {
                nodes: [{ id: 'error_user', label: 'User', properties: { error: 'DB_OFFLINE' } }],
                edges: []
            }
        }), {
            headers: { 'Content-Type': 'application/json' },
        });
    } finally {
        await session.close();
    }
}
