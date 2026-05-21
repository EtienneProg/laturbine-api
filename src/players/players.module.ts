import { Module } from '@nestjs/common';
import { PlayersService } from './players.service';
import { PlayersController } from './players.controller';
import { AchievementsModule } from '../achievements/achievements.module';

@Module({
  controllers: [PlayersController],
  providers: [PlayersService],
  exports: [PlayersService],
  imports: [AchievementsModule],
})
export class PlayersModule {}
