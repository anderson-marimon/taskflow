import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProjectMemberResponseDto {
  @ApiProperty()
  public projectId: string;

  @ApiProperty()
  public userId: string;

  @ApiProperty()
  public createdAt: Date;

  @ApiProperty()
  public updatedAt: Date;

  @ApiPropertyOptional({ type: Date, nullable: true })
  public deletedAt: Nullable<Date>;
}
