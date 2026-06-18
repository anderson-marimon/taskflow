import { ValidateAssigneeIsMemberSubquery } from '@features/projects/modules/tasks/subqueries/validate-assignee-is-member.subquery';
import { ProjectMembersService } from '@features/projects/services/project-members.service';
import { ProjectMember } from '@features/projects/entities/project-member.entity';

const mockProjectMembersService = {
  findMember: jest.fn(),
} as unknown as ProjectMembersService;

describe('ValidateAssigneeIsMemberSubquery', () => {
  let subquery: ValidateAssigneeIsMemberSubquery;

  beforeEach(() => {
    jest.clearAllMocks();
    subquery = new ValidateAssigneeIsMemberSubquery(mockProjectMembersService);
  });

  it('assignee es miembro del proyecto → retorna true', async () => {
    const member = new ProjectMember();
    (mockProjectMembersService.findMember as jest.Mock).mockResolvedValue(member);
    const result = await subquery.execute('project-id', 'user-id');
    expect(result).toBe(true);
  });

  it('assignee no es miembro del proyecto → retorna false', async () => {
    (mockProjectMembersService.findMember as jest.Mock).mockResolvedValue(null);
    const result = await subquery.execute('project-id', 'stranger-id');
    expect(result).toBe(false);
  });
});
