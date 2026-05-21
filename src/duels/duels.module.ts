import { Module } from '@nestjs/common';
import { DuelsService } from './duels.service';
import { DuelsController } from './duels.controller';
import { EloModule } from '../elo/elo.module';

@Module({
  imports: [EloModule],
  controllers: [DuelsController],
  providers: [DuelsService],
  exports: [DuelsService],
})
export class DuelsModule {}
