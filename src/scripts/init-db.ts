import { initGraphSchema } from '../lib/neo4j';
import { initVectorStore } from '../lib/qdrant';

async function main() {
    console.log('🚀 Initializing RPCN Databases...');

    try {
        await initGraphSchema();
        await initVectorStore();
        console.log('✨ All databases initialized successfully.');
        process.exit(0);
    } catch (error) {
        console.error('💥 Error during initialization:', error);
        process.exit(1);
    }
}

main();
