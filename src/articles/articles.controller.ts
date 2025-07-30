import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, UseGuards, UnauthorizedException } from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateArticleDto, UpdateArticleDto } from './dto/article.dto';
import { ListArticlesDto } from './dto/list-articles.dto';
import { ArticleResponse, DeleteArticleResponse, ListArticlesResponse } from './interfaces/article.interface';
import { Request } from 'express';
import { CreateCommentDto } from './dto/comment.dto';
import { CommentResponse, CommentsResponse } from './interfaces/comment.interface';
import { GetUser } from './common/decorators/get-user.decorator';

interface JwtPayload {
  sub: number;
  email: string;
}

interface RequestWithUser extends Request {
  user?: JwtPayload;
}

@Controller('api/articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  async create(
    @Body('article') createArticleDto: CreateArticleDto,
    @Req() req: RequestWithUser,
  ): Promise<any> {
    if (!req.user) {
      throw new UnauthorizedException('User not authenticated');
    }
    return this.articlesService.createArticle(req.user.sub, createArticleDto);
  }

  @Get('feed')
  @UseGuards(AuthGuard('jwt'))
  async getFeed(
    @Query() query: ListArticlesDto,
    @GetUser() user: JwtPayload,
  ): Promise<{ articles: any[], articlesCount: number }> {
    return this.articlesService.getFeedArticles(user.sub, query);
  }

  @Get()
  async list(@Query() query: ListArticlesDto): Promise<{ articles: any[], articlesCount: number }> {
    return this.articlesService.listArticles(query);
  }

  @Get(':slug')
  async get(@Param('slug') slug: string): Promise<any> {
    return this.articlesService.getArticle(slug);
  }

  @Put(':slug')
  @UseGuards(AuthGuard('jwt'))
  async update(
    @Param('slug') slug: string,
    @Body('article') updateArticleDto: UpdateArticleDto,
    @Req() req: RequestWithUser,
  ): Promise<any> {
    if (!req.user) {
      throw new UnauthorizedException('User not authenticated');
    }
    return this.articlesService.updateArticle(slug, req.user.sub, updateArticleDto);
  }

  @Delete(':slug')
  @UseGuards(AuthGuard('jwt'))
  async delete(
    @Param('slug') slug: string,
    @Req() req: RequestWithUser,
  ): Promise<DeleteArticleResponse> {
    if (!req.user) {
      throw new UnauthorizedException('User not authenticated');
    }
    return this.articlesService.deleteArticle(slug, req.user.sub);
  }
}
