import { Injectable } from '@nestjs/common';
import { ProjectMembersService } from '@features/projects/services/project-members.service';

@Injectable()
export class ValidateAssigneeIsMemberSubquery {
  constructor(private readonly projectMembersService: ProjectMembersService) {}

  async execute(projectId: string, assigneeId: string): Promise<boolean> {
    const member = await this.projectMembersService.findMember(projectId, assigneeId);
    return !!member;
  }
}
