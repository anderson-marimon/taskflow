import { ProjectEntityBuilder } from '@features/projects/entities/project.entity.builder';
import { Project } from '@features/projects/entities/project.entity';

describe('ProjectEntityBuilder', () => {
  it('retorna una instancia de Project', () => {
    const project = ProjectEntityBuilder.create().withOwnerId('uuid-owner').withName('Mi Proyecto').build();
    expect(project).toBeInstanceOf(Project);
  });

  it('asigna ownerId correctamente', () => {
    const project = ProjectEntityBuilder.create().withOwnerId('uuid-owner').withName('Test').build();
    expect(project.ownerId).toBe('uuid-owner');
  });

  it('asigna name correctamente', () => {
    const project = ProjectEntityBuilder.create().withOwnerId('uuid-owner').withName('Mi Proyecto').build();
    expect(project.name).toBe('Mi Proyecto');
  });

  it('asigna description correctamente', () => {
    const project = ProjectEntityBuilder.create().withOwnerId('uuid-owner').withName('Test').withDescription('Una descripción').build();
    expect(project.description).toBe('Una descripción');
  });

  it('build() sin name lanza error', () => {
    expect(() => ProjectEntityBuilder.create().withOwnerId('uuid-owner').build()).toThrow();
  });

  it('build() sin ownerId lanza error', () => {
    expect(() => ProjectEntityBuilder.create().withName('Test').build()).toThrow();
  });
});
