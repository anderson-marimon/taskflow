import { PartialType } from '@nestjs/swagger';
import { CreateProjectDto } from '@features/projects/dtos/body/create-project.dto';

export class UpdateProjectDto extends PartialType(CreateProjectDto) {}
