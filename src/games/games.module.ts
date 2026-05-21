import { Module } from '@nestjs/common';
import { GamesService } from './games.service';
import { GamesController } from './games.controller';
import { EloModule } from '../elo/elo.module';
import { AchievementsModule } from '../achievements/achievements.module';

@Module({
  imports: [EloModule, AchievementsModule],
  controllers: [GamesController],
  providers: [GamesService],
  exports: [GamesService],
})
export class GamesModule {}
