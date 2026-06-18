import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class OriginErrorDto {
  @ApiProperty()
  public origin: string;

  @ApiProperty()
  public message: string;
}

export class ApiResponseDto {
  @ApiProperty()
  public ok: boolean;

  @ApiProperty()
  public statusCode: number;

  @ApiProperty()
  public internalCode: number;

  @ApiProperty()
  public prefix: string;

  @ApiProperty()
  public message: string;

  @ApiPropertyOptional({ type: [OriginErrorDto] })
  public errors?: OriginErrorDto[];
}
