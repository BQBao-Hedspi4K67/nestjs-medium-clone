import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { ProfilesController } from './profiles.controller';
import { ProfilesService } from './profiles.service';
import { PrismaModule } from '../prisma/prisma.module';
import { OptionalJwtGuard } from '../auth/guards/optional-jwt.guard';

@Module({
  imports: [
    PrismaModule,
    JwtModule,
    ConfigModule,
  ],
  controllers: [ProfilesController],
  providers: [ProfilesService, OptionalJwtGuard],
  exports: [ProfilesService],
})
export class ProfilesModule {}
