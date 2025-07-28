import { Body, Controller, Delete, Get, Param, Post, Put, Req, UseGuards, UnauthorizedException } from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateArticleDto, UpdateArticleDto } from './dto/article.dto';
import { ArticleResponse, DeleteArticleResponse } from './interfaces/article.interface';
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
  ): Promise<ArticleResponse> {
    if (!req.user) {
      throw new UnauthorizedException('User not authenticated');
    }
    return this.articlesService.createArticle(req.user.sub, createArticleDto);
  }

  @Get(':slug')
  async get(@Param('slug') slug: string): Promise<ArticleResponse> {
    return this.articlesService.getArticle(slug);
  }

  @Put(':slug')
  @UseGuards(AuthGuard('jwt'))
  async update(
    @Param('slug') slug: string,
    @Body('article') updateArticleDto: UpdateArticleDto,
    @Req() req: RequestWithUser,
  ): Promise<ArticleResponse> {
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
