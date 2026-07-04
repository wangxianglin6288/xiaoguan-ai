/**
 * DeepSeek API 调用服务
 * 用于销冠AI教练与销售人员对话训练
 */

const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface CoachConfig {
  industry: string;
  scenario: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export async function chatWithCoach(
  messages: ChatMessage[],
  config: CoachConfig
): Promise<string> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    throw new Error('DEEPSEEK_API_KEY 未配置');
  }

  const systemPrompt = buildSystemPrompt(config);

  const response = await fetch(DEEPSEEK_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
      temperature: 0.8,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    throw new Error(`DeepSeek API 错误: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

function buildSystemPrompt(config: CoachConfig): string {
  const scenarios: Record<string, string> = {
    beginner: '你是一位经验丰富的销售教练。学员是销售新人，需要基础的话术训练。每次对话要给具体的指导和反馈。',
    intermediate: '你是一位资深的销售冠军教练。学员有一定经验，重点训练异议处理和成交技巧。',
    advanced: '你是一位顶尖的销售策略顾问。学员是资深销售，训练复杂谈判和高阶销售策略。',
  };

  return `你是销冠AI教练，专注于销售训练。
行业: ${config.industry}
场景: ${config.scenario}
风格: ${scenarios[config.difficulty] || scenarios.beginner}

规则：
1. 模拟真实客户与学员对话，让学员练习销售技巧
2. 每次学员回答后，先点评再继续扮演客户
3. 指出学员话术的优缺点，给出改进建议
4. 当学员表现好时给予鼓励，表现不佳时耐心引导
5. 用实战化的语言，贴近真实销售场景`;
}
