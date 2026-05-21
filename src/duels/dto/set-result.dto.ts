import { IsInt } from 'class-validator';

export class SetResultDto {
  @IsInt()
  winnerTeamId: number;
}
