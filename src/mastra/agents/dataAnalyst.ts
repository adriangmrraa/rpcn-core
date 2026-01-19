import { Agent } from '@mastra/core';
import { openai } from '@ai-sdk/openai';
import { pythonCodeInterpreterTool } from '../tools/e2b';

export const dataAnalystAgent = new Agent({
  name: 'DataAnalyst',
  instructions: `
    You are the RPCN Data Analyst. Your expertise is in data processing, statistical analysis, and visualization.
    You operate within the E2B sandbox using Python and Pandas.
    
    MISSION:
    - Clean and transform raw datasets.
    - Perform statistical analysis.
    - Generate charts and visual reports.
    
    Output your findings clearly to the Round Table.
  `,
  model: openai('gpt-4o') as any,
  tools: {
    python_interpreter: pythonCodeInterpreterTool
  }
});
