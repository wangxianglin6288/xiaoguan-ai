import { Router, Request, Response } from 'express';
import { z } from 'zod';

export const analysisRouter = Router();

// 语音分析记录存储（后续换数据库）
const analyses: Array<{
  id: string;
  userId: string;
  text: string;
  duration: number;
  analysis: string;
  score: number;
  createdAt: Date;
}> = [];

// 提交语音或文字内容进行AI分析
analysisRouter.post('/submit', async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      userId: z.string(),
      text: z.string().min(1, '内容不能为空'),
      duration: z.number().optional().default(0),  // 语音时长（秒）
    });

    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        message: '参数有误',
        errors: result.error.issues,
      });
    }

    const { userId, text } = result.data;

    // 调用 DeepSeek 分析销售语音内容
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ message: 'AI 未配置' });
    }

    const analysisPrompt = `你是一位顶尖的销售教练，正在分析一段销售对话记录。

对话内容：
"""
${text}
"""

请从以下维度进行分析和评分（满分100分）：

1. **开场白**（0-20分）：是否有效破冰、建立信任
2. **需求挖掘**（0-20分）：是否深入了解客户需求
3. **产品呈现**（0-20分）：价值描述是否清晰有力
4. **异议处理**（0-20分）：是否有技巧地化解客户顾虑
5. **成交技巧**（0-20分）：是否把握时机推动成交

请按以下格式输出：

---
### 📊 综合评分：X/100

### 各维度得分
- 开场白：X/20
- 需求挖掘：X/20
- 产品呈现：X/20
- 异议处理：X/20
- 成交技巧：X/20

### 💪 亮点
- ...

### 🔧 改进建议
- ...

### 📝 一句话总结
...

---
注意：如果对话内容较短或不完整，请如实说明并给出初步建议。`;

    const aiRes = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: '你是一位专业的销售教练，擅长分析销售对话并提供改进建议。' },
          { role: 'user', content: analysisPrompt },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!aiRes.ok) {
      return res.status(500).json({ message: `AI分析失败: ${aiRes.status}` });
    }

    const aiData = await aiRes.json();
    const analysis = aiData.choices[0].message.content;

    // 提取评分
    const scoreMatch = analysis.match(/(\d+)\/100/);
    const score = scoreMatch ? parseInt(scoreMatch[1]) : 0;

    const record = {
      id: `analysis_${Date.now()}`,
      userId,
      text,
      duration: result.data.duration || 0,
      analysis,
      score,
      createdAt: new Date(),
    };
    analyses.push(record);

    res.json({
      analysisId: record.id,
      score,
      analysis,
      createdAt: record.createdAt,
    });
  } catch (err: any) {
    res.status(500).json({ message: `分析出错: ${err.message}` });
  }
});

// 获取分析历史
analysisRouter.get('/history/:userId', (req: Request, res: Response) => {
  const userAnalyses = analyses
    .filter(a => a.userId === req.params.userId)
    .slice(-50);
  res.json({ analyses: userAnalyses });
});

// 获取单个分析详情
analysisRouter.get('/:id', (req: Request, res: Response) => {
  const record = analyses.find(a => a.id === req.params.id);
  if (!record) {
    return res.status(404).json({ message: '分析记录不存在' });
  }
  res.json(record);
});
