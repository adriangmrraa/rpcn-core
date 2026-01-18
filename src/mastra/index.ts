import { Mastra } from '@mastra/core';
import { roundTableWorkflow } from './workflows';

export const rpcNetwork = new Mastra({
    agents: {
        // Populated dynamically by AgentFactory via Round Table logic
    },
    workflows: {
        roundTableWorkflow,
    },
});
