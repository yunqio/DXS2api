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