import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { GamesService } from './games.service';
import { CreateGameDto } from './dto/create-game.dto';
import { SetResultDuelDto } from './dto/set-result-duel.dto';
import { SetResultVampireDto } from './dto/set-result-vampire.dto';
import { SetResultHungerGamesDto } from './dto/set-result-hunger-games.dto';
import { JwtGuard } from '../auth/jwt.guard';

@UseGuards(JwtGuard)
@Controller('games')
export class GamesController {
  constructor(private gamesService: GamesService) {}

  @Get('modes')
  getGameModes() {
    return this.gamesService.getGameModes();
  }

  @Get()
  findAll() {
    return this.gamesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.gamesService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateGameDto) {
    return this.gamesService.create(dto);
  }

  @Put(':id/result/duel')
  setResultDuel(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: SetResultDuelDto,
  ) {
    return this.gamesService.setResultDuel(id, dto);
  }

  @Put(':id/result/vampire')
  setResultVampire(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: SetResultVampireDto,
  ) {
    return this.gamesService.setResultVampire(id, dto);
  }

  @Put(':id/result/hunger-games')
  setResultHungerGames(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: SetResultHungerGamesDto,
  ) {
    return this.gamesService.setResultHungerGames(id, dto);
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.gamesService.delete(id);
  }
}
