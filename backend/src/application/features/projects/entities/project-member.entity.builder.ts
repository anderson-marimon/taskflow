import { ProjectMember } from '@features/projects/entities/project-member.entity';

export class ProjectMemberEntityBuilder {
  private readonly member: Partial<ProjectMember> = {};

  public static create(): ProjectMemberEntityBuilder {
    return new ProjectMemberEntityBuilder();
  }

  public withProjectId(projectId: string): ProjectMemberEntityBuilder {
    this.member.projectId = projectId;
    return this;
  }

  public withUserId(userId: string): ProjectMemberEntityBuilder {
    this.member.userId = userId;
    return this;
  }

  public build(): ProjectMember {
    const requiredFields: (keyof ProjectMember)[] = ['projectId', 'userId'];
    for (const field of requiredFields) {
      if (this.member[field] === undefined) {
        throw new Error(`Falta el campo requerido para crear el miembro: ${field}`);
      }
    }
    return Object.assign(new ProjectMember(), this.member);
  }
}
