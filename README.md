# RPCN :: The Cognitive OS (Level 10)

Welcome to the Recursive Plasticity Cognitive Network. This project implements a **Round Table Architecture** with dynamic agent orchestration and a high-density "Neuro" UI.

## 🚀 One-Click Local Launch

### 1. Requirements
- Node.js 18+
- Docker & Docker Compose
- OpenAI API Key

### 2. Setup Environment
Create `.env.local`:
```bash
OPENAI_API_KEY=your_key_here
USE_MOCKS=true # Enable this to run without Neo4j/Qdrant containers
```

### 3. Run the Platform
```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

## 🏛️ Architecture Highlights
- **Persistent Dashboard:** Refactored layout for zero-flicker navigation between sectors.
- **The Round Table:** Powered by **Mastra v0.24+**, enabling recursive orchestration.
- **Memory Palace:** Interactive graph visualization using **@xyflow/react**.
- **Cognitive Preview:** Full implementation of Mock repositories for infrastructure-free development.

## 🌐 VPS Deployment
The `docker-compose.yml` is prepared for production. Simply point your domain to the VPS and run `docker-compose up --build`.

> [!IMPORTANT]
> This build implements the **API Contract V1.1**, ensuring full compatibility between the visual graph and the underlying Neo4j schema.
