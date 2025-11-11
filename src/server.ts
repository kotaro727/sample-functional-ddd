import { readFileSync } from 'fs';
import { join } from 'path';
import YAML from 'yaml';
import { OpenAPIHono } from '@hono/zod-openapi';
import { swaggerUI } from '@hono/swagger-ui';
import { cors } from 'hono/cors';
import { ZodError } from 'zod';
import { createDummyJsonProductRepository } from '@infrastructure/external/dummyJsonProductRepository';
import { createProductRoutes } from '@presentation/api/routes/productRoutes';
import { createOrderRoutes } from '@presentation/api/routes/orderRoutes';
import { ProductRepository } from '@application/ports/productRepository';
import { OrderRepository } from '@application/ports/orderRepository';
import { createInMemoryOrderRepository } from '@infrastructure/memory/inMemoryOrderRepository';

type CreateAppOptions = {
  productRepository?: ProductRepository;
  orderRepository?: OrderRepository;
};

/**
 * Honoアプリケーションを作成
 */
export const createApp = (options: CreateAppOptions = {}) => {
  const openapiPath = join(process.cwd(), 'openapi', 'openapi.yaml');
  const openapiDocument = YAML.parse(readFileSync(openapiPath, 'utf8'));

  const app = new OpenAPIHono({
    defaultHook: (result, c) => {
      if (!result.success) {
        return c.json(
          {
            error: {
              type: 'VALIDATION_ERROR',
              message: 'リクエストがスキーマに一致しません',
              issues: result.error.issues,
            },
          },
          400
        );
      }
    },
  });

  app.use('*', cors());

  // ルートパス
  app.get('/', (c) => {
    return c.json({
      message: 'Sample Functional DDD API',
      version: '1.0.0',
      endpoints: {
        products: '/api/products',
        orders: '/api/orders',
        docs: '/api-docs',
        openapi: '/doc',
      },
    });
  });

  const productRepository = options.productRepository ?? createDummyJsonProductRepository();
  const orderRepository = options.orderRepository ?? createInMemoryOrderRepository();

  app.route('/api', createProductRoutes(productRepository));
  app.route('/api', createOrderRoutes(orderRepository));

  app.doc('/doc', {
    openapi: openapiDocument.openapi ?? '3.0.3',
    info: openapiDocument.info,
    servers: openapiDocument.servers,
    tags: openapiDocument.tags,
  });
  app.get('/api-docs', swaggerUI({ url: '/doc' }));

  app.notFound((c) => c.json({ error: 'Not Found' }, 404));

  app.onError((err, c) => {
    if (err instanceof ZodError) {
      return c.json(
        {
          error: {
            type: 'VALIDATION_ERROR',
            message: '入力値が不正です',
            issues: err.issues,
          },
        },
        400
      );
    }

    console.error(err);
    return c.json(
      {
        error: {
          type: 'INTERNAL_SERVER_ERROR',
          message: '予期しないエラーが発生しました',
        },
      },
      500
    );
  });

  return app;
};
