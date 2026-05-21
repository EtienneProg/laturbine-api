import { Controller, Get } from '@nestjs/common';
import { AchievementsService } from './achievements.service';

// Routes publiques — pas de JwtGuard
@Controller('achievements')
export class AchievementsPublicController {
  constructor(private achievementsService: AchievementsService) {}

  @Get('grades')
  getGrades() {
    return this.achievementsService.getGrades();
  }
}
