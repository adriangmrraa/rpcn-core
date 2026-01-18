import { NextRequest } from 'next/server';
import { memoryManagerTool } from '@/mastra/tools/memoryManager';
import { logger } from '@/lib/logger';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { type, key, value, user_id = 'default_user' } = body;

        if (!type || !key || !value) {
            return new Response(JSON.stringify({ error: 'Missing fields' }), { status: 400 });
        }

        const result = await (memoryManagerTool as any).execute({
            context: { operation: 'learn', user_id, fact: { type, key, value } },
            suspend: async () => { },
            runtimeContext: {} as any
        });

        if (result.success) {
            return new Response(JSON.stringify({ success: true }), { status: 200 });
        } else {
            return new Response(JSON.stringify({ error: result.error }), { status: 500 });
        }
    } catch (error: any) {
        logger.error(error, 'Learn API Error');
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}
