import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { authRouter } from './routes/auth';
import { trainingRouter } from './routes/training';
import { analysisRouter } from './routes/analysis';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 路由
app.use('/api/auth', authRouter);
app.use('/api/training', trainingRouter);
app.use('/api/analysis', analysisRouter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: '销冠AI 后端服务运行中 🦐' });
});

app.listen(PORT, () => {
  console.log(`🚀 销冠AI 后端启动: http://localhost:${PORT}`);
});
