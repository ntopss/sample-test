import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  interviewAPI,
  questionAPI,
  Interview,
  SelectedQuestion
} from '../../services/api';
import Timer from '../../components/Timer';

function InterviewSession() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [interview, setInterview] = useState<Interview | null>(null);
  const [questions, setQuestions] = useState<SelectedQuestion[]>([]);
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (id) {
      loadInterview(Number(id));
      loadQuestions(Number(id));
    }
  }, [id]);

  const loadInterview = async (interviewId: number) => {
    try {
      const response = await interviewAPI.getById(interviewId);
      setInterview(response.data);
      setStarted(response.data.status === 'in_progress');
    } catch (error) {
      console.error('Failed to load interview:', error);
    }
  };

  const loadQuestions = async (interviewId: number) => {
    try {
      const response = await questionAPI.getSelectedQuestions(interviewId);
      setQuestions(response.data);
    } catch (error) {
      console.error('Failed to load questions:', error);
    }
  };

  const startInterview = async () => {
    try {
      await interviewAPI.start(Number(id));
      setStarted(true);
    } catch (error) {
      console.error('Failed to start interview:', error);
    }
  };

  const toggleQuestionComplete = async (questionId: number) => {
    try {
      const question = questions.find((q) => q.id === questionId);
      if (!question) return;

      if (question.is_completed) {
        // Already completed, just update UI
        setQuestions(
          questions.map((q) =>
            q.id === questionId ? { ...q, is_completed: 0 } : q
          )
        );
      } else {
        await questionAPI.markCompleted(questionId, notes[questionId]);
        setQuestions(
          questions.map((q) =>
            q.id === questionId ? { ...q, is_completed: 1 } : q
          )
        );
      }
    } catch (error) {
      console.error('Failed to toggle question:', error);
    }
  };

  const endInterview = async () => {
    if (!confirm('면접을 종료하시겠습니까?')) return;

    try {
      await interviewAPI.end(Number(id));
      navigate(`/tablet/interview/${id}/evaluation`);
    } catch (error) {
      console.error('Failed to end interview:', error);
    }
  };

  if (!interview) {
    return <div className="container">로딩 중...</div>;
  }

  if (!started) {
    return (
      <div className="container">
        <div className="card text-center" style={{ maxWidth: '600px', margin: '50px auto' }}>
          <h1 style={{ fontSize: '28px', marginBottom: '20px' }}>면접 시작</h1>
          <div style={{ marginBottom: '30px', textAlign: 'left' }}>
            <p style={{ fontSize: '20px', marginBottom: '10px' }}>
              <strong>지원자:</strong> {interview.candidate_name}
            </p>
            <p style={{ fontSize: '20px', marginBottom: '10px' }}>
              <strong>직무:</strong> {interview.candidate_position}
            </p>
            <p style={{ fontSize: '18px', color: '#666' }}>
              경력: {interview.candidate_experience_years}년 | 학력: {interview.candidate_education}
            </p>
          </div>
          <button
            className="btn btn-success"
            onClick={startInterview}
            style={{ fontSize: '20px', padding: '20px 40px' }}
          >
            면접 시작하기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px', height: '90vh' }}>
        {/* Left Panel - Candidate Info */}
        <div>
          <div className="card" style={{ height: '100%' }}>
            <h2 style={{ fontSize: '24px', marginBottom: '15px' }}>
              {interview.candidate_name}
            </h2>
            <p style={{ fontSize: '18px', color: '#666', marginBottom: '20px' }}>
              {interview.candidate_position}
            </p>

            <div style={{ marginBottom: '20px' }}>
              <p style={{ marginBottom: '10px' }}>
                <strong>경력:</strong> {interview.candidate_experience_years}년
              </p>
              <p style={{ marginBottom: '10px' }}>
                <strong>학력:</strong> {interview.candidate_education}
              </p>
              {interview.candidate_resume_url && (
                <a
                  href={interview.candidate_resume_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                  style={{ marginTop: '10px', width: '100%' }}
                >
                  📄 이력서 보기
                </a>
              )}
            </div>

            <div
              style={{
                padding: '20px',
                backgroundColor: '#f0f8ff',
                borderRadius: '8px',
                marginBottom: '20px'
              }}
            >
              <Timer />
            </div>

            <button
              className="btn btn-danger"
              onClick={endInterview}
              style={{ width: '100%', fontSize: '18px', padding: '15px' }}
            >
              면접 종료 및 평가하기
            </button>
          </div>
        </div>

        {/* Right Panel - Questions */}
        <div style={{ overflowY: 'auto' }}>
          <h2 style={{ fontSize: '28px', marginBottom: '20px' }}>
            선택한 질문 ({questions.filter((q) => q.is_completed).length}/{questions.length})
          </h2>

          {questions.length === 0 ? (
            <div className="card text-center">
              <p style={{ color: '#666', fontSize: '18px' }}>
                선택된 질문이 없습니다.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {questions.map((q) => (
                <div
                  key={q.id}
                  className="card"
                  style={{
                    borderLeft: q.is_completed ? '5px solid #28a745' : '5px solid #ddd',
                    backgroundColor: q.is_completed ? '#f0f9f4' : 'white'
                  }}
                >
                  <div className="flex-between" style={{ marginBottom: '15px' }}>
                    <span
                      style={{
                        fontSize: '14px',
                        padding: '5px 12px',
                        backgroundColor: '#e9ecef',
                        borderRadius: '15px'
                      }}
                    >
                      {q.question_category}
                    </span>
                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={q.is_completed === 1}
                        onChange={() => toggleQuestionComplete(q.id!)}
                        style={{ width: '24px', height: '24px', marginRight: '10px' }}
                      />
                      <span style={{ fontSize: '16px' }}>완료</span>
                    </label>
                  </div>

                  <p style={{ fontSize: '20px', marginBottom: '15px', lineHeight: '1.6' }}>
                    {q.question_content}
                  </p>

                  <textarea
                    placeholder="메모..."
                    value={notes[q.id!] || ''}
                    onChange={(e) => setNotes({ ...notes, [q.id!]: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '15px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '16px',
                      minHeight: '80px',
                      resize: 'vertical'
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default InterviewSession;
