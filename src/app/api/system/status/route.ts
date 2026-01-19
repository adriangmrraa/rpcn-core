import { NextResponse } from 'next/server';
import { getGraphSession } from '@/lib/neo4j';
import { getQdrantClient } from '@/lib/qdrant';

export const dynamic = 'force-dynamic';

export async function GET() {
    const checks: Record<string, any> = {};
    let status = 'operational';

    // 1. Check Neo4j
    try {
        const session = getGraphSession();
        await session.run('RETURN 1 AS check');
        await session.close();

        // Expose configuration (safe subsets) to confirm env var patch
        checks.neo4j = {
            status: 'Connected',
            auth_user: process.env.NEO4J_USER || 'unknown',
            encryption_setting: process.env.NEO4J_ENCRYPTION || 'undefined (defaulting to logic)',
            node_env: process.env.NODE_ENV,
        };
    } catch (error: any) {
        status = 'partial_outage';
        checks.neo4j = {
            status: 'Error',
            message: error.message,
            code: error.code,
        };
    }

    // 2. Check Qdrant
    try {
        const client = getQdrantClient();
        const collections = await client.getCollections();
        checks.qdrant = {
            status: 'Connected',
            collections: collections.collections.map(c => c.name),
            url: process.env.QDRANT_URL,
        };
    } catch (error: any) {
        status = 'partial_outage';
        checks.qdrant = {
            status: 'Error',
            message: error.message,
        };
    }

    // 3. Environment Variables Sanity Check
    checks.env = {
        OPENAI_API_KEY: !!process.env.OPENAI_API_KEY,
        E2B_API_KEY: !!process.env.E2B_API_KEY,
        NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        STRIPE_SECRET_KEY: !!process.env.STRIPE_SECRET_KEY,
        NEO4J_ENCRYPTION: process.env.NEO4J_ENCRYPTION, // Crucial for debugging the 500 error
    };

    return NextResponse.json({
        status,
        timestamp: new Date().toISOString(),
        checks,
    }, { status: status === 'operational' ? 200 : 503 });
}
