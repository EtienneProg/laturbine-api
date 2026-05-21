import { Controller, Get } from '@nestjs/common';
import { GamesService } from './games.service';

// Routes publiques — pas de JwtGuard
@Controller('public/games')
export class GamesPublicController {
  constructor(private gamesService: GamesService) {}

  @Get('recent')
  getRecent() {
    return this.gamesService.getRecentDuels();
  }

  @Get('last-match')
  getLastMatchPerPlayer() {
    return this.gamesService.getLastMatchPerPlayer();
  }
}
