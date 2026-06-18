import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from '@features/projects/entities/project.entity';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    public readonly repo: Repository<Project>,
  ) {}

  async save(project: Project): Promise<Project> {
    return this.repo.save(project);
  }

  async findById(projectId: string): Promise<Nullable<Project>> {
    return this.repo.findOne({ where: { projectId } });
  }

  async softRemove(project: Project): Promise<Project> {
    return this.repo.softRemove(project);
  }
}
