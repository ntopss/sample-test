import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { interviewAPI, Interview, evaluationAPI, Evaluation } from '../../services/api';

function InterviewDetail() {
  const { id } = useParams<{ id: string }>();
  const [interview, setInterview] = useState<Interview | null>(null);
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadInterview(Number(id));
      loadEvaluation(Number(id));
    }
  }, [id]);

  const loadInterview = async (interviewId: number) => {
    try {
      const response = await interviewAPI.getById(interviewId);
      setInterview(response.data);
    } catch (error) {
      console.error('Failed to load interview:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadEvaluation = async (interviewId: number) => {
    try {
      const response = await evaluationAPI.getByInterviewId(interviewId);
      setEvaluation(response.data);
    } catch (error) {
      // Evaluation might not exist yet
      setEvaluation(null);
    }
  };

  if (loading) {
    return <div className="container">로딩 중...</div>;
  }

  if (!interview) {
    return <div className="container">면접을 찾을 수 없습니다.</div>;
  }

  return (
    <div className="container">
      <div className="flex-between mb-3">
        <h1 style={{ fontSize: '32px' }}>면접 상세</h1>
        <Link to="/admin/interviews" className="btn btn-secondary">
          목록으로
        </Link>
      </div>

      <div className="card">
        <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>지원자 정보</h2>
        <div style={{ display: 'grid', gap: '10px' }}>
          <p><strong>이름:</strong> {interview.candidate_name}</p>
          <p><strong>직무:</strong> {interview.candidate_position}</p>
          {interview.candidate_experience_years && (
            <p><strong>경력:</strong> {interview.candidate_experience_years}년</p>
          )}
          {interview.candidate_education && (
            <p><strong>학력:</strong> {interview.candidate_education}</p>
          )}
          {interview.candidate_resume_url && (
            <p>
              <strong>이력서:</strong>{' '}
              <a href={interview.candidate_resume_url} target="_blank" rel="noopener noreferrer">
                보기
              </a>
            </p>
          )}
        </div>
      </div>

      <div className="card">
        <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>면접 정보</h2>
        <div style={{ display: 'grid', gap: '10px' }}>
          <p><strong>면접관:</strong> {interview.interviewer_name}</p>
          <p><strong>이메일:</strong> {interview.interviewer_email}</p>
          <p><strong>일시:</strong> {new Date(interview.scheduled_date).toLocaleString('ko-KR')}</p>
          <p>
            <strong>상태:</strong>{' '}
            <span
              style={{
                padding: '3px 12px',
                borderRadius: '15px',
                fontSize: '14px',
                backgroundColor:
                  interview.status === 'completed' ? '#28a745' :
                  interview.status === 'in_progress' ? '#ffc107' :
                  '#6c757d',
                color: 'white'
              }}
            >
              {interview.status === 'completed' ? '완료' :
               interview.status === 'in_progress' ? '진행중' :
               '예정'}
            </span>
          </p>
        </div>

        <div className="mt-2">
          <Link
            to={`/admin/interviews/${id}/questions`}
            className="btn btn-primary"
            style={{ marginRight: '10px' }}
          >
            질문 선택하기
          </Link>
          <Link to={`/tablet/interview/${id}`} className="btn btn-success">
            면접 시작 (태블릿)
          </Link>
        </div>
      </div>

      {evaluation && (
        <div className="card">
          <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>평가 결과</h2>
          <div style={{ display: 'grid', gap: '15px' }}>
            <div>
              <strong>직무 적합성:</strong> {'⭐'.repeat(evaluation.job_fit_score || 0)}
            </div>
            <div>
              <strong>경력 검증:</strong> {'⭐'.repeat(evaluation.experience_verification_score || 0)}
            </div>
            <div>
              <strong>커뮤니케이션:</strong> {'⭐'.repeat(evaluation.communication_score || 0)}
            </div>
            <div>
              <strong>문화 적합성:</strong> {'⭐'.repeat(evaluation.culture_fit_score || 0)}
            </div>
            {evaluation.notes && (
              <div>
                <strong>메모:</strong>
                <p style={{ marginTop: '5px', padding: '10px', backgroundColor: '#f9f9f9', borderRadius: '4px' }}>
                  {evaluation.notes}
                </p>
              </div>
            )}
            {evaluation.recommendation && (
              <div>
                <strong>최종 의견:</strong> {evaluation.recommendation}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default InterviewDetail;
