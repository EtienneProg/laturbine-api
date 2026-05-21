import { IsInt } from 'class-validator';

export class SetResultDuelDto {
  @IsInt()
  winnerTeamId: number;
}
