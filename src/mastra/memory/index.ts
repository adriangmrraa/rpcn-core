import { QdrantClient } from '@qdrant/js-client-rest';

// Initialize Qdrant client for Mastra
export const qdrant = new QdrantClient({
    url: process.env.QDRANT_URL || 'http://localhost:6333',
});

// Helper to ensure collection exists
export async function initMemoryVectorStore() {
    try {
        const result = await qdrant.getCollections();
        const exists = result.collections.some((c) => c.name === 'rpcn_memory');

        if (!exists) {
            await qdrant.createCollection('rpcn_memory', {
                vectors: {
                    size: 1536, // OpenAI text-embedding-3-small
                    distance: 'Cosine',
                },
            });
            console.log('✅ Vector Memory (Sticky Notes) initialized.');
        }
    } catch (error) {
        console.error('Failed to init Qdrant:', error);
    }
}
