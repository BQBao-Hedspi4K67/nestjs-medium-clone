import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateArticleDto, UpdateArticleDto } from './dto/article.dto';
import { CreateCommentDto } from './dto/comment.dto';
import { ListArticlesDto } from './dto/list-articles.dto';
import { ArticleResponse, DeleteArticleResponse, ListArticlesResponse } from './interfaces/article.interface';
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

  async createArticle(userId: number, dto: CreateArticleDto): Promise<any> {
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

  async getArticle(slug: string): Promise<any> {
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

  async updateArticle(slug: string, userId: number, dto: UpdateArticleDto): Promise<any> {
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

  async listArticles(query: ListArticlesDto): Promise<{ articles: any[], articlesCount: number }> {
    const where: any = {};

    if (query.tag) {
      where.tagList = {
        has: query.tag
      };
    }

    if (query.author) {
      where.author = {
        username: query.author
      };
    }

    // Note: We'll implement favorited filter in a future update when we add favorites functionality

    const [articles, total] = await Promise.all([
      this.prisma.article.findMany({
        where,
        include: {
          author: {
            select: {
              username: true,
              bio: true,
              image: true,
            },
          },
        },
        orderBy: {
          id: 'desc'
        },
        skip: query.offset,
        take: query.limit,
      }),
      this.prisma.article.count({ where })
    ]);

    return {
      articles: articles.map((article: any) => {
        const { authorId, ...articleData } = article;
        return articleData;
      }),
      articlesCount: total
    };
  }

  async getFeedArticles(userId: number, query: ListArticlesDto): Promise<{ articles: any[], articlesCount: number }> {
    const following = await this.prisma.$queryRaw`
      SELECT "followingId" 
      FROM "Follow" 
      WHERE "followerId" = ${userId}
    `;

    const followingIds = (following as any[]).map(f => f.followingId);

    if (followingIds.length === 0) {
      return { articles: [], articlesCount: 0 };
    }

    const where: any = {
      authorId: {
        in: followingIds
      }
    };

    const [articles, total] = await Promise.all([
      this.prisma.article.findMany({
        where,
        include: {
          author: {
            select: {
              username: true,
              bio: true,
              image: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip: query.offset,
        take: query.limit,
      }),
      this.prisma.article.count({ where })
    ]);

    return {
      articles: articles.map((article: any) => {
        const { authorId, ...articleData } = article;
        return articleData;
      }),
      articlesCount: total
    };
  }

  async favoriteArticle(slug: string, userId: number): Promise<ArticleResponse> {
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

    await this.prisma.$executeRaw`
      INSERT INTO "Favorite" ("userId", "articleId", "createdAt")
      VALUES (${userId}, ${article.id}, NOW())
      ON CONFLICT ("userId", "articleId") DO NOTHING
    `;

    const favoritesCount = await this.prisma.$queryRaw`
      SELECT COUNT(*) as count FROM "Favorite" WHERE "articleId" = ${article.id}
    `;

    const count = Number((favoritesCount as any)[0].count);
    const { authorId, ...articleData } = article;
    
    return {
      article: {
        ...articleData,
        favorited: true,
        favoritesCount: count,
      } as any,
    };
  }

  async unfavoriteArticle(slug: string, userId: number): Promise<ArticleResponse> {
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

    await this.prisma.$executeRaw`
      DELETE FROM "Favorite" 
      WHERE "userId" = ${userId} AND "articleId" = ${article.id}
    `;

    const favoritesCount = await this.prisma.$queryRaw`
      SELECT COUNT(*) as count FROM "Favorite" WHERE "articleId" = ${article.id}
    `;

    const count = Number((favoritesCount as any)[0].count);
    const { authorId, ...articleData } = article;
    
    return {
      article: {
        ...articleData,
        favorited: false,
        favoritesCount: count,
      } as any,
    };
  }
}
