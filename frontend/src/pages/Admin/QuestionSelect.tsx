import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  interviewAPI,
  questionAPI,
  Interview,
  Question,
  SelectedQuestion
} from '../../services/api';

function QuestionSelect() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [interview, setInterview] = useState<Interview | null>(null);
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<SelectedQuestion[]>([]);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (id) {
      loadData(Number(id));
    }
  }, [id]);

  const loadData = async (interviewId: number) => {
    try {
      const [interviewRes, questionsRes, selectedRes] = await Promise.all([
        interviewAPI.getById(interviewId),
        questionAPI.getAll(),
        questionAPI.getSelectedQuestions(interviewId)
      ]);

      setInterview(interviewRes.data);
      setAllQuestions(questionsRes.data);
      setSelectedQuestions(selectedRes.data);
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  const generateQuestions = async () => {
    if (!interview) return;

    setGenerating(true);
    try {
      const response = await questionAPI.generate({
        position: interview.candidate_position || '',
        candidateName: interview.candidate_name
      });

      // Add generated questions to database
      const newQuestions: Question[] = [];
      for (const q of response.data) {
        const created = await questionAPI.create(q);
        newQuestions.push(created.data);
      }

      setAllQuestions([...newQuestions, ...allQuestions]);
      alert('AI 질문이 생성되었습니다!');
    } catch (error) {
      console.error('Failed to generate questions:', error);
      alert('질문 생성에 실패했습니다.');
    } finally {
      setGenerating(false);
    }
  };

  const toggleQuestion = async (questionId: number) => {
    const isSelected = selectedQuestions.some((sq) => sq.question_id === questionId);

    try {
      if (isSelected) {
        const selected = selectedQuestions.find((sq) => sq.question_id === questionId);
        if (selected?.id) {
          await questionAPI.removeSelected(selected.id);
        }
      } else {
        await questionAPI.selectForInterview(Number(id), questionId);
      }

      // Reload selected questions
      const response = await questionAPI.getSelectedQuestions(Number(id));
      setSelectedQuestions(response.data);
    } catch (error) {
      console.error('Failed to toggle question:', error);
    }
  };

  const groupedQuestions = allQuestions.reduce((acc, q) => {
    if (!acc[q.category]) {
      acc[q.category] = [];
    }
    acc[q.category].push(q);
    return acc;
  }, {} as Record<string, Question[]>);

  if (!interview) {
    return <div className="container">로딩 중...</div>;
  }

  return (
    <div className="container">
      <div className="flex-between mb-3">
        <h1 style={{ fontSize: '32px' }}>면접 질문 선택</h1>
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>
          뒤로가기
        </button>
      </div>

      <div className="card">
        <h2 style={{ fontSize: '24px', marginBottom: '10px' }}>
          {interview.candidate_name} 님 면접
        </h2>
        <p style={{ color: '#666' }}>직무: {interview.candidate_position}</p>
        <p style={{ color: '#666', fontSize: '14px', marginTop: '10px' }}>
          * 질문을 선택하시면 면접 당일 태블릿에서 바로 확인하실 수 있습니다.
        </p>

        <button
          className="btn btn-primary mt-2"
          onClick={generateQuestions}
          disabled={generating}
        >
          {generating ? '생성 중...' : '🤖 AI로 질문 생성하기'}
        </button>
      </div>

      <div className="card">
        <h3 style={{ fontSize: '20px', marginBottom: '15px' }}>
          선택된 질문: {selectedQuestions.length}개
        </h3>

        {Object.entries(groupedQuestions).map(([category, questions]) => (
          <div key={category} style={{ marginBottom: '30px' }}>
            <h4
              style={{
                fontSize: '18px',
                marginBottom: '15px',
                paddingBottom: '10px',
                borderBottom: '2px solid #ddd'
              }}
            >
              {category === '직무경험' && '💼 '}
              {category === '이력서기반' && '📋 '}
              {category === '일반역량' && '🎯 '}
              {category}
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {questions.map((q) => {
                const isSelected = selectedQuestions.some(
                  (sq) => sq.question_id === q.id
                );

                return (
                  <label
                    key={q.id}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      padding: '15px',
                      border: isSelected ? '2px solid #0066cc' : '1px solid #ddd',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      backgroundColor: isSelected ? '#f0f8ff' : 'white',
                      transition: 'all 0.2s'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleQuestion(q.id!)}
                      style={{
                        marginRight: '15px',
                        marginTop: '3px',
                        width: '20px',
                        height: '20px',
                        cursor: 'pointer'
                      }}
                    />
                    <span style={{ flex: 1, fontSize: '16px' }}>{q.content}</span>
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default QuestionSelect;
