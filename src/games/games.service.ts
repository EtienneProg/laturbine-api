import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EloService } from '../elo/elo.service';
import { AchievementsService } from '../achievements/achievements.service';
import { CreateGameDto } from './dto/create-game.dto';
import { SetResultDuelDto } from './dto/set-result-duel.dto';
import { SetResultVampireDto } from './dto/set-result-vampire.dto';
import { SetResultHungerGamesDto } from './dto/set-result-hunger-games.dto';
import { GameStatus } from '@prisma/client';

const GAME_MODE_IDS = { DUEL: 1, VAMPIRE: 2, HUNGER_GAMES: 3 };

@Injectable()
export class GamesService {
  constructor(
    private prisma: PrismaService,
    private eloService: EloService,
    private achievements: AchievementsService,
  ) {}

  private includeAll = {
    gameMode: true,
    teams: {
      include: {
        players: {
          include: { player: true },
        },
      },
    },
    eloHistory: {
      include: {
        player: { select: { id: true, name: true } },
      },
    },
  };

  async findAll() {
    return this.prisma.game.findMany({
      orderBy: { createdAt: 'desc' },
      include: this.includeAll,
    });
  }

  async findBySession(sessionId: number) {
    return this.prisma.game.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'desc' },
      include: this.includeAll,
    });
  }

  async findOne(id: number) {
    const game = await this.prisma.game.findUnique({
      where: { id },
      include: this.includeAll,
    });
    if (!game) throw new NotFoundException(`Game #${id} introuvable`);
    return game;
  }

  async getGameModes() {
    return this.prisma.gameMode.findMany();
  }

  async create(dto: CreateGameDto) {
    const gameMode = await this.prisma.gameMode.findUnique({
      where: { id: dto.gameModeId },
    });
    if (!gameMode)
      throw new NotFoundException(`GameMode #${dto.gameModeId} introuvable`);

    // Validation équipes selon le mode
    if (gameMode.hasTeams) {
      if (!dto.teams || dto.teams.length !== gameMode.teamNames.length) {
        throw new BadRequestException(
          `Ce mode nécessite ${gameMode.teamNames.length} équipe(s)`,
        );
      }
    }

    return this.prisma.game.create({
      data: {
        sessionId: dto.sessionId,
        gameModeId: dto.gameModeId,
        teams: gameMode.hasTeams
          ? {
              create: dto.teams!.map((team, i) => ({
                name: gameMode.teamNames[i],
                players: {
                  create: team.playerIds.map((playerId) => ({ playerId })),
                },
              })),
            }
          : undefined,
      },
      include: this.includeAll,
    });
  }

  // ─────────────────────────────────────────
  // Résultat DUEL — ELO + achievements
  // ─────────────────────────────────────────
  async setResultDuel(id: number, dto: SetResultDuelDto) {
    const game = await this.findOne(id);

    if (game.gameModeId !== GAME_MODE_IDS.DUEL) {
      throw new BadRequestException(
        'Cette route est uniquement pour les duels',
      );
    }
    if (game.status === GameStatus.FINISHED) {
      throw new BadRequestException('Cette game est déjà terminée');
    }

    const winnerTeam = game.teams.find((t: any) => t.id === dto.winnerTeamId);
    const loserTeam = game.teams.find((t: any) => t.id !== dto.winnerTeamId);

    if (!winnerTeam || !loserTeam) {
      throw new BadRequestException('Équipe introuvable');
    }

    const winnerPlayers = winnerTeam.players.map((tp: any) => ({
      id: tp.player.id,
      elo: tp.player.elo,
    }));
    const loserPlayers = loserTeam.players.map((tp: any) => ({
      id: tp.player.id,
      elo: tp.player.elo,
    }));

    const eloResults = this.eloService.calculate(winnerPlayers, loserPlayers);

    await this.prisma.$transaction(async (tx) => {
      for (const result of eloResults) {
        const isWinner = winnerPlayers.some(
          (p: any) => p.id === result.playerId,
        );
        await tx.player.update({
          where: { id: result.playerId },
          data: {
            elo: result.eloAfter,
            wins: isWinner ? { increment: 1 } : undefined,
            losses: isWinner ? undefined : { increment: 1 },
          },
        });
        await tx.eloHistory.create({
          data: {
            playerId: result.playerId,
            gameId: id,
            eloBefore: result.eloBefore,
            eloAfter: result.eloAfter,
            delta: result.delta,
          },
        });
      }
      await tx.game.update({
        where: { id },
        data: {
          status: GameStatus.FINISHED,
          winnerTeamId: dto.winnerTeamId,
          finishedAt: new Date(),
        },
      });
    });

    // Vérification achievements duel
    const allPlayerIds = [...winnerPlayers, ...loserPlayers].map(
      (p: any) => p.id,
    );
    for (const playerId of allPlayerIds) {
      await this.achievements.checkDuelAchievements(playerId);
    }

    return this.findOne(id);
  }

  // ─────────────────────────────────────────
  // Résultat VAMPIRE — achievements uniquement
  // ─────────────────────────────────────────
  async setResultVampire(id: number, dto: SetResultVampireDto) {
    const game = await this.findOne(id);

    if (game.gameModeId !== GAME_MODE_IDS.VAMPIRE) {
      throw new BadRequestException(
        'Cette route est uniquement pour le mode Vampire',
      );
    }
    if (game.status === GameStatus.FINISHED) {
      throw new BadRequestException('Cette game est déjà terminée');
    }

    const vampireTeam = game.teams.find((t: any) => t.name === 'Vampires');
    const villagerTeam = game.teams.find((t: any) => t.name === 'Villageois');

    await this.prisma.game.update({
      where: { id },
      data: { status: GameStatus.FINISHED, finishedAt: new Date() },
    });

    if (dto.winner === 'vampires') {
      // Vampires gagnent → succès pour les vampires du début uniquement
      const vampireIds =
        vampireTeam?.players.map((tp: any) => tp.player.id) ?? [];
      for (const playerId of vampireIds) {
        await this.achievements.incrementVampireWin(playerId);
      }
    } else {
      // Villageois gagnent → succès pour les survivants non contaminés
      for (const playerId of dto.survivingVillagerIds) {
        await this.achievements.incrementSurvivorWin(playerId);
      }
    }

    // Dernier survivant → SANG_POUR_SANG
    if (dto.winner === 'villagers' && dto.survivingVillagerIds.length === 1) {
      await this.achievements.unlockAchievement(
        dto.survivingVillagerIds[0],
        'SANG_POUR_SANG',
      );
    }

    return this.findOne(id);
  }

  // ─────────────────────────────────────────
  // Résultat HUNGER GAMES — achievements uniquement
  // ─────────────────────────────────────────
  async setResultHungerGames(id: number, dto: SetResultHungerGamesDto) {
    const game = await this.findOne(id);

    if (game.gameModeId !== GAME_MODE_IDS.HUNGER_GAMES) {
      throw new BadRequestException(
        'Cette route est uniquement pour le mode Hunger Games',
      );
    }
    if (game.status === GameStatus.FINISHED) {
      throw new BadRequestException('Cette game est déjà terminée');
    }

    await this.prisma.game.update({
      where: { id },
      data: { status: GameStatus.FINISHED, finishedAt: new Date() },
    });

    for (const playerId of dto.winnerPlayerIds) {
      await this.achievements.incrementHungerGamesWin(playerId);
    }

    // Dernier survivant → DENT_POUR_DENT
    if (dto.lastManStanding && dto.winnerPlayerIds.length === 1) {
      await this.achievements.unlockAchievement(
        dto.winnerPlayerIds[0],
        'DENT_POUR_DENT',
      );
    }

    return this.findOne(id);
  }

  async delete(id: number) {
    await this.findOne(id);
    return this.prisma.game.delete({ where: { id } });
  }

  async getRecentDuels() {
    return this.prisma.game.findMany({
      where: { gameModeId: 1 }, // DUEL uniquement
      orderBy: { createdAt: 'desc' },
      take: 20, // on prend 20, le front calculera les slots
      include: this.includeAll,
    });
  }

  async getLastMatchPerPlayer() {
    const players = await this.prisma.player.findMany({
      select: { id: true, name: true },
    });

    const result: Record<number, { opponents: string[]; win: boolean }> = {};

    for (const player of players) {
      const game = await this.prisma.game.findFirst({
        where: {
          gameModeId: 1,
          status: 'FINISHED',
          teams: { some: { players: { some: { playerId: player.id } } } },
        },
        orderBy: { finishedAt: 'desc' },
        include: this.includeAll,
      });

      if (!game) continue;

      const myTeam = game.teams.find((t) =>
        t.players.some((tp: any) => tp.playerId === player.id),
      );
      const otherTeam = game.teams.find((t) => t.id !== myTeam?.id);
      const won = game.winnerTeamId === myTeam?.id;

      result[player.id] = {
        opponents: otherTeam?.players.map((tp: any) => tp.player.name) ?? [],
        win: won,
      };
    }

    return result;
  }
}
