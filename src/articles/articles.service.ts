import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateArticleDto, UpdateArticleDto } from './dto/article.dto';
import { CreateCommentDto } from './dto/comment.dto';
import { ArticleResponse, DeleteArticleResponse } from './interfaces/article.interface';
import { CommentResponse, CommentsResponse } from './interfaces/comment.interface';

@Injectable()
export class ArticlesService {
  constructor(private prisma: PrismaService) {}

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-zA-Z0-9 ]/g, '')
      .replace(/\s+/g, '-');
  }

  async createArticle(userId: number, dto: CreateArticleDto): Promise<ArticleResponse> {
    const slug = this.generateSlug(dto.title);

    const article = await this.prisma.article.create({
      data: {
        ...dto,
        slug,
        authorId: userId,
      },
      include: {
        author: {
          select: {
            username: true,
            bio: true,
            image: true,
          },
        },
      },
    });

    return { article };
  }

  async getArticle(slug: string): Promise<ArticleResponse> {
    const article = await this.prisma.article.findUnique({
      where: { slug },
      include: {
        author: {
          select: {
            username: true,
            bio: true,
            image: true,
          },
        },
      },
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    return { article };
  }

  async updateArticle(slug: string, userId: number, dto: UpdateArticleDto): Promise<ArticleResponse> {
    const article = await this.prisma.article.findUnique({
      where: { slug },
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    if (article.authorId !== userId) {
      throw new UnauthorizedException('Not authorized to update this article');
    }

    const updatedArticle = await this.prisma.article.update({
      where: { slug },
      data: {
        ...dto,
        ...(dto.title && { slug: this.generateSlug(dto.title) }),
      },
      include: {
        author: {
          select: {
            username: true,
            bio: true,
            image: true,
          },
        },
      },
    });

    return { article: updatedArticle };
  }

  async deleteArticle(slug: string, userId: number): Promise<DeleteArticleResponse> {
    const article = await this.prisma.article.findUnique({
      where: { slug },
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    if (article.authorId !== userId) {
      throw new UnauthorizedException('Not authorized to delete this article');
    }

    await this.prisma.article.delete({
      where: { slug },
    });

    return { message: 'Article deleted successfully' };
  }

  async createComment(
    slug: string,
    userId: number,
    dto: CreateCommentDto,
  ): Promise<CommentResponse> {
    const article = await this.prisma.article.findUnique({
      where: { slug },
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    const comment = await this.prisma.comment.create({
      data: {
        body: dto.body,
        article: { connect: { id: article.id } },
        author: { connect: { id: userId } },
      },
      include: {
        author: {
          select: {
            username: true,
            bio: true,
            image: true,
          },
        },
      },
    });

    return {
      comment: {
        id: comment.id,
        body: comment.body,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
        author: comment.author
      }
    };
  }

  async getComments(slug: string): Promise<CommentsResponse> {
    const article = await this.prisma.article.findUnique({
      where: { slug },
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    const comments = await this.prisma.comment.findMany({
      where: { articleId: article.id },
      include: {
        author: {
          select: {
            username: true,
            bio: true,
            image: true,
          },
        },
      },
      orderBy: [{
        createdAt: 'desc'
      }],
    });

    return {
      comments: comments.map(comment => ({
        id: comment.id,
        body: comment.body,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
        author: comment.author
      }))
    };
  }

  async deleteComment(
    slug: string,
    commentId: number,
    userId: number,
  ): Promise<{ message: string }> {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.authorId !== userId) {
      throw new UnauthorizedException('Not authorized to delete this comment');
    }

    await this.prisma.comment.delete({
      where: { id: commentId },
    });

    return { message: 'Comment deleted successfully' };
  }
}
