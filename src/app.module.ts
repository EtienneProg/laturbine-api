import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { PlayersModule } from './players/players.module';
import { SessionsModule } from './sessions/sessions.module';
import { DiscordModule } from './discord/discord.module';
import { LeaderboardModule } from './leaderboard/leaderboard.module';
import { EloModule } from './elo/elo.module';
import { GamesModule } from './games/games.module';
import { AchievementsModule } from './achievements/achievements.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    PlayersModule,
    GamesModule, // ← remplace DuelsModule
    SessionsModule,
    DiscordModule,
    LeaderboardModule,
    EloModule,
    AchievementsModule,
  ],
})
export class AppModule {}
