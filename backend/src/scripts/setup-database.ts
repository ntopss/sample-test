import dotenv from 'dotenv';
import { initializeDatabase } from '../db/database';
import { QuestionModel } from '../models/question';

dotenv.config();

console.log('Setting up database...');

// Initialize database tables
initializeDatabase();

// Add some default questions
const defaultQuestions = [
  // 직무경험
  {
    category: '직무경험',
    content: '디지털 마케팅 캠페인을 직접 기획하고 실행한 경험이 있나요?',
    position: '마케팅'
  },
  {
    category: '직무경험',
    content: '예산 관리 및 성과 측정 경험에 대해 설명해주세요.',
    position: '마케팅'
  },
  {
    category: '직무경험',
    content: '크로스팀 협업 프로젝트 경험이 있다면 공유해주세요.',
    position: '마케팅'
  },
  {
    category: '직무경험',
    content: '데이터 기반으로 의사결정을 내린 사례가 있나요?',
    position: '마케팅'
  },

  // 일반역량
  {
    category: '일반역량',
    content: '팀 내 갈등을 해결했던 경험을 공유해주세요.',
    position: null
  },
  {
    category: '일반역량',
    content: '업무 중 어려운 문제를 해결한 경험이 있다면 말씀해주세요.',
    position: null
  },
  {
    category: '일반역량',
    content: '실패를 경험하고 배운 점이 있다면 무엇인가요?',
    position: null
  }
];

for (const question of defaultQuestions) {
  QuestionModel.create(question);
}

console.log('Database setup completed!');
console.log(`Added ${defaultQuestions.length} default questions`);
