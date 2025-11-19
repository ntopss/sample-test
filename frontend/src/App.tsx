import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './pages/Admin/Dashboard';
import InterviewList from './pages/Admin/InterviewList';
import InterviewDetail from './pages/Admin/InterviewDetail';
import QuestionSelect from './pages/Admin/QuestionSelect';
import InterviewSession from './pages/Tablet/InterviewSession';
import Evaluation from './pages/Tablet/Evaluation';
import FeedbackSurvey from './pages/Survey/FeedbackSurvey';

function App() {
  return (
    <Router>
      <div className="app">
        <nav style={navStyle}>
          <div className="container">
            <div className="flex-between">
              <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>면접 자동화 시스템</h1>
              <div className="flex flex-gap">
                <Link to="/admin" style={linkStyle}>Admin</Link>
                <Link to="/tablet" style={linkStyle}>Tablet</Link>
              </div>
            </div>
          </div>
        </nav>

        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/admin" element={<Dashboard />} />
          <Route path="/admin/interviews" element={<InterviewList />} />
          <Route path="/admin/interviews/:id" element={<InterviewDetail />} />
          <Route path="/admin/interviews/:id/questions" element={<QuestionSelect />} />
          <Route path="/tablet" element={<InterviewList tablet />} />
          <Route path="/tablet/interview/:id" element={<InterviewSession />} />
          <Route path="/tablet/interview/:id/evaluation" element={<Evaluation />} />
          <Route path="/survey/:id" element={<FeedbackSurvey />} />
        </Routes>
      </div>
    </Router>
  );
}

const navStyle: React.CSSProperties = {
  background: 'white',
  borderBottom: '1px solid #ddd',
  padding: '15px 0',
  marginBottom: '30px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
};

const linkStyle: React.CSSProperties = {
  color: '#0066cc',
  textDecoration: 'none',
  fontWeight: '500'
};

export default App;
