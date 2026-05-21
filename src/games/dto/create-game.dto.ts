import { IsInt, IsArray, ArrayMinSize, IsOptional } from 'class-validator';

export class CreateTeamDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsInt({ each: true })
  playerIds: number[];
}

export class CreateGameDto {
  @IsInt()
  sessionId: number;

  @IsInt()
  gameModeId: number;

  // Optionnel car HungerGames n'a pas d'équipes
  @IsArray()
  @IsOptional()
  teams?: CreateTeamDto[];
}
