import { EventEmitter } from 'events';

class CognitiveEvents extends EventEmitter { }

export const cognitiveBus = new CognitiveEvents();

export const emitThought = (agent: string, content: string, status: string = 'running') => {
    cognitiveBus.emit('thought', {
        type: 'thought',
        agent,
        content,
        status,
        timestamp: new Date().toISOString()
    });
};

export const emitToolUse = (tool: string, input: any) => {
    cognitiveBus.emit('thought', { // We use 'thought' event for all streaming data for simplicity in the bus listener
        type: 'tool_use',
        tool,
        input,
        timestamp: new Date().toISOString()
    });
};
