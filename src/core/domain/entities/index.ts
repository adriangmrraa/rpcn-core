import { z } from 'zod';

/**
 * User Entity Schema
 */
export const UserSchema = z.object({
    id: z.string().uuid().or(z.string()),
    email: z.string().email(),
    subscription_status: z.enum(['active', 'inactive', 'past_due']).default('inactive'),
    stripe_customer_id: z.string().optional(),
});

export type User = z.infer<typeof UserSchema>;

/**
 * Project Entity Schema
 */
export const ProjectSchema = z.object({
    id: z.string().uuid().or(z.string()),
    user_id: z.string(),
    name: z.string().min(3).max(50),
    description: z.string().optional(),
    created_at: z.date().default(() => new Date()),
});

export type Project = z.infer<typeof ProjectSchema>;

/**
 * Memory Fact Entity Schema
 */
export const MemoryFactSchema = z.object({
    id: z.string(),
    user_id: z.string(),
    content: z.string(),
    type: z.enum(['preference', 'context', 'goal', 'constraint']),
    metadata: z.record(z.any()).optional(),
});

export type MemoryFact = z.infer<typeof MemoryFactSchema>;
