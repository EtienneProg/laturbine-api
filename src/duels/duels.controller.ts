import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { DuelsService } from './duels.service';
import { CreateDuelDto } from './dto/create-duel.dto';
import { SetResultDto } from './dto/set-result.dto';
import { JwtGuard } from '../auth/jwt.guard';

@UseGuards(JwtGuard)
@Controller('duels')
export class DuelsController {
  constructor(private duelsService: DuelsService) {}

  @Get()
  findAll() {
    return this.duelsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.duelsService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateDuelDto) {
    return this.duelsService.create(dto);
  }

  @Put(':id/result')
  setResult(@Param('id', ParseIntPipe) id: number, @Body() dto: SetResultDto) {
    return this.duelsService.setResult(id, dto);
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.duelsService.delete(id);
  }
}
