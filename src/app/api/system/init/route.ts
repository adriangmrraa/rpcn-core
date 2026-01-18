import { NextResponse } from 'next/server';
import { initGraphSchema } from '@/lib/neo4j';
import { initVectorStore } from '@/lib/qdrant';

export async function POST() {
    try {
        console.log('🚀 Starting System Initialization...');

        // 1. Initialize Neo4j Schema (Constraints/Indexes)
        await initGraphSchema();

        // 2. Initialize Qdrant Collections
        await initVectorStore();

        return NextResponse.json({
            success: true,
            message: 'All systems initialized successfully (Graph + Vector).'
        });
    } catch (error: any) {
        console.error('System init failed:', error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
