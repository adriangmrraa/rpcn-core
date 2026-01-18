import { NextRequest } from 'next/server';
import { vaultManagerTool } from '@/mastra/tools/vault';
import { logger } from '@/lib/logger';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { action, key, value, user_id = 'default_user' } = body;

        if (!action || (action === 'set' && (!key || !value))) {
            return new Response(JSON.stringify({ error: 'Missing fields' }), { status: 400 });
        }

        const result = await (vaultManagerTool as any).execute({
            context: { action, key, value, user_id },
            runtimeContext: {} as any,
            suspend: async () => { }
        });

        if (result.success) {
            return new Response(JSON.stringify(result), { status: 200 });
        } else {
            return new Response(JSON.stringify({ error: result.message }), { status: 500 });
        }
    } catch (error: any) {
        logger.error(error, 'Vault API Error');
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    try {
        const user_id = req.nextUrl.searchParams.get('user_id') || 'default_user';

        const result = await (vaultManagerTool as any).execute({
            context: { action: 'list', user_id },
            runtimeContext: {} as any,
            suspend: async () => { }
        });

        if (result.success) {
            return new Response(JSON.stringify({ keys: result.keys }), { status: 200 });
        } else {
            return new Response(JSON.stringify({ error: result.message }), { status: 500 });
        }
    } catch (error: any) {
        logger.error(error, 'Vault API Error');
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}
