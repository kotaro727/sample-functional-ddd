import { serve } from '@hono/node-server';
import { createApp } from './server';

const PORT = Number(process.env['PORT'] ?? 4000);
const app = createApp();

serve({ fetch: app.fetch, port: PORT });

console.log(`🚀 APIサーバーが起動しました: http://localhost:${PORT}`);
console.log(`📦 商品一覧: http://localhost:${PORT}/api/products`);
console.log(`📚 API ドキュメント: http://localhost:${PORT}/api-docs`);
