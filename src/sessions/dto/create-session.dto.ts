import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class CreateSessionDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'La date doit être au format YYYY-MM-DD',
  })
  date: string;
}
