import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { interviewAPI, feedbackAPI, Interview, Feedback } from '../../services/api';

function FeedbackSurvey() {
  const { id } = useParams<{ id: string }>();
  const [interview, setInterview] = useState<Interview | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>({
    interview_id: Number(id),
    interviewer_attitude_score: 0,
    question_relevance_score: 0,
    company_impression_score: 0,
    improvement_feedback: ''
  });

  useEffect(() => {
    if (id) {
      loadInterview(Number(id));
    }
  }, [id]);

  const loadInterview = async (interviewId: number) => {
    try {
      const response = await interviewAPI.getById(interviewId);
      setInterview(response.data);
    } catch (error) {
      console.error('Failed to load interview:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !feedback.interviewer_attitude_score ||
      !feedback.question_relevance_score ||
      !feedback.company_impression_score
    ) {
      alert('모든 항목에 점수를 매겨주세요.');
      return;
    }

    try {
      await feedbackAPI.submit(feedback);
      setSubmitted(true);
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      alert('설문 제출에 실패했습니다.');
    }
  };

  const ScoreButtons = ({
    label,
    value,
    onChange
  }: {
    label: string;
    value: number;
    onChange: (value: number) => void;
  }) => (
    <div style={{ marginBottom: '30px' }}>
      <label style={{ display: 'block', marginBottom: '15px', fontSize: '18px', fontWeight: '500' }}>
        {label}
      </label>
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
        {[1, 2, 3, 4, 5].map((score) => (
          <button
            key={score}
            type="button"
            onClick={() => onChange(score)}
            style={{
              width: '60px',
              height: '60px',
              fontSize: '24px',
              borderRadius: '50%',
              border: value === score ? '3px solid #0066cc' : '2px solid #ddd',
              backgroundColor: value === score ? '#0066cc' : 'white',
              color: value === score ? 'white' : '#333',
              cursor: 'pointer',
              transition: 'all 0.2s',
              fontWeight: '600'
            }}
          >
            {score}
          </button>
        ))}
      </div>
    </div>
  );

  if (submitted) {
    return (
      <div className="container" style={{ maxWidth: '600px', marginTop: '100px' }}>
        <div className="card text-center">
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>✅</div>
          <h1 style={{ fontSize: '28px', marginBottom: '15px' }}>감사합니다!</h1>
          <p style={{ fontSize: '18px', color: '#666' }}>
            소중한 의견 감사드립니다.
            <br />
            더 나은 면접 경험을 제공하도록 노력하겠습니다.
          </p>
        </div>
      </div>
    );
  }

  if (!interview) {
    return <div className="container">로딩 중...</div>;
  }

  return (
    <div className="container" style={{ maxWidth: '700px', marginTop: '50px' }}>
      <div className="card">
        <h1 style={{ fontSize: '28px', marginBottom: '10px' }}>
          면접에 대한 의견을 들려주세요
        </h1>
        <p style={{ fontSize: '16px', color: '#666', marginBottom: '30px' }}>
          {interview.candidate_name} 님, 안녕하세요.
          <br />
          오늘 면접에 참여해주셔서 감사합니다.
          <br />
          더 나은 채용 프로세스를 위해 솔직한 의견 부탁드립니다. (소요 시간: 2분)
        </p>

        <form onSubmit={handleSubmit}>
          <ScoreButtons
            label="1. 면접관의 태도는 어떠셨나요?"
            value={feedback.interviewer_attitude_score || 0}
            onChange={(value) => setFeedback({ ...feedback, interviewer_attitude_score: value })}
          />

          <ScoreButtons
            label="2. 질문이 직무와 관련성이 있었나요?"
            value={feedback.question_relevance_score || 0}
            onChange={(value) => setFeedback({ ...feedback, question_relevance_score: value })}
          />

          <ScoreButtons
            label="3. 회사에 대한 인상은?"
            value={feedback.company_impression_score || 0}
            onChange={(value) => setFeedback({ ...feedback, company_impression_score: value })}
          />

          <div style={{ marginBottom: '30px' }}>
            <label style={{ display: 'block', marginBottom: '15px', fontSize: '18px', fontWeight: '500' }}>
              4. 개선이 필요한 부분이 있다면? (선택)
            </label>
            <textarea
              value={feedback.improvement_feedback}
              onChange={(e) => setFeedback({ ...feedback, improvement_feedback: e.target.value })}
              style={{
                width: '100%',
                padding: '15px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '16px',
                minHeight: '120px',
                resize: 'vertical'
              }}
              placeholder="면접 과정에서 개선되었으면 하는 부분을 자유롭게 작성해주세요..."
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', fontSize: '18px', padding: '15px' }}
          >
            제출하기
          </button>
        </form>
      </div>
    </div>
  );
}

export default FeedbackSurvey;
