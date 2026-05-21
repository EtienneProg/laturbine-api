import { IsArray, IsInt, IsBoolean, IsOptional } from 'class-validator';

export class SetResultHungerGamesDto {
  @IsArray()
  @IsInt({ each: true })
  winnerPlayerIds: number[]; // joueurs qui gagnent le succès

  @IsBoolean()
  @IsOptional()
  lastManStanding?: boolean; // true si un seul survivant → succès DENT_POUR_DENT
}
