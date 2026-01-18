import { Tool } from '@mastra/core';
import { z } from 'zod';
import { getGraphSession } from '../../lib/neo4j';

export const vaultManagerTool = new Tool({
    id: 'vault_manager',
    description: 'Manage and retrieve user secrets and API keys securely.',
    inputSchema: z.object({
        action: z.enum(['get', 'set', 'list', 'get_all']),
        key: z.string().optional().describe('The secret key name (e.g., GITHUB_TOKEN)'),
        value: z.string().optional().describe('The value to store (only for action=set)'),
        user_id: z.string().describe('Injected by context'),
    }),
    outputSchema: z.object({
        success: z.boolean(),
        value: z.string().optional(),
        keys: z.array(z.string()).optional(),
        secrets: z.record(z.string()).optional(),
        message: z.string().optional(),
    }),
    execute: async ({ context }) => {
        const session = getGraphSession();
        const { action, key, value, user_id } = context;

        try {
            if (action === 'set' && key && value) {
                await session.run(
                    `MERGE (u:User {id: $user_id})
                     MERGE (s:Secret {id: $secret_id})
                     SET s.key = $key, s.value = $value, s.updatedAt = datetime()
                     MERGE (u)-[:OWNS_SECRET]->(s)`,
                    { user_id, secret_id: `${user_id}_${key}`, key, value }
                );
                return { success: true, message: `Secret ${key} stored successfully.` };
            }

            if (action === 'get' && key) {
                const result = await session.run(
                    `MATCH (u:User {id: $user_id})-[:OWNS_SECRET]->(s:Secret {key: $key})
                     RETURN s.value as value`,
                    { user_id, key }
                );
                const val = result.records[0]?.get('value');
                return { success: true, value: val };
            }

            if (action === 'get_all') {
                const result = await session.run(
                    `MATCH (u:User {id: $user_id})-[:OWNS_SECRET]->(s:Secret)
                     RETURN s.key as key, s.value as value`,
                    { user_id }
                );
                const secrets: Record<string, string> = {};
                result.records.forEach(r => {
                    secrets[r.get('key')] = r.get('value');
                });
                return { success: true, secrets };
            }

            if (action === 'list') {
                const result = await session.run(
                    `MATCH (u:User {id: $user_id})-[:OWNS_SECRET]->(s:Secret)
                     RETURN s.key as key`,
                    { user_id }
                );
                const keys = result.records.map(r => r.get('key'));
                return { success: true, keys };
            }

            return { success: false, message: 'Invalid action or missing parameters' };
        } catch (error: any) {
            console.error('Vault Tool Error:', error);
            return { success: false, message: error.message };
        } finally {
            await session.close();
        }
    },
});
