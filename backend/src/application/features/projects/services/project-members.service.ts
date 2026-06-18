import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProjectMember } from '@features/projects/entities/project-member.entity';

@Injectable()
export class ProjectMembersService {
  constructor(
    @InjectRepository(ProjectMember)
    public readonly repo: Repository<ProjectMember>,
  ) {}

  async save(member: ProjectMember): Promise<ProjectMember> {
    return this.repo.save(member);
  }

  async findMember(projectId: string, userId: string): Promise<Nullable<ProjectMember>> {
    return this.repo.findOne({ where: { projectId, userId } });
  }
}
