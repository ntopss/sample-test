import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { interviewAPI, evaluationAPI, Interview, Evaluation } from '../../services/api';

function EvaluationPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [interview, setInterview] = useState<Interview | null>(null);
  const [evaluation, setEvaluation] = useState<Evaluation>({
    interview_id: Number(id),
    job_fit_score: 0,
    experience_verification_score: 0,
    communication_score: 0,
    culture_fit_score: 0,
    notes: '',
    recommendation: ''
  });

  useEffect(() => {
    if (id) {
      loadInterview(Number(id));
      loadExistingEvaluation(Number(id));
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

  const loadExistingEvaluation = async (interviewId: number) => {
    try {
      const response = await evaluationAPI.getByInterviewId(interviewId);
      setEvaluation({ ...evaluation, ...response.data });
    } catch (error) {
      // Evaluation doesn't exist yet
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!evaluation.recommendation) {
      alert('최종 의견을 선택해주세요.');
      return;
    }

    try {
      await evaluationAPI.save(evaluation);
      alert('평가가 저장되었습니다!');
      navigate(`/admin/interviews/${id}`);
    } catch (error) {
      console.error('Failed to save evaluation:', error);
      alert('평가 저장에 실패했습니다.');
    }
  };

  const StarRating = ({
    label,
    value,
    onChange
  }: {
    label: string;
    value: number;
    onChange: (value: number) => void;
  }) => (
    <div style={{ marginBottom: '25px' }}>
      <label style={{ display: 'block', marginBottom: '10px', fontSize: '18px', fontWeight: '500' }}>
        {label}
      </label>
      <div style={{ display: 'flex', gap: '10px' }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            style={{
              fontSize: '36px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '5px'
            }}
          >
            {star <= value ? '⭐' : '☆'}
          </button>
        ))}
        <span style={{ marginLeft: '15px', fontSize: '24px', color: '#666' }}>
          {value}/5
        </span>
      </div>
    </div>
  );

  if (!interview) {
    return <div className="container">로딩 중...</div>;
  }

  return (
    <div className="container" style={{ maxWidth: '800px' }}>
      <h1 style={{ fontSize: '32px', marginBottom: '30px' }}>
        {interview.candidate_name} 면접 평가
      </h1>

      <form onSubmit={handleSubmit}>
        <div className="card">
          <StarRating
            label="직무 적합성"
            value={evaluation.job_fit_score || 0}
            onChange={(value) => setEvaluation({ ...evaluation, job_fit_score: value })}
          />

          <StarRating
            label="경력 검증"
            value={evaluation.experience_verification_score || 0}
            onChange={(value) => setEvaluation({ ...evaluation, experience_verification_score: value })}
          />

          <StarRating
            label="커뮤니케이션"
            value={evaluation.communication_score || 0}
            onChange={(value) => setEvaluation({ ...evaluation, communication_score: value })}
          />

          <StarRating
            label="문화 적합성"
            value={evaluation.culture_fit_score || 0}
            onChange={(value) => setEvaluation({ ...evaluation, culture_fit_score: value })}
          />

          <div style={{ marginBottom: '25px' }}>
            <label style={{ display: 'block', marginBottom: '10px', fontSize: '18px', fontWeight: '500' }}>
              메모:
            </label>
            <textarea
              value={evaluation.notes}
              onChange={(e) => setEvaluation({ ...evaluation, notes: e.target.value })}
              style={{
                width: '100%',
                padding: '15px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '16px',
                minHeight: '120px',
                resize: 'vertical'
              }}
              placeholder="면접에 대한 전반적인 평가를 작성해주세요..."
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '15px', fontSize: '18px', fontWeight: '500' }}>
              최종 의견:
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { value: '적극추천', color: '#28a745' },
                { value: '추천', color: '#17a2b8' },
                { value: '보류', color: '#ffc107' },
                { value: '불합격', color: '#dc3545' }
              ].map((option) => (
                <label
                  key={option.value}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '15px 20px',
                    border: evaluation.recommendation === option.value ? `3px solid ${option.color}` : '2px solid #ddd',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    backgroundColor: evaluation.recommendation === option.value ? `${option.color}15` : 'white',
                    transition: 'all 0.2s',
                    fontSize: '18px'
                  }}
                >
                  <input
                    type="radio"
                    name="recommendation"
                    value={option.value}
                    checked={evaluation.recommendation === option.value}
                    onChange={(e) => setEvaluation({ ...evaluation, recommendation: e.target.value })}
                    style={{ width: '24px', height: '24px', marginRight: '15px' }}
                  />
                  <span style={{ fontWeight: evaluation.recommendation === option.value ? '600' : '400' }}>
                    {option.value}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex flex-gap mt-3">
            <button
              type="submit"
              className="btn btn-success"
              style={{ flex: 1, fontSize: '18px', padding: '15px' }}
            >
              저장
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate(-1)}
              style={{ fontSize: '18px', padding: '15px' }}
            >
              취소
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default EvaluationPage;
