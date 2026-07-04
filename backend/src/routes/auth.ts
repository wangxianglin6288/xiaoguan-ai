import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

export const authRouter = Router();

// 模拟用户数据（后续接入 Supabase）
const users = new Map<string, { id: string; name: string; password: string; role: string }>();

// 初始化一个管理员账号
users.set('admin', {
  id: '1',
  name: '管理员',
  password: 'admin888',
  role: 'admin',
});

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

// 登录
authRouter.post('/login', (req: Request, res: Response) => {
  const schema = z.object({
    username: z.string().min(1),
    password: z.string().min(1),
  });

  const result = schema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ message: '请输入用户名和密码' });
  }

  const { username, password } = result.data;
  const user = users.get(username);

  if (!user || user.password !== password) {
    return res.status(401).json({ message: '用户名或密码错误' });
  }

  const token = jwt.sign(
    { id: user.id, name: user.name, role: user.role },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  res.json({
    token,
    user: { id: user.id, name: user.name, role: user.role },
  });
});

// 注册新用户（销售人员）
authRouter.post('/register', (req: Request, res: Response) => {
  const schema = z.object({
    name: z.string().min(1).max(50),
    username: z.string().min(3).max(20),
    password: z.string().min(6),
  });

  const result = schema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ message: '参数有误', errors: result.error.issues });
  }

  const { username, name, password } = result.data;

  if (users.has(username)) {
    return res.status(409).json({ message: '用户名已存在' });
  }

  const id = String(users.size + 1);
  users.set(username, { id, name, password, role: 'sales' });

  res.json({ message: '注册成功', user: { id, name, role: 'sales' } });
});
