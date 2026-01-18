import { IGraphRepository } from '../../../core/ports/repositories';
import { Result } from '../../../core/shared/Result';
import { User, Project, MemoryFact } from '../../../core/domain/entities';

export class MockGraphRepository implements IGraphRepository {
    private users: User[] = [
        { id: 'default_user', email: 'preview@rpcn.ai', subscription_status: 'active' }
    ];

    async findUserById(id: string): Promise<Result<User>> {
        const user = this.users.find(u => u.id === id);
        return user ? Result.ok(user) : Result.fail({ code: 'NOT_FOUND', message: 'User not found' });
    }

    async saveUser(user: User): Promise<Result<void>> { return Result.ok(); }
    async saveProject(project: Project): Promise<Result<void>> { return Result.ok(); }

    async createProject(userId: string, name: string): Promise<Result<Project>> {
        return Result.ok({
            id: 'mock_proj',
            user_id: userId,
            name,
            status: 'active',
            created_at: new Date()
        } as any);
    }

    async getProjectsByUser(userId: string): Promise<Result<Project[]>> { return Result.ok([]); }
    async findProjectsByUserId(userId: string): Promise<Result<Project[]>> { return Result.ok([]); }

    async saveFact(userId: string, fact: MemoryFact): Promise<Result<void>> { return Result.ok(); }
    async findFactsByUserId(userId: string): Promise<Result<MemoryFact[]>> { return Result.ok([]); }
    async deleteFact(userId: string, factId: string): Promise<Result<void>> { return Result.ok(); }
    async connectFactToProject(factId: string, projectId: string): Promise<Result<void>> { return Result.ok(); }
}
