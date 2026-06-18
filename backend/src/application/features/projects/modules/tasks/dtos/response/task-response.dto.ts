import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TaskStatus } from '@features/projects/enums/task-status.enum';

export class TaskResponseDto {
  @ApiProperty()
  public taskId: string;

  @ApiProperty()
  public projectId: string;

  @ApiProperty()
  public title: string;

  @ApiPropertyOptional({ type: String, nullable: true })
  public description: Nullable<string>;

  @ApiProperty({ enum: TaskStatus })
  public status: TaskStatus;

  @ApiPropertyOptional({ type: String, nullable: true })
  public assigneeId: Nullable<string>;

  @ApiPropertyOptional({ type: Date, nullable: true })
  public completedAt: Nullable<Date>;

  @ApiProperty()
  public createdAt: Date;

  @ApiProperty()
  public updatedAt: Date;

  @ApiPropertyOptional({ type: Date, nullable: true })
  public deletedAt: Nullable<Date>;
}
