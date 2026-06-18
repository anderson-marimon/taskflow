import { ProjectMemberEntityBuilder } from '@features/projects/entities/project-member.entity.builder';
import { ProjectMember } from '@features/projects/entities/project-member.entity';

describe('ProjectMemberEntityBuilder', () => {
  it('retorna una instancia de ProjectMember', () => {
    const member = ProjectMemberEntityBuilder.create().withProjectId('uuid-project').withUserId('uuid-user').build();
    expect(member).toBeInstanceOf(ProjectMember);
  });

  it('asigna projectId correctamente', () => {
    const member = ProjectMemberEntityBuilder.create().withProjectId('uuid-project').withUserId('uuid-user').build();
    expect(member.projectId).toBe('uuid-project');
  });

  it('asigna userId correctamente', () => {
    const member = ProjectMemberEntityBuilder.create().withProjectId('uuid-project').withUserId('uuid-user').build();
    expect(member.userId).toBe('uuid-user');
  });

  it('build() sin projectId lanza error', () => {
    expect(() => ProjectMemberEntityBuilder.create().withUserId('uuid-user').build()).toThrow();
  });

  it('build() sin userId lanza error', () => {
    expect(() => ProjectMemberEntityBuilder.create().withProjectId('uuid-project').build()).toThrow();
  });
});
