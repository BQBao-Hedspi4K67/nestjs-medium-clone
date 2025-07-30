export interface Author {
  username: string;
  bio: string | null;
  image: string | null;
}

export interface Article {
  id: number;
  slug: string;
  title: string;
  description: string;
  body: string;
  tagList: string[];
  createdAt: Date;
  updatedAt: Date;
  author: Author;
}

export interface ArticleResponse {
  article: Article;
}

export interface ListArticlesResponse {
  articles: Article[];
  articlesCount: number;
}

export interface DeleteArticleResponse {
  message: string;
}