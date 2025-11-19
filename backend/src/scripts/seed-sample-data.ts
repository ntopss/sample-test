import dotenv from 'dotenv';
import { initializeDatabase } from '../db/database';
import { CandidateModel } from '../models/candidate';
import { InterviewModel } from '../models/interview';
import { QuestionModel } from '../models/question';
import { EvaluationModel } from '../models/evaluation';
import { FeedbackModel } from '../models/feedback';

dotenv.config();

console.log('🌱 샘플 데이터 생성 중...');

// Initialize database
initializeDatabase();

// 1. Create sample candidates
console.log('\n👤 지원자 생성 중...');
const candidates = [
  {
    name: '홍길동',
    position: '마케팅',
    experience_years: 5.2,
    education: 'OO대학교 경영학과',
    resume_url: 'https://example.com/resume/hong.pdf'
  },
  {
    name: '김영희',
    position: '개발자',
    experience_years: 3.5,
    education: 'XX대학교 컴퓨터공학과',
    resume_url: 'https://example.com/resume/kim.pdf'
  },
  {
    name: '이철수',
    position: 'UI/UX 디자이너',
    experience_years: 4.0,
    education: '△△대학교 디자인학과',
    resume_url: 'https://example.com/resume/lee.pdf'
  },
  {
    name: '박민수',
    position: '데이터 분석가',
    experience_years: 2.8,
    education: '□□대학교 통계학과',
    resume_url: 'https://example.com/resume/park.pdf'
  },
  {
    name: '최지은',
    position: '마케팅',
    experience_years: 6.5,
    education: '◇◇대학교 광고홍보학과',
    resume_url: 'https://example.com/resume/choi.pdf'
  }
];

const createdCandidates = candidates.map(c => CandidateModel.create(c));
console.log(`✅ ${createdCandidates.length}명의 지원자 생성 완료`);

// 2. Create sample questions
console.log('\n❓ 질문 생성 중...');
const questions = [
  // 마케팅 직무경험
  {
    category: '직무경험',
    content: '가장 성공적이었던 마케팅 캠페인에 대해 설명해주세요. 목표, 전략, 결과를 포함해주세요.',
    position: '마케팅'
  },
  {
    category: '직무경험',
    content: '제한된 예산으로 효과적인 마케팅을 진행한 경험이 있나요?',
    position: '마케팅'
  },
  {
    category: '직무경험',
    content: 'SNS 마케팅 경험과 성과 지표(KPI)는 어떻게 측정하셨나요?',
    position: '마케팅'
  },

  // 개발자 직무경험
  {
    category: '직무경험',
    content: '가장 도전적이었던 프로젝트와 그것을 어떻게 해결했는지 설명해주세요.',
    position: '개발자'
  },
  {
    category: '직무경험',
    content: '코드 리뷰 경험과 팀 내 코드 품질 관리 방법에 대해 말씀해주세요.',
    position: '개발자'
  },
  {
    category: '직무경험',
    content: '성능 최적화를 위해 노력했던 경험이 있나요?',
    position: '개발자'
  },

  // 디자이너 직무경험
  {
    category: '직무경험',
    content: '사용자 조사(User Research)를 진행하고 디자인에 반영한 경험을 공유해주세요.',
    position: 'UI/UX 디자이너'
  },
  {
    category: '직무경험',
    content: '개발자와 협업하면서 어려웠던 점과 해결 방법은?',
    position: 'UI/UX 디자이너'
  },

  // 데이터 분석가 직무경험
  {
    category: '직무경험',
    content: '데이터 분석을 통해 비즈니스 의사결정에 기여한 사례를 말씀해주세요.',
    position: '데이터 분석가'
  },
  {
    category: '직무경험',
    content: '주로 사용하는 분석 도구와 방법론은 무엇인가요?',
    position: '데이터 분석가'
  },

  // 이력서기반 질문
  {
    category: '이력서기반',
    content: '이전 회사에서 가장 큰 성과는 무엇이었나요?',
    position: null
  },
  {
    category: '이력서기반',
    content: '현재 회사를 떠나려는 이유는 무엇인가요?',
    position: null
  },
  {
    category: '이력서기반',
    content: '경력 공백이 있는데, 그 기간 동안 무엇을 하셨나요?',
    position: null
  },

  // 일반역량 질문
  {
    category: '일반역량',
    content: '업무 우선순위를 어떻게 정하시나요?',
    position: null
  },
  {
    category: '일반역량',
    content: '스트레스나 압박이 심한 상황에서 어떻게 대처하시나요?',
    position: null
  },
  {
    category: '일반역량',
    content: '의견 충돌이 있을 때 어떻게 해결하시나요?',
    position: null
  },
  {
    category: '일반역량',
    content: '새로운 기술이나 지식을 습득하는 본인만의 방법이 있나요?',
    position: null
  },
  {
    category: '일반역량',
    content: '5년 후 커리어 목표는 무엇인가요?',
    position: null
  }
];

const createdQuestions = questions.map(q => QuestionModel.create(q));
console.log(`✅ ${createdQuestions.length}개의 질문 생성 완료`);

// 3. Create sample interviews
console.log('\n📅 면접 일정 생성 중...');
const now = new Date();

const interviews = [
  {
    candidate_id: createdCandidates[0].id!, // 홍길동
    interviewer_name: '김팀장',
    interviewer_email: 'kim.manager@company.com',
    scheduled_date: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2일 후
    status: 'scheduled'
  },
  {
    candidate_id: createdCandidates[1].id!, // 김영희
    interviewer_name: '박실장',
    interviewer_email: 'park.director@company.com',
    scheduled_date: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5일 후
    status: 'scheduled'
  },
  {
    candidate_id: createdCandidates[2].id!, // 이철수
    interviewer_name: '최부장',
    interviewer_email: 'choi.head@company.com',
    scheduled_date: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3일 전 (완료)
    status: 'completed'
  },
  {
    candidate_id: createdCandidates[3].id!, // 박민수
    interviewer_name: '정과장',
    interviewer_email: 'jung.manager@company.com',
    scheduled_date: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7일 후
    status: 'scheduled'
  },
  {
    candidate_id: createdCandidates[4].id!, // 최지은
    interviewer_name: '김팀장',
    interviewer_email: 'kim.manager@company.com',
    scheduled_date: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1일 전 (완료)
    status: 'completed'
  }
];

const createdInterviews = interviews.map(i => InterviewModel.create(i));
console.log(`✅ ${createdInterviews.length}개의 면접 일정 생성 완료`);

// 4. Select questions for upcoming interviews
console.log('\n🎯 면접 질문 선택 중...');
let selectedCount = 0;

// 홍길동 면접 - 마케팅 질문 선택
const marketingQuestions = createdQuestions.filter(q =>
  q.category === '직무경험' && q.position === '마케팅'
);
const generalQuestions = createdQuestions.filter(q =>
  q.category === '일반역량'
);

marketingQuestions.slice(0, 3).forEach(q => {
  QuestionModel.selectQuestionForInterview(createdInterviews[0].id!, q.id!);
  selectedCount++;
});
generalQuestions.slice(0, 2).forEach(q => {
  QuestionModel.selectQuestionForInterview(createdInterviews[0].id!, q.id!);
  selectedCount++;
});

// 김영희 면접 - 개발자 질문 선택
const devQuestions = createdQuestions.filter(q =>
  q.category === '직무경험' && q.position === '개발자'
);
devQuestions.forEach(q => {
  QuestionModel.selectQuestionForInterview(createdInterviews[1].id!, q.id!);
  selectedCount++;
});
generalQuestions.slice(0, 2).forEach(q => {
  QuestionModel.selectQuestionForInterview(createdInterviews[1].id!, q.id!);
  selectedCount++;
});

console.log(`✅ ${selectedCount}개의 질문 선택 완료`);

// 5. Create evaluations for completed interviews
console.log('\n⭐ 평가 데이터 생성 중...');
const evaluations = [
  {
    interview_id: createdInterviews[2].id!, // 이철수
    job_fit_score: 4,
    experience_verification_score: 5,
    communication_score: 4,
    culture_fit_score: 3,
    notes: '실무 경험이 풍부하고 포트폴리오가 우수함. 다만 리더십 경험은 부족해 보임. 디자인 시스템 구축 경험이 있어 우리 팀에 도움이 될 것으로 예상됨.',
    recommendation: '추천'
  },
  {
    interview_id: createdInterviews[4].id!, // 최지은
    job_fit_score: 5,
    experience_verification_score: 5,
    communication_score: 5,
    culture_fit_score: 4,
    notes: '마케팅 전략 수립 및 실행 능력이 뛰어남. ROI 개선 사례가 인상적. 데이터 기반 의사결정 능력 우수. 팀 리더 경험도 충분함.',
    recommendation: '적극추천'
  }
];

evaluations.forEach(e => EvaluationModel.createOrUpdate(e));
console.log(`✅ ${evaluations.length}개의 평가 생성 완료`);

// 6. Create feedback surveys for completed interviews
console.log('\n📝 피드백 설문 데이터 생성 중...');
const feedbacks = [
  {
    interview_id: createdInterviews[2].id!, // 이철수
    interviewer_attitude_score: 5,
    question_relevance_score: 4,
    company_impression_score: 4,
    improvement_feedback: '면접 분위기가 좋았고, 질문들이 실무와 관련이 깊어서 좋았습니다. 다만 회사 소개 시간이 조금 더 있었으면 좋겠습니다.'
  },
  {
    interview_id: createdInterviews[4].id!, // 최지은
    interviewer_attitude_score: 5,
    question_relevance_score: 5,
    company_impression_score: 5,
    improvement_feedback: '매우 만족스러운 면접이었습니다. 면접관분께서 제 경험을 잘 이끌어주셨고, 회사 문화에 대해서도 충분히 이해할 수 있었습니다.'
  }
];

feedbacks.forEach(f => FeedbackModel.create(f));
console.log(`✅ ${feedbacks.length}개의 피드백 생성 완료`);

console.log('\n✨ 샘플 데이터 생성 완료!\n');
console.log('📊 생성된 데이터 요약:');
console.log(`  - 지원자: ${createdCandidates.length}명`);
console.log(`  - 면접: ${createdInterviews.length}개 (진행 예정: 3, 완료: 2)`);
console.log(`  - 질문: ${createdQuestions.length}개`);
console.log(`  - 평가: ${evaluations.length}개`);
console.log(`  - 피드백: ${feedbacks.length}개`);
console.log('\n🚀 이제 웹 애플리케이션에서 샘플 데이터를 확인할 수 있습니다!');
