import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // Disponible dans tous les modules sans réimporter
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
