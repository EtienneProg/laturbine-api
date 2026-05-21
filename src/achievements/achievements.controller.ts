import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { AchievementsService } from './achievements.service';
import { JwtGuard } from '../auth/jwt.guard';

@UseGuards(JwtGuard)
@Controller('achievements')
export class AchievementsController {
  constructor(private achievementsService: AchievementsService) {}

  // Tous les achievements d'un joueur avec progression
  @Get('player/:playerId')
  getPlayerAchievements(@Param('playerId', ParseIntPipe) playerId: number) {
    return this.achievementsService.getPlayerAchievements(playerId);
  }

  // Incrément manuel depuis le dashboard
  @Post('player/:playerId/increment')
  manualIncrement(
    @Param('playerId', ParseIntPipe) playerId: number,
    @Body() body: { key: string },
  ) {
    return this.achievementsService.manualIncrement(playerId, body.key);
  }

  // Déblocage manuel one-shot
  @Post('player/:playerId/unlock')
  manualUnlock(
    @Param('playerId', ParseIntPipe) playerId: number,
    @Body() body: { key: string },
  ) {
    return this.achievementsService.manualUnlock(playerId, body.key);
  }
}
