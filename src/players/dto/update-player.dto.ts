import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class UpdatePlayerDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  discordId?: string;

  @IsString()
  @IsOptional()
  discordTag?: string;

  @IsInt()
  @Min(100)
  @IsOptional()
  elo?: number;
}
