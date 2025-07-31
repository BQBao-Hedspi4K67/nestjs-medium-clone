import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TagsResponse } from './interfaces/tags.interface';

@Injectable()
export class TagsService {
  constructor(private prisma: PrismaService) {}

  async getAllTags(): Promise<TagsResponse> {
    const articles = await this.prisma.article.findMany({
      select: {
        tagList: true,
      },
    });

    const allTags = articles.flatMap(article => article.tagList);
    const uniqueTags = [...new Set(allTags)].sort();

    return { tags: uniqueTags };
  }
}
