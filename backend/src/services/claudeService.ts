import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || ''
});

interface GenerateQuestionsParams {
  position: string;
  candidateName?: string;
  resumeText?: string;
}

interface GeneratedQuestion {
  category: string;
  content: string;
  position: string;
}

export const claudeService = {
  async generateInterviewQuestions(params: GenerateQuestionsParams): Promise<GeneratedQuestion[]> {
    const { position, candidateName = '지원자', resumeText = '' } = params;

    const prompt = `당신은 전문 면접관입니다. 다음 정보를 바탕으로 면접 질문을 생성해주세요.

직무: ${position}
지원자: ${candidateName}
${resumeText ? `이력서 정보:\n${resumeText}` : ''}

다음 세 가지 카테고리로 각각 3-4개씩 질문을 생성해주세요:

1. 직무경험 (직무와 관련된 실무 경험 탐색 질문)
2. 이력서기반 (제공된 이력서 정보를 바탕으로 한 구체적 질문)
3. 일반역량 (문제 해결, 커뮤니케이션, 협업 등)

응답 형식은 반드시 다음 JSON 배열 형태로 작성해주세요:
[
  {
    "category": "직무경험",
    "content": "질문 내용",
    "position": "${position}"
  },
  ...
]`;

    try {
      const message = await client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2000,
        messages: [{
          role: 'user',
          content: prompt
        }]
      });

      const responseText = message.content[0].type === 'text' ? message.content[0].text : '';

      // Extract JSON from response
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('Failed to parse Claude response');
      }

      const questions: GeneratedQuestion[] = JSON.parse(jsonMatch[0]);
      return questions;
    } catch (error) {
      console.error('Error generating questions with Claude:', error);

      // Return default questions if Claude API fails
      return this.getDefaultQuestions(position);
    }
  },

  getDefaultQuestions(position: string): GeneratedQuestion[] {
    return [
      {
        category: '직무경험',
        content: `${position} 직무에서 가장 성공적이었던 프로젝트는 무엇이었나요?`,
        position
      },
      {
        category: '직무경험',
        content: '업무 중 어려운 문제를 해결한 경험이 있다면 말씀해주세요.',
        position
      },
      {
        category: '직무경험',
        content: '데이터 기반으로 의사결정을 내린 사례가 있나요?',
        position
      },
      {
        category: '이력서기반',
        content: '이전 회사에서의 주요 성과에 대해 설명해주세요.',
        position
      },
      {
        category: '이력서기반',
        content: '이직을 결심하게 된 이유는 무엇인가요?',
        position
      },
      {
        category: '일반역량',
        content: '팀 내 갈등을 해결했던 경험을 공유해주세요.',
        position
      },
      {
        category: '일반역량',
        content: '실패를 경험하고 배운 점이 있다면 무엇인가요?',
        position
      },
      {
        category: '일반역량',
        content: '크로스팀 협업 경험과 그 과정에서의 역할을 설명해주세요.',
        position
      }
    ];
  }
};
