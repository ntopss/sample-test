import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { interviewAPI, Interview } from '../../services/api';

function Dashboard() {
  const [upcomingInterviews, setUpcomingInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUpcomingInterviews();
  }, []);

  const loadUpcomingInterviews = async () => {
    try {
      const response = await interviewAPI.getUpcoming();
      setUpcomingInterviews(response.data);
    } catch (error) {
      console.error('Failed to load interviews:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1 style={{ fontSize: '32px', marginBottom: '30px' }}>Dashboard</h1>

      <div className="grid grid-2">
        <Link to="/admin/interviews" style={{ textDecoration: 'none' }}>
          <div className="card" style={cardHoverStyle}>
            <h2 style={{ fontSize: '24px', marginBottom: '10px' }}>📅 면접 관리</h2>
            <p style={{ color: '#666' }}>면접 일정 조회 및 생성</p>
          </div>
        </Link>

        <Link to="/tablet" style={{ textDecoration: 'none' }}>
          <div className="card" style={cardHoverStyle}>
            <h2 style={{ fontSize: '24px', marginBottom: '10px' }}>📱 태블릿 모드</h2>
            <p style={{ color: '#666' }}>면접 진행 화면</p>
          </div>
        </Link>
      </div>

      <div className="card mt-3">
        <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>다가오는 면접</h2>
        {loading ? (
          <p>로딩 중...</p>
        ) : upcomingInterviews.length === 0 ? (
          <p style={{ color: '#666' }}>예정된 면접이 없습니다.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {upcomingInterviews.map((interview) => (
              <Link
                key={interview.id}
                to={`/admin/interviews/${interview.id}`}
                style={{ textDecoration: 'none' }}
              >
                <div
                  style={{
                    padding: '15px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    backgroundColor: '#f9f9f9'
                  }}
                >
                  <div className="flex-between">
                    <div>
                      <h3 style={{ fontSize: '18px', marginBottom: '5px' }}>
                        {interview.candidate_name} - {interview.candidate_position}
                      </h3>
                      <p style={{ color: '#666', fontSize: '14px' }}>
                        {new Date(interview.scheduled_date).toLocaleString('ko-KR')}
                      </p>
                    </div>
                    <div style={{ color: '#0066cc', fontWeight: '500' }}>
                      {interview.interviewer_name}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const cardHoverStyle: React.CSSProperties = {
  cursor: 'pointer',
  transition: 'transform 0.2s, box-shadow 0.2s'
};

export default Dashboard;
