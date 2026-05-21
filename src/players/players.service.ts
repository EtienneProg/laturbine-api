import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePlayerDto } from './dto/create-player.dto';
import { UpdatePlayerDto } from './dto/update-player.dto';

@Injectable()
export class PlayersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.player.findMany({
      orderBy: { elo: 'desc' },
    });
  }

  async findOne(id: number) {
    const player = await this.prisma.player.findUnique({
      where: { id },
      include: {
        eloHistory: {
          orderBy: { createdAt: 'desc' },
          take: 50,
        },
      },
    });

    if (!player) throw new NotFoundException(`Joueur #${id} introuvable`);

    // Calcul du rang
    const rank = await this.prisma.player.count({
      where: { elo: { gt: player.elo } },
    });

    // Calcul winRate
    const total = player.wins + player.losses;
    const winRate = total === 0 ? 0 : Math.round((player.wins / total) * 100);

    return { ...player, rank: rank + 1, winRate };
  }

  async create(dto: CreatePlayerDto) {
    const existing = await this.prisma.player.findFirst({
      where: {
        OR: [{ name: dto.name }, { discordId: dto.discordId }],
      },
    });

    if (existing) {
      throw new ConflictException(
        'Un joueur avec ce nom ou Discord ID existe déjà',
      );
    }

    return this.prisma.player.create({ data: dto });
  }

  async update(id: number, dto: UpdatePlayerDto) {
    await this.findOne(id);
    return this.prisma.player.update({
      where: { id },
      data: dto,
    });
  }

  async findByDiscordId(discordId: string) {
    const player = await this.prisma.player.findUnique({
      where: { discordId },
      include: {
        eloHistory: {
          orderBy: { createdAt: 'desc' },
          take: 50,
        },
        achievements: {
          include: { achievement: true },
        },
      },
    });

    if (!player)
      throw new NotFoundException(
        `Joueur avec Discord ID ${discordId} introuvable`,
      );

    const rank = await this.prisma.player.count({
      where: { elo: { gt: player.elo } },
    });

    const total = player.wins + player.losses;
    const winRate = total === 0 ? 0 : Math.round((player.wins / total) * 100);

    return { ...player, rank: rank + 1, winRate };
  }

  async delete(id: number) {
    await this.findOne(id);
    return this.prisma.player.delete({ where: { id } });
  }
}
