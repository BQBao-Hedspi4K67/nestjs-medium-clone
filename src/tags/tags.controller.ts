import { Controller, Get } from '@nestjs/common';
import { TagsService } from './tags.service';
import { TagsResponse } from './interfaces/tags.interface';

@Controller('api/tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Get()
  async getTags(): Promise<TagsResponse> {
    return this.tagsService.getAllTags();
  }
}
