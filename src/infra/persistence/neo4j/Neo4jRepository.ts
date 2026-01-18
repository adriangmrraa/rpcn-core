import { IGraphRepository } from '../../../core/ports/repositories';
import { Result } from '../../../core/shared/Result';
import { User, Project, MemoryFact } from '../../../core/domain/entities';
import { getGraphSession } from '../../../lib/neo4j';

export class Neo4jRepository implements IGraphRepository {
    async saveUser(user: User): Promise<Result<void>> {
        const session = getGraphSession();
        try {
            await session.run(
                'MERGE (u:User {id: $id}) SET u.email = $email, u.subscription_status = $status, u.stripe_customer_id = $stripeId',
                { id: user.id, email: user.email, status: user.subscription_status, stripeId: user.stripe_customer_id }
            );
            return Result.ok();
        } catch (error: any) {
            return Result.fail({ code: 'DB_ERROR', message: error.message });
        } finally {
            await session.close();
        }
    }

    async findUserById(id: string): Promise<Result<User>> {
        const session = getGraphSession();
        try {
            const result = await session.run('MATCH (u:User {id: $id}) RETURN u', { id });
            if (result.records.length === 0) {
                return Result.fail({ code: 'NOT_FOUND', message: 'User not found' });
            }
            const u = result.records[0].get('u').properties;
            return Result.ok(u as User);
        } catch (error: any) {
            return Result.fail({ code: 'DB_ERROR', message: error.message });
        } finally {
            await session.close();
        }
    }

    async saveProject(project: Project): Promise<Result<void>> {
        const session = getGraphSession();
        try {
            await session.run(
                'MATCH (u:User {id: $userId}) MERGE (p:Project {id: $id}) SET p.name = $name, p.description = $desc MERGE (u)-[:OWNS]->(p)',
                { id: project.id, userId: project.user_id, name: project.name, desc: project.description }
            );
            return Result.ok();
        } catch (error: any) {
            return Result.fail({ code: 'DB_ERROR', message: error.message });
        } finally {
            await session.close();
        }
    }

    async findProjectsByUserId(userId: string): Promise<Result<Project[]>> {
        const session = getGraphSession();
        try {
            const result = await session.run('MATCH (u:User {id: $userId})-[:OWNS]->(p:Project) RETURN p', { userId });
            const projects = result.records.map(r => r.get('p').properties as Project);
            return Result.ok(projects);
        } catch (error: any) {
            return Result.fail({ code: 'DB_ERROR', message: error.message });
        } finally {
            await session.close();
        }
    }

    async saveFact(userId: string, fact: MemoryFact): Promise<Result<void>> {
        const session = getGraphSession();
        try {
            await session.run(
                'MATCH (u:User {id: $userId}) MERGE (f:Fact {id: $id}) SET f.content = $content, f.type = $type MERGE (u)-[:MEMEMBERS]->(f)',
                { id: fact.id, userId, content: fact.content, type: fact.type }
            );
            return Result.ok();
        } catch (error: any) {
            return Result.fail({ code: 'DB_ERROR', message: error.message });
        } finally {
            await session.close();
        }
    }

    async findFactsByUserId(userId: string): Promise<Result<MemoryFact[]>> {
        const session = getGraphSession();
        try {
            const result = await session.run('MATCH (u:User {id: $userId})-[:MEMEMBERS]->(f:Fact) RETURN f', { userId });
            const facts = result.records.map(r => r.get('f').properties as MemoryFact);
            return Result.ok(facts);
        } catch (error: any) {
            return Result.fail({ code: 'DB_ERROR', message: error.message });
        } finally {
            await session.close();
        }
    }

    async deleteFact(userId: string, factId: string): Promise<Result<void>> {
        const session = getGraphSession();
        try {
            await session.run(
                'MATCH (u:User {id: $userId})-[r]-(f:Fact {id: $id}) DETACH DELETE f',
                { userId, id: factId }
            );
            return Result.ok();
        } catch (error: any) {
            return Result.fail({ code: 'DB_ERROR', message: error.message });
        } finally {
            await session.close();
        }
    }
}
