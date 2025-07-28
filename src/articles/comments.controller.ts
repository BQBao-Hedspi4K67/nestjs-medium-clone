import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ArticlesService } from './articles.service';
import { CreateCommentDto } from './dto/comment.dto';
import { CommentResponse, CommentsResponse } from './interfaces/comment.interface';
import { GetUser } from './common/decorators/get-user.decorator';

interface JwtPayload {
  sub: number;
  email: string;
}

@Controller('api/articles/:slug/comments')
export class CommentsController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  async createComment(
    @Param('slug') slug: string,
    @Body('comment') createCommentDto: CreateCommentDto,
    @GetUser() user: JwtPayload,
  ): Promise<CommentResponse> {
    return this.articlesService.createComment(slug, user.sub, createCommentDto);
  }

  @Get()
  async getComments(
    @Param('slug') slug: string,
  ): Promise<CommentsResponse> {
    return this.articlesService.getComments(slug);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  async deleteComment(
    @Param('slug') slug: string,
    @Param('id') id: string,
    @GetUser() user: JwtPayload,
  ): Promise<{ message: string }> {
    return this.articlesService.deleteComment(slug, +id, user.sub);
  }
}
