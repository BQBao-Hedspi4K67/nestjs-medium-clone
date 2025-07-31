import { Module } from '@nestjs/common';
import { ArticlesController } from './articles.controller';
import { ArticlesService } from './articles.service';
import { PrismaModule } from '../prisma/prisma.module';
import { CommentsController } from './comments.controller';

@Module({
  imports: [PrismaModule],
  controllers: [ArticlesController, CommentsController],
  providers: [ArticlesService],
  exports: [ArticlesService],
})
export class ArticlesModule {}
