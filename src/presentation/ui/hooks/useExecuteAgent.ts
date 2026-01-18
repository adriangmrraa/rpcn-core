import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useExecuteAgent() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ task, userId }: { task: string; userId: string }) => {
            const response = await fetch('/api/agent/execute', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ task, user_id: userId }),
            });

            if (!response.ok) {
                throw new Error('Agent execution failed');
            }

            return response.json();
        },
        onSuccess: (data) => {
            // Optimistically invalidate relevant queries or update cache
            queryClient.invalidateQueries({ queryKey: ['agent-history'] });
        },
    });
}
