import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EloService } from '../elo/elo.service';
import { CreateDuelDto } from './dto/create-duel.dto';
import { SetResultDto } from './dto/set-result.dto';
import { DuelStatus } from '@prisma/client';

@Injectable()
export class DuelsService {
  private includeAll = {
    teams: {
      include: {
        players: {
          include: {
            player: true,
          },
        },
      },
    },
    eloHistory: {
      include: {
        player: {
          select: { id: true, name: true },
        },
      },
    },
  };

  constructor(
    private prisma: PrismaService,
    private eloService: EloService,
  ) {}

  async findAll() {
    return this.prisma.duel.findMany({
      orderBy: { createdAt: 'desc' },
      include: this.includeAll,
    });
  }

  async findBySession(sessionId: number) {
    return this.prisma.duel.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'desc' },
      include: this.includeAll,
    });
  }

  async findOne(id: number) {
    const duel = await this.prisma.duel.findUnique({
      where: { id },
      include: this.includeAll,
    });
    if (!duel) throw new NotFoundException(`Duel #${id} introuvable`);
    return duel;
  }

  async create(dto: CreateDuelDto) {
    const { sessionId, teamSize, team1PlayerIds, team2PlayerIds } = dto;

    // Vérification taille des équipes
    if (
      team1PlayerIds.length !== teamSize ||
      team2PlayerIds.length !== teamSize
    ) {
      throw new BadRequestException(
        'Le nombre de joueurs ne correspond pas à la taille des équipes',
      );
    }

    // Vérification doublons entre équipes
    const overlap = team1PlayerIds.filter((id) => team2PlayerIds.includes(id));
    if (overlap.length > 0) {
      throw new BadRequestException(
        'Un joueur ne peut pas être dans les deux équipes',
      );
    }

    return this.prisma.duel.create({
      data: {
        sessionId,
        teamSize,
        teams: {
          create: [
            {
              number: 1,
              players: {
                create: team1PlayerIds.map((playerId) => ({ playerId })),
              },
            },
            {
              number: 2,
              players: {
                create: team2PlayerIds.map((playerId) => ({ playerId })),
              },
            },
          ],
        },
      },
      include: this.includeAll,
    });
  }

  async setResult(id: number, dto: SetResultDto) {
    const duel = await this.findOne(id);

    if (duel.status === DuelStatus.FINISHED) {
      throw new BadRequestException('Ce duel est déjà terminé');
    }

    const winnerTeam = duel.teams.find((t) => t.id === dto.winnerTeamId);
    const loserTeam = duel.teams.find((t) => t.id !== dto.winnerTeamId);

    if (!winnerTeam || !loserTeam) {
      throw new BadRequestException('Équipe introuvable');
    }

    const winnerPlayers = winnerTeam.players.map((tp) => ({
      id: tp.player.id,
      elo: tp.player.elo,
    }));
    const loserPlayers = loserTeam.players.map((tp) => ({
      id: tp.player.id,
      elo: tp.player.elo,
    }));

    // Calcul ELO
    const eloResults = this.eloService.calculate(winnerPlayers, loserPlayers);

    // Transaction : update ELO + historique + statut duel
    await this.prisma.$transaction(async (tx) => {
      for (const result of eloResults) {
        const isWinner = winnerPlayers.some((p) => p.id === result.playerId);

        // Update ELO + stats joueur
        await tx.player.update({
          where: { id: result.playerId },
          data: {
            elo: result.eloAfter,
            wins: isWinner ? { increment: 1 } : undefined,
            losses: isWinner ? undefined : { increment: 1 },
          },
        });

        // Historique ELO
        await tx.eloHistory.create({
          data: {
            playerId: result.playerId,
            duelId: id,
            eloBefore: result.eloBefore,
            eloAfter: result.eloAfter,
            delta: result.delta,
          },
        });
      }

      // Clôture du duel
      await tx.duel.update({
        where: { id },
        data: {
          status: DuelStatus.FINISHED,
          winnerTeamId: dto.winnerTeamId,
          finishedAt: new Date(),
        },
      });
    });

    return this.findOne(id);
  }

  async delete(id: number) {
    await this.findOne(id);
    return this.prisma.duel.delete({ where: { id } });
  }
}
