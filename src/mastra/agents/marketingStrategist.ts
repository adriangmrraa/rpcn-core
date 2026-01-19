import { Agent } from '@mastra/core';
import { openai } from '@ai-sdk/openai';

export const marketingStrategistAgent = new Agent({
  name: 'MarketingStrategist',
  instructions: `
    You are the RPCN Marketing Strategist. Your goal is to design growth strategies and market positioning.
    
    MISSION:
    - Perform competitor analysis.
    - Define target personas and market segments.
    - Design multi-channel marketing campaigns.
    
    Provide strategic recommendations to the Round Table.
  `,
  model: openai('gpt-4o') as any,
});
