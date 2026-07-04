import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { chatWithCoach } from '../services/deepseek';

export const trainingRouter = Router();

// 训练会话管理（内存存储，后续换数据库）
const sessions = new Map<string, {
  userId: string;
  config: { industry: string; scenario: string; difficulty: string };
  messages: Array<{ role: string; content: string }>;
  createdAt: Date;
}>();

// 开始新训练
trainingRouter.post('/start', (req: Request, res: Response) => {
  const schema = z.object({
    userId: z.string(),
    industry: z.string().default('通用销售'),
    scenario: z.string().default('初次接触客户'),
    difficulty: z.enum(['beginner', 'intermediate', 'advanced']).default('beginner'),
  });

  const result = schema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ message: '参数有误', errors: result.error.issues });
  }

  const { userId, industry, scenario, difficulty } = result.data;
  const sessionId = `session_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  sessions.set(sessionId, {
    userId,
    config: { industry, scenario, difficulty },
    messages: [],
    createdAt: new Date(),
  });

  res.json({
    sessionId,
    message: `开始${difficulty === 'beginner' ? '初级' : difficulty === 'intermediate' ? '中级' : '高级'}训练：${scenario}`,
    config: { industry, scenario, difficulty },
  });
});

// 发送消息（学员对话）
trainingRouter.post('/chat', async (req: Request, res: Response) => {
  const schema = z.object({
    sessionId: z.string(),
    message: z.string().min(1),
  });

  const result = schema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ message: '请发送消息内容' });
  }

  const { sessionId, message } = result.data;
  const session = sessions.get(sessionId);

  if (!session) {
    return res.status(404).json({ message: '训练会话不存在或已过期' });
  }

  // 记录学员消息
  session.messages.push({ role: 'user', content: message });

  try {
    const coachMessages = session.messages.map(m => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }));

    const reply = await chatWithCoach(coachMessages, {
      industry: session.config.industry,
      scenario: session.config.scenario,
      difficulty: session.config.difficulty as any,
    });

    // 记录AI回复
    session.messages.push({ role: 'assistant', content: reply });

    res.json({ reply, history: session.messages });
  } catch (err: any) {
    res.status(500).json({ message: `AI教练出错了: ${err.message}` });
  }
});

// 获取训练历史
trainingRouter.get('/history/:sessionId', (req: Request, res: Response) => {
  const session = sessions.get(req.params.sessionId);
  if (!session) {
    return res.status(404).json({ message: '会话不存在' });
  }
  res.json({ messages: session.messages, config: session.config });
});
