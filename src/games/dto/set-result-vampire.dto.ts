import { IsArray, IsInt } from 'class-validator';

export class SetResultVampireDto {
  // "vampires" | "villagers"
  @IsArray()
  @IsInt({ each: true })
  // IDs des villageois non contaminés (ceux qui gagnent le succès)
  // Si vampires gagnent → tableau vide, on prend les vampires auto
  survivingVillagerIds: number[];

  winner: 'vampires' | 'villagers';
}
