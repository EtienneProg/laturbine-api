import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { DiscordService } from './discord.service';
import { JwtGuard } from '../auth/jwt.guard';

@UseGuards(JwtGuard)
@Controller('discord')
export class DiscordController {
  constructor(private discordService: DiscordService) {}

  @Get('active-messages')
  getActiveMessages() {
    return this.discordService.getActiveMessages();
  }

  @Post('messages')
  saveMessage(
    @Body()
    body: {
      type: string;
      refId: number;
      messageId: string;
      channelId: string;
    },
  ) {
    return this.discordService.saveMessage(
      body.type,
      body.refId,
      body.messageId,
      body.channelId,
    );
  }

  @Delete('messages/:type/:refId')
  deleteMessage(
    @Param('type') type: string,
    @Param('refId', ParseIntPipe) refId: number,
  ) {
    return this.discordService.deleteMessage(type, refId);
  }

  @Post('announce-session/:id')
  announceSession(@Param('id', ParseIntPipe) id: number) {
    return this.discordService.announceSession(id);
  }

  @Post('announce-duel/:id')
  announceDuel(@Param('id', ParseIntPipe) id: number) {
    return this.discordService.announceDuel(id);
  }

  @Post('announce-result/:id')
  announceResult(@Param('id', ParseIntPipe) id: number) {
    return this.discordService.announceResult(id);
  }
}
