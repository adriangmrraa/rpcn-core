import { NextRequest } from 'next/server';
import { runAgentUseCase } from '@/infra/di/container';
import { checkRateLimit } from '@/lib/ratelimit';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { task, user_id, images } = body;

        logger.info({ body }, 'Incoming Agent Execution Request');

        if (!task || !user_id) {
            const missing = !task ? 'task' : 'user_id';
            logger.warn({ missing }, 'Invalid Request Body');
            return new Response(JSON.stringify({
                error: 'BAD_REQUEST',
                message: `Missing required field: ${missing}`
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // 1. Rate Limiting
        const limitStatus = await checkRateLimit(user_id);
        if (!limitStatus.success) {
            logger.warn({ user_id }, 'Rate Limit Exceeded');
            return new Response(JSON.stringify({ error: 'RATE_LIMIT_EXCEEDED' }), { status: 429 });
        }

        // 2. Setup SSE Streaming
        const responseStream = new TransformStream();
        const writer = responseStream.writable.getWriter();
        const encoder = new TextEncoder();

        const sendEvent = async (data: any) => {
            await writer.write(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        };

        // 3. Kick off execution in background
        (async () => {
            try {
                const result = await runAgentUseCase.execute(user_id, task, async (event) => {
                    await sendEvent(event);
                });

                if (result.isSuccess) {
                    await sendEvent({ type: 'result', output: result.getValue().output, status: 'success' });
                } else {
                    await sendEvent({ type: 'error', message: result.error.message });
                }
            } catch (err: any) {
                await sendEvent({ type: 'error', message: err.message });
            } finally {
                await writer.close();
            }
        })();

        return new Response(responseStream.readable, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
            },
        });

    } catch (error: any) {
        logger.error(error, 'Unhandled Controller Error');
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}
