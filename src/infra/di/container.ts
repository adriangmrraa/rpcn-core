import { Neo4jRepository } from '../persistence/neo4j/Neo4jRepository';
import { QdrantRepository } from '../persistence/qdrant/QdrantRepository';
import { MockGraphRepository } from '../persistence/mock/MockGraphRepository';
import { MockVectorRepository } from '../persistence/mock/MockVectorRepository';
import { MastraAgentAdapter } from '../adapters/mastra/MastraAgentAdapter';
import { RunAgentWorkflow } from '../../core/use-cases/RunAgentWorkflow';

// SECTION: Strategy Selection
const useMocks = process.env.USE_MOCKS === 'true';

if (useMocks) {
    console.warn('⚠️ RPCN is running in PREVIEW MODE (In-Memory Mocks). Data will not persist.');
}

// 1. Persistence Adapters (Dynamic)
const graphRepo = useMocks ? new MockGraphRepository() : new Neo4jRepository();
const vectorRepo = useMocks ? new MockVectorRepository() : new QdrantRepository();

// 2. Service Adapters
const agentService = new MastraAgentAdapter();

// 3. Use Cases
const runAgentUseCase = new RunAgentWorkflow(graphRepo, vectorRepo, agentService);

export {
    graphRepo,
    vectorRepo,
    agentService,
    runAgentUseCase
};
