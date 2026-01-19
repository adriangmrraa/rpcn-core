import { Mastra } from '@mastra/core';
import { librarianAgent, architectAgent, criticAgent, coderAgent, greeterAgent } from './src/mastra/agents';
import { reasoningEngine } from './src/mastra/workflows';

export const config = {
  name: 'rpc-network',
  systemHostURL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  agents: [librarianAgent, architectAgent, criticAgent, coderAgent, greeterAgent],
  workflows: [reasoningEngine],
};

export const mastra = new Mastra(config as any);
