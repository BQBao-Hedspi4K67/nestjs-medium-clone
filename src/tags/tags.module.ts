import { Module } from '@nestjs/common';
import { TagsController } from './tags.controller';
import { ArticlesModule } from '../articles/articles.module';

@Module({
  imports: [ArticlesModule],
  controllers: [TagsController],
})
export class TagsModule {}
