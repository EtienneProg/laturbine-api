import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsInt,
  Max,
  Min,
} from 'class-validator';

export class CreateDuelDto {
  @IsInt()
  sessionId: number;

  @IsInt()
  @Min(1)
  @Max(5)
  teamSize: number;

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(5)
  @IsInt({ each: true })
  team1PlayerIds: number[];

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(5)
  @IsInt({ each: true })
  team2PlayerIds: number[];
}
