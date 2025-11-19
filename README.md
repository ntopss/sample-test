# 면접 자동화 시스템 (Interview Automation System)

태블릿 최적화된 면접 자동화 시스템입니다.

## 주요 기능

### 1. 면접 전 (D-1)
- 면접관에게 요약 메일 자동 발송
- 이력서 보기 링크
- 면접 질문 사전 선택 UI

### 2. 면접 당일
- 태블릿 최적화 면접 진행 화면
- 사전 선택한 질문 표시
- Claude AI 기반 직무 경험 탐색 질문 제안
- 시간 리마인드 기능
- 면접관 평가 시트 입력 & 저장

### 3. 면접 후
- 지원자 피드백 설문 자동 발송

## 기술 스택

- **Backend**: Node.js, Express, TypeScript, SQLite
- **Frontend**: React, TypeScript, Vite
- **Email**: Nodemailer (MS Exchange)
- **Scheduler**: node-cron
- **AI**: Claude API

## 프로젝트 구조

```
/
├── backend/          # Express API 서버
├── frontend/         # React 웹 애플리케이션
└── README.md
```

## 시작하기

### 1. Backend 설정

```bash
cd backend
npm install

# 환경 변수 설정
cp .env.example .env
# .env 파일을 열어서 실제 값으로 수정하세요

# 데이터베이스 초기화
npm run db:setup

# 샘플 데이터 생성 (선택사항 - 테스트용)
npm run db:seed

# 개발 서버 실행
npm run dev
```

### 2. Frontend 실행

```bash
cd frontend
npm install
npm run dev
```

접속: http://localhost:5173

## 환경 변수

`backend/.env` 파일을 생성하고 다음 정보를 입력하세요:

```env
# Database
DATABASE_PATH=./data/interview.sqlite

# Email (MS Exchange)
EMAIL_HOST=smtp.office365.com
EMAIL_PORT=587
EMAIL_USER=your-email@company.com
EMAIL_PASSWORD=your-password
EMAIL_FROM=your-email@company.com

# Claude API
ANTHROPIC_API_KEY=sk-ant-xxxxx

# App
PORT=3000
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

## 사용 가이드

### 1. 면접 생성 (Admin)

1. Admin 페이지 접속 (http://localhost:5173/admin)
2. "면접 관리" → "+ 면접 생성" 클릭
3. 지원자 정보 입력 (없으면 "지원자 추가" 먼저 클릭)
4. 면접관 정보 및 일정 입력
5. 생성 완료!

### 2. 질문 선택 (D-1)

1. 면접관은 D-1에 이메일을 받습니다
2. 이메일의 "면접 질문 미리 선택하기" 링크 클릭
3. AI로 질문 자동 생성 또는 기존 질문 선택
4. 체크박스로 질문 선택 후 저장

### 3. 면접 진행 (당일, 태블릿)

1. 태블릿에서 http://localhost:5173/tablet 접속
2. 해당 면접 선택
3. "면접 시작하기" 클릭
4. 왼쪽: 지원자 정보, 타이머
5. 오른쪽: 선택된 질문 목록
   - 질문마다 메모 작성 가능
   - 완료 시 체크박스 클릭
6. "면접 종료 및 평가하기" 클릭

### 4. 평가 입력

1. 각 항목별 별점 (1-5점) 입력
   - 직무 적합성
   - 경력 검증
   - 커뮤니케이션
   - 문화 적합성
2. 메모 작성
3. 최종 의견 선택 (적극추천/추천/보류/불합격)
4. "저장" 클릭

### 5. 피드백 설문 (지원자)

- 면접 종료 2시간 후 자동으로 이메일 발송
- 지원자가 설문 링크를 통해 피드백 제출
- Admin에서 모든 피드백 조회 가능

## 주요 화면

### Admin 화면
- `/admin` - Dashboard
- `/admin/interviews` - 면접 목록 및 생성
- `/admin/interviews/:id` - 면접 상세
- `/admin/interviews/:id/questions` - 질문 선택

### Tablet 화면 (태블릿 최적화)
- `/tablet` - 면접 선택
- `/tablet/interview/:id` - 면접 진행 (2단 레이아웃)
- `/tablet/interview/:id/evaluation` - 평가 입력

### 설문 화면
- `/survey/:id` - 지원자 피드백 설문

## 자동화 기능

### 1. D-1 알림 메일
- 매일 오전 9시에 스케줄러 실행
- 다음날 면접이 있는 면접관에게 자동 발송
- 이력서 링크, 질문 선택 링크 포함

### 2. 면접 후 설문
- 면접 종료 2시간 후 자동 발송
- 지원자 만족도 조사

### 3. Claude AI 질문 생성
- 직무와 지원자 정보 기반 맞춤 질문 생성
- 3가지 카테고리: 직무경험, 이력서기반, 일반역량

## 데이터베이스 스키마

- `candidates` - 지원자 정보
- `interviews` - 면접 일정
- `questions` - 질문 풀
- `selected_questions` - 면접별 선택된 질문
- `evaluations` - 면접 평가
- `feedback_surveys` - 지원자 피드백

## 개발 정보

### 프로젝트 구조

```
backend/
  src/
    controllers/    # API 컨트롤러
    models/         # 데이터베이스 모델
    routes/         # API 라우트
    services/       # 비즈니스 로직 (Claude, Email, Scheduler)
    db/             # 데이터베이스 설정
    index.ts        # 서버 진입점

frontend/
  src/
    pages/
      Admin/        # Admin 페이지
      Tablet/       # 태블릿 페이지
      Survey/       # 설문 페이지
    components/     # 공통 컴포넌트
    services/       # API 클라이언트
    styles/         # 스타일
```

## 트러블슈팅

### 이메일이 발송되지 않는 경우
- MS Exchange 계정 설정 확인
- 2단계 인증 사용 시 앱 비밀번호 생성 필요
- SMTP 설정 확인 (smtp.office365.com:587)

### Claude API 오류
- API 키 확인
- API 크레딧 잔액 확인
- 네트워크 연결 확인

### 데이터베이스 초기화
```bash
cd backend
rm -rf data/
npm run db:setup
```

### 샘플 데이터 다시 생성
```bash
cd backend
npm run db:seed
```

**생성되는 샘플 데이터:**
- 지원자 5명 (홍길동, 김영희, 이철수, 박민수, 최지은)
- 면접 일정 5개 (진행 예정 3개, 완료 2개)
- 직무별 질문 18개 (마케팅, 개발자, 디자이너, 데이터분석가)
- 완료된 면접에 대한 평가 및 피드백

## 라이선스

MIT
