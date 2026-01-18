#!/bin/bash

# Configuration
BACKUP_DIR="/backups/$(date +%Y-%m-%d)"
mkdir -p $BACKUP_DIR

echo "📦 Starting RPCN Database Backup..."

# 1. Neo4j Dump (Using docker exec if running in container)
echo "🔹 Backing up Neo4j Graph..."
docker exec rpcn-neo4j neo4j-admin database dump neo4j --to-path=$BACKUP_DIR/graph.dump

# 2. Qdrant Snapshot
echo "🔹 Backing up Qdrant Vectors..."
curl -X POST "http://localhost:6333/collections/rpcn_memory/snapshots" > $BACKUP_DIR/qdrant_meta.json

# 3. Compress
echo "🔹 Compressing backup..."
tar -czf "$BACKUP_DIR.tar.gz" $BACKUP_DIR
rm -rf $BACKUP_DIR

echo "✅ Backup completed: $BACKUP_DIR.tar.gz"
