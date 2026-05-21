import { Module } from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { SessionsController } from './sessions.controller';
import { DiscordModule } from '../discord/discord.module';
import { GamesModule } from '../games/games.module';

@Module({
  imports: [DiscordModule, GamesModule],
  controllers: [SessionsController],
  providers: [SessionsService],
  exports: [SessionsService],
})
export class SessionsModule {}
