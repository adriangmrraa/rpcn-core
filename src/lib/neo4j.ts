import neo4j, { Driver } from 'neo4j-driver';

let driver: Driver;

export const getNeo4jDriver = () => {
  if (!driver) {
    console.log('🔌 Initializing Neo4j Driver (Encryption: OFF, URI:', process.env.NEO4J_URI || 'bolt://localhost:7687', ')');
    driver = neo4j.driver(
      process.env.NEO4J_URI || 'bolt://localhost:7687',
      neo4j.auth.basic(
        process.env.NEO4J_USER || 'neo4j',
        process.env.NEO4J_PASSWORD || 'password'
      ),
      {
        encrypted: process.env.NEO4J_ENCRYPTION === 'OFF' ? 'ENCRYPTION_OFF' : (process.env.NODE_ENV === 'production' ? 'ENCRYPTION_ON' : 'ENCRYPTION_OFF'),
        disableLosslessIntegers: true,
      }
    );
  }
  return driver;
};

export const getGraphSession = () => getNeo4jDriver().session();

// Function to initialize the base schema
export async function initGraphSchema() {
  const session = getGraphSession();
  try {
    // Ensure strict typing and identity
    await session.run(`CREATE CONSTRAINT user_id_unique IF NOT EXISTS FOR (u:User) REQUIRE u.id IS UNIQUE`);
    await session.run(`CREATE INDEX project_name_index IF NOT EXISTS FOR (p:Project) ON (p.name)`);
    await session.run(`CREATE CONSTRAINT skill_name_unique IF NOT EXISTS FOR (s:Skill) REQUIRE s.name IS UNIQUE`);
    console.log('✅ Graph Schema (Pencil + Skill Marketplace) initialized.');
  } finally {
    await session.close();
  }
}
