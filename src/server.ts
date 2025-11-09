import express, { Express } from 'express';
import cors from 'cors';
import { createDummyJsonProductRepository } from '@infrastructure/external/dummyJsonProductRepository';
import { createProductRoutes } from '@presentation/api/routes/productRoutes';

/**
 * Expressアプリケーションを作成
 */
export const createApp = (): Express => {
  const app = express();

  // ミドルウェアの設定
  app.use(cors());
  app.use(express.json());

  // リポジトリの作成（依存性注入）
  const productRepository = createDummyJsonProductRepository();

  // ルーティングの設定
  app.use('/api', createProductRoutes(productRepository));

  // 404ハンドラー
  app.use((req, res) => {
    res.status(404).json({ error: 'Not Found' });
  });

  return app;
};
