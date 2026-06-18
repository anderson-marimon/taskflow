import { Project } from '@features/projects/entities/project.entity';

export class ProjectEntityBuilder {
  private readonly project: Partial<Project> = {};

  public static create(): ProjectEntityBuilder {
    return new ProjectEntityBuilder();
  }

  public withOwnerId(ownerId: string): ProjectEntityBuilder {
    this.project.ownerId = ownerId;
    return this;
  }

  public withName(name: string): ProjectEntityBuilder {
    this.project.name = name;
    return this;
  }

  public withDescription(description: Nullable<string>): ProjectEntityBuilder {
    this.project.description = description;
    return this;
  }

  public build(): Project {
    const requiredFields: (keyof Project)[] = ['ownerId', 'name'];
    for (const field of requiredFields) {
      if (this.project[field] === undefined) {
        throw new Error(`Falta el campo requerido para crear el proyecto: ${field}`);
      }
    }
    return Object.assign(new Project(), this.project);
  }
}
