import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yaml';
import { readFileSync } from 'fs';
import { join } from 'path';
import * as OpenApiValidator from 'express-openapi-validator';
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

  // OpenAPI ドキュメント（Swagger UI）の設定
  const openapiPath = join(process.cwd(), 'openapi', 'openapi.yaml');
  const openapiDocument = YAML.parse(readFileSync(openapiPath, 'utf8'));
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapiDocument));

  // OpenAPI バリデーションの設定
  app.use(
    OpenApiValidator.middleware({
      apiSpec: openapiPath,
      validateRequests: true, // リクエストのバリデーション
      validateResponses: true, // レスポンスのバリデーション
    })
  );

  // リポジトリの作成（依存性注入）
  const productRepository = createDummyJsonProductRepository();

  // ルーティングの設定
  app.use('/api', createProductRoutes(productRepository));

  // OpenAPI バリデーションエラーハンドラー
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    if (err.status) {
      res.status(err.status).json({
        error: {
          type: 'VALIDATION_ERROR',
          message: err.message,
          errors: err.errors,
        },
      });
    } else {
      next(err);
    }
  });

  // 404ハンドラー
  app.use((req, res) => {
    res.status(404).json({ error: 'Not Found' });
  });

  return app;
};
