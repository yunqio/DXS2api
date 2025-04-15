import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import { chatRouter } from './routes/chat';
import { tokenRouter } from './routes/token';
import { modelsRouter } from './routes/models';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

// Apply middleware
app.use(cors());
app.use(bodyParser.json());

// Apply rate limiting
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: parseInt(process.env.RATE_LIMIT || '60'), // limit each IP to 60 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// 添加根路由，显示欢迎信息
app.get('/', (req, res) => {
  res.status(200).send(`
    <!DOCTYPE html>
    <html lang="zh-CN">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>DSX2API</title>
      <style>
        body {
          font-family: 'Arial', sans-serif;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          margin: 0;
          background-color: #f5f8fa;
        }
        .container {
          text-align: center;
          padding: 2rem;
          border-radius: 10px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          background-color: white;
          max-width: 600px;
        }
        h1 {
          color: #0066ff;
          margin-bottom: 1rem;
        }
        p {
          color: #333;
          font-size: 1.2rem;
          line-height: 1.6;
        }
        .emoji {
          font-size: 3rem;
          margin: 1rem 0;
        }
        .endpoints {
          margin-top: 2rem;
          text-align: left;
          background-color: #f8f9fa;
          padding: 1rem;
          border-radius: 5px;
        }
        .endpoint {
          margin: 0.5rem 0;
          font-family: monospace;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>DSX2API 运行成功！</h1>
        <div class="emoji">😄</div>
        <p>DeepSeek API代理服务已成功启动</p>
        <div class="endpoints">
          <p>可用端点:</p>
          <div class="endpoint">GET /v1/models - 获取模型列表</div>
          <div class="endpoint">POST /v1/chat/completions - 聊天补全API</div>
          <div class="endpoint">POST /token/check - 验证令牌</div>
          <div class="endpoint">GET /health - 健康检查</div>
        </div>
      </div>
    </body>
    </html>
  `);
});

// Routes
app.use('/v1/chat', chatRouter);
app.use('/token', tokenRouter);
app.use('/v1/models', modelsRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app; 