import { Controller, Get } from '@nestjs/common';
import { ArticlesService } from '../articles/articles.service';

@Controller('api/tags')
export class TagsController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Get()
  async getTags(): Promise<{ tags: string[] }> {
    return this.articlesService.getTags();
  }
}
