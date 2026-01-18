import { Result } from '../../shared/Result';
import { MemoryFact, User, Project } from '../../domain/entities';

/**
 * Interface for Graph Database interactions (Neo4j)
 */
export interface IGraphRepository {
    saveUser(user: User): Promise<Result<void>>;
    findUserById(id: string): Promise<Result<User>>;
    saveProject(project: Project): Promise<Result<void>>;
    findProjectsByUserId(userId: string): Promise<Result<Project[]>>;
    saveFact(userId: string, fact: MemoryFact): Promise<Result<void>>;
    findFactsByUserId(userId: string): Promise<Result<MemoryFact[]>>;
    deleteFact(userId: string, factId: string): Promise<Result<void>>;
}

/**
 * Interface for Vector Database interactions (Qdrant)
 */
export interface IVectorRepository {
    upsertVector(userId: string, data: any): Promise<Result<void>>;
    searchSimilar(userId: string, query: string, limit?: number): Promise<Result<any[]>>;
    deleteVector(userId: string, vectorId: string): Promise<Result<void>>;
}

/**
 * Interface for Agent Executions
 */
export interface IAgentService {
    executeTask(userId: string, task: string, onEvent?: (event: any) => void): Promise<Result<string>>;
}
