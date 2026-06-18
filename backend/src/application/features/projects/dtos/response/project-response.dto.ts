import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProjectResponseDto {
  @ApiProperty()
  public projectId: string;

  @ApiProperty()
  public ownerId: string;

  @ApiProperty()
  public name: string;

  @ApiPropertyOptional({ type: String, nullable: true })
  public description: Nullable<string>;

  @ApiProperty()
  public createdAt: Date;

  @ApiProperty()
  public updatedAt: Date;

  @ApiPropertyOptional({ type: Date, nullable: true })
  public deletedAt: Nullable<Date>;
}
