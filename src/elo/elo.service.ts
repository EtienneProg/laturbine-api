import { Injectable } from '@nestjs/common';

export interface EloResult {
  playerId: number;
  eloBefore: number;
  eloAfter: number;
  delta: number;
}

@Injectable()
export class EloService {
  // winnerElos / loserElos = tableaux des ELOs actuels de chaque équipe
  calculate(
    winnerPlayers: { id: number; elo: number }[],
    loserPlayers: { id: number; elo: number }[],
  ): EloResult[] {
    const winnerAvg = this.teamAvgElo(winnerPlayers.map((p) => p.elo));
    const loserAvg = this.teamAvgElo(loserPlayers.map((p) => p.elo));

    const results: EloResult[] = [];

    // Calcul pour les gagnants (score réel = 1)
    for (const player of winnerPlayers) {
      const k = this.getKFactor(player.elo);
      const expected = this.expectedScore(player.elo, loserAvg);
      const delta = Math.round(k * (1 - expected));
      const eloAfter = player.elo + delta;

      results.push({
        playerId: player.id,
        eloBefore: player.elo,
        eloAfter,
        delta,
      });
    }

    // Calcul pour les perdants (score réel = 0)
    for (const player of loserPlayers) {
      const k = this.getKFactor(player.elo);
      const expected = this.expectedScore(player.elo, winnerAvg);
      const delta = Math.round(k * (0 - expected));
      const eloAfter = Math.max(100, player.elo + delta); // ELO minimum = 100

      results.push({
        playerId: player.id,
        eloBefore: player.elo,
        eloAfter,
        delta,
      });
    }

    return results;
  }

  // K-factor selon le niveau du joueur
  private getKFactor(elo: number): number {
    if (elo < 1400) return 40; // Débutant — variations importantes
    if (elo < 1600) return 32; // Intermédiaire
    if (elo < 1800) return 24; // Confirmé
    return 16; // Elite — variations plus faibles
  }

  // Probabilité de victoire attendue
  private expectedScore(eloA: number, eloB: number): number {
    return 1 / (1 + Math.pow(10, (eloB - eloA) / 400));
  }

  // Calcule les nouveaux ELOs après un duel

  // Calcule l'ELO moyen d'une équipe
  private teamAvgElo(elos: number[]): number {
    return Math.round(elos.reduce((sum, e) => sum + e, 0) / elos.length);
  }
}
