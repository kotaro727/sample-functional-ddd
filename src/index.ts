import { createApp } from './server';

const PORT = process.env.PORT || 4000;

const app = createApp();

app.listen(PORT, () => {
  console.log(`🚀 APIサーバーが起動しました: http://localhost:${PORT}`);
  console.log(`📦 商品一覧: http://localhost:${PORT}/api/products`);
});
