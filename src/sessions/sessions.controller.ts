import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { JwtGuard } from '../auth/jwt.guard';
import { DiscordService } from '../discord/discord.service';
import { GamesService } from '../games/games.service';

// Routes protégées
@UseGuards(JwtGuard)
@Controller('sessions')
export class SessionsController {
  constructor(
    private sessionsService: SessionsService,
    private discordService: DiscordService,
    private gamesService: GamesService,
  ) {}

  @Get()
  findAll() {
    return this.sessionsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.sessionsService.findOne(id);
  }

  @Get(':id/duels')
  getDuels(@Param('id', ParseIntPipe) id: number) {
    return this.gamesService.findBySession(id);
  }

  @Post()
  create(@Body() dto: CreateSessionDto) {
    return this.sessionsService.create(dto);
  }

  @Put(':id/activate')
  activate(@Param('id', ParseIntPipe) id: number) {
    return this.sessionsService.activate(id);
  }

  @Put(':id/close')
  close(@Param('id', ParseIntPipe) id: number) {
    return this.sessionsService.close(id);
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    const result = this.sessionsService.delete(id);

    this.discordService.deleteSessionMessage(id);
    return result;
  }

  @Get(':id/registrations')
  getRegistrations(@Param('id', ParseIntPipe) id: number) {
    return this.sessionsService.getRegistrations(id);
  }

  @Post(':id/register/:playerId')
  registerPlayer(
    @Param('id', ParseIntPipe) sessionId: number,
    @Param('playerId', ParseIntPipe) playerId: number,
  ) {
    return this.sessionsService.registerPlayer(sessionId, playerId);
  }

  @Delete(':id/register/:playerId')
  unregisterPlayer(
    @Param('id', ParseIntPipe) sessionId: number,
    @Param('playerId', ParseIntPipe) playerId: number,
  ) {
    return this.sessionsService.unregisterPlayer(sessionId, playerId);
  }

  @Post(':id/register-discord/:discordId')
  registerPlayerByDiscordId(
    @Param('id', ParseIntPipe) sessionId: number,
    @Param('discordId') discordId: string,
    @Body()
    body: { discordTag: string; displayName: string; avatarUrl: string | null },
  ) {
    return this.sessionsService.registerPlayerByDiscordId(
      sessionId,
      discordId,
      body.discordTag,
      body.displayName,
      body.avatarUrl,
    );
  }

  @Delete(':id/register-discord/:discordId')
  unregisterPlayerByDiscordId(
    @Param('id', ParseIntPipe) sessionId: number,
    @Param('discordId') discordId: string,
  ) {
    return this.sessionsService.unregisterPlayerByDiscordId(
      sessionId,
      discordId,
    );
  }
}
