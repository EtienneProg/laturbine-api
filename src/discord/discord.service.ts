import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DiscordService {
  private readonly logger = new Logger(DiscordService.name);

  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
  ) {}

  // ─────────────────────────────────────────
  // Gestion des messages actifs
  // ─────────────────────────────────────────

  async getActiveMessages() {
    return this.prisma.discordMessage.findMany();
  }

  async saveMessage(
    type: string,
    refId: number,
    messageId: string,
    channelId: string,
  ) {
    return this.prisma.discordMessage.upsert({
      where: { type_refId: { type, refId } },
      create: { type, refId, messageId, channelId },
      update: { messageId, channelId },
    });
  }

  async deleteMessage(type: string, refId: number) {
    return this.prisma.discordMessage.deleteMany({
      where: { type, refId },
    });
  }

  // ─────────────────────────────────────────
  // Appel vers le bot Discord
  // ─────────────────────────────────────────

  private async callBot(path: string, method = 'POST'): Promise<void> {
    const botUrl =
      this.config.get<string>('BOT_URL') ?? 'http://localhost:3001';
    const token = this.config.get<string>('BOT_API_TOKEN') ?? '';
    try {
      const res = await fetch(`${botUrl}${path}`, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        const text = await res.text();
        this.logger.error(`Bot call failed ${path}: ${res.status} ${text}`);
      }
    } catch (err) {
      this.logger.error(`Bot unreachable ${path}:`, err);
    }
  }

  async announceSession(sessionId: number): Promise<void> {
    await this.callBot(`/announce-session/${sessionId}`);
  }

  async announceDuel(duelId: number): Promise<void> {
    await this.callBot(`/announce-duel/${duelId}`);
  }

  async announceResult(duelId: number): Promise<void> {
    await this.callBot(`/announce-result/${duelId}`);
  }

  async deleteSessionMessage(sessionId: number): Promise<void> {
    await this.callBot(`/delete-message/session/${sessionId}`, 'DELETE');
  }

  async deleteDuelMessage(duelId: number): Promise<void> {
    await this.callBot(`/delete-message/duel/${duelId}`, 'DELETE');
  }
}
