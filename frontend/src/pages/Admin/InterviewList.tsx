import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { interviewAPI, candidateAPI, Interview, Candidate } from '../../services/api';

interface InterviewListProps {
  tablet?: boolean;
}

function InterviewList({ tablet = false }: InterviewListProps) {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [formData, setFormData] = useState({
    candidate_id: '',
    interviewer_name: '',
    interviewer_email: '',
    scheduled_date: ''
  });

  useEffect(() => {
    loadInterviews();
    loadCandidates();
  }, []);

  const loadInterviews = async () => {
    try {
      const response = tablet
        ? await interviewAPI.getUpcoming()
        : await interviewAPI.getAll();
      setInterviews(response.data);
    } catch (error) {
      console.error('Failed to load interviews:', error);
    }
  };

  const loadCandidates = async () => {
    try {
      const response = await candidateAPI.getAll();
      setCandidates(response.data);
    } catch (error) {
      console.error('Failed to load candidates:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await interviewAPI.create({
        candidate_id: Number(formData.candidate_id),
        interviewer_name: formData.interviewer_name,
        interviewer_email: formData.interviewer_email,
        scheduled_date: formData.scheduled_date
      });
      setShowCreateForm(false);
      setFormData({
        candidate_id: '',
        interviewer_name: '',
        interviewer_email: '',
        scheduled_date: ''
      });
      loadInterviews();
    } catch (error) {
      console.error('Failed to create interview:', error);
      alert('면접 생성에 실패했습니다.');
    }
  };

  const handleCreateCandidate = async () => {
    const name = prompt('지원자 이름:');
    const position = prompt('지원 직무:');
    if (name && position) {
      try {
        await candidateAPI.create({ name, position });
        loadCandidates();
      } catch (error) {
        console.error('Failed to create candidate:', error);
      }
    }
  };

  return (
    <div className="container">
      <div className="flex-between mb-3">
        <h1 style={{ fontSize: '32px' }}>
          {tablet ? '면접 선택' : '면접 목록'}
        </h1>
        {!tablet && (
          <button className="btn btn-primary" onClick={() => setShowCreateForm(!showCreateForm)}>
            {showCreateForm ? '취소' : '+ 면접 생성'}
          </button>
        )}
      </div>

      {showCreateForm && !tablet && (
        <div className="card mb-3">
          <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>새 면접 생성</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">지원자</label>
              <div className="flex flex-gap">
                <select
                  className="form-control"
                  value={formData.candidate_id}
                  onChange={(e) => setFormData({ ...formData, candidate_id: e.target.value })}
                  required
                  style={{ flex: 1 }}
                >
                  <option value="">선택하세요</option>
                  {candidates.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} - {c.position}
                    </option>
                  ))}
                </select>
                <button type="button" className="btn btn-secondary" onClick={handleCreateCandidate}>
                  + 지원자 추가
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">면접관 이름</label>
              <input
                type="text"
                className="form-control"
                value={formData.interviewer_name}
                onChange={(e) => setFormData({ ...formData, interviewer_name: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">면접관 이메일</label>
              <input
                type="email"
                className="form-control"
                value={formData.interviewer_email}
                onChange={(e) => setFormData({ ...formData, interviewer_email: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">면접 일시</label>
              <input
                type="datetime-local"
                className="form-control"
                value={formData.scheduled_date}
                onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary">생성</button>
          </form>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {interviews.map((interview) => (
          <Link
            key={interview.id}
            to={tablet ? `/tablet/interview/${interview.id}` : `/admin/interviews/${interview.id}`}
            style={{ textDecoration: 'none' }}
          >
            <div className="card" style={{ cursor: 'pointer' }}>
              <div className="flex-between">
                <div>
                  <h3 style={{ fontSize: tablet ? '24px' : '20px', marginBottom: '10px' }}>
                    {interview.candidate_name}
                  </h3>
                  <p style={{ color: '#666', marginBottom: '5px' }}>
                    직무: {interview.candidate_position}
                  </p>
                  <p style={{ color: '#666', marginBottom: '5px' }}>
                    면접관: {interview.interviewer_name}
                  </p>
                  <p style={{ color: '#666', fontSize: '14px' }}>
                    {new Date(interview.scheduled_date).toLocaleString('ko-KR')}
                  </p>
                </div>
                <div>
                  <span
                    style={{
                      padding: '5px 15px',
                      borderRadius: '20px',
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
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default InterviewList;
