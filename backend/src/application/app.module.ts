import { Module } from '@nestjs/common';
import { DatabaseModule } from '@services/database/database.module';

@Module({
  imports: [DatabaseModule],
})
export class AppModule {}
