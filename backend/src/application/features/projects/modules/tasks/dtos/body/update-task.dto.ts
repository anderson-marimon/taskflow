import { PartialType } from '@nestjs/swagger';
import { CreateTaskDto } from '@features/projects/modules/tasks/dtos/body/create-task.dto';

export class UpdateTaskDto extends PartialType(CreateTaskDto) {}
