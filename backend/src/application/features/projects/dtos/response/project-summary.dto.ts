import { ApiProperty } from '@nestjs/swagger';

export class ProjectSummaryDto {
  @ApiProperty()
  public totalTasks: number;

  @ApiProperty()
  public completed: number;

  @ApiProperty()
  public inProgress: number;

  @ApiProperty()
  public pending: number;

  @ApiProperty({ type: Number, nullable: true })
  public averageResolutionTimeSeconds: Nullable<number>;
}
