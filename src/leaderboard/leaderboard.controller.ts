import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('leaderboard')
export class LeaderboardController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async getLeaderboard() {
    const players = await this.prisma.player.findMany({
      orderBy: { elo: 'desc' },
      select: {
        id: true,
        name: true,
        discordTag: true,
        avatarUrl: true,
        elo: true,
        wins: true, // uniquement duels
        losses: true, // uniquement duels
        createdAt: true,
      },
    });

    return players.map((player, index) => {
      const total = player.wins + player.losses;
      const winRate = total === 0 ? 0 : Math.round((player.wins / total) * 100);
      return {
        ...player,
        rank: index + 1,
        winRate,
      };
    });
  }
}
