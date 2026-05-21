import { Module } from '@nestjs/common';
import { AchievementsService } from './achievements.service';
import { AchievementsController } from './achievements.controller';
import { AchievementsPublicController } from './achievements.public.controller';

@Module({
  controllers: [AchievementsController, AchievementsPublicController],
  providers: [AchievementsService],
  exports: [AchievementsService],
})
export class AchievementsModule {}
