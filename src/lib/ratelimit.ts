import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Create a new ratelimiter that allows 50 requests per hour
export const ratelimit = process.env.UPSTASH_REDIS_REST_URL
    ? new Ratelimit({
        redis: Redis.fromEnv(),
        limiter: Ratelimit.slidingWindow(50, '1 h'),
        analytics: true,
        prefix: '@upstash/ratelimit/rpcn'
    })
    : null;

export async function checkRateLimit(userId: string) {
    if (!ratelimit) return { success: true };

    const { success, limit, reset, remaining } = await ratelimit.limit(userId);
    return { success, limit, reset, remaining };
}
