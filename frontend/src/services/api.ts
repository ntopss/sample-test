import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

export interface Candidate {
  id?: number;
  name: string;
  position: string;
  experience_years?: number;
  education?: string;
  resume_url?: string;
}

export interface Interview {
  id?: number;
  candidate_id: number;
  interviewer_name: string;
  interviewer_email: string;
  scheduled_date: string;
  status?: string;
  candidate_name?: string;
  candidate_position?: string;
  candidate_experience_years?: number;
  candidate_education?: string;
  candidate_resume_url?: string;
}

export interface Question {
  id?: number;
  category: string;
  content: string;
  position?: string;
}

export interface SelectedQuestion {
  id?: number;
  interview_id: number;
  question_id: number;
  is_completed?: number;
  notes?: string;
  question_category?: string;
  question_content?: string;
}

export interface Evaluation {
  interview_id: number;
  job_fit_score?: number;
  experience_verification_score?: number;
  communication_score?: number;
  culture_fit_score?: number;
  notes?: string;
  recommendation?: string;
}

export interface Feedback {
  interview_id: number;
  interviewer_attitude_score?: number;
  question_relevance_score?: number;
  company_impression_score?: number;
  improvement_feedback?: string;
}

export const candidateAPI = {
  getAll: () => api.get<Candidate[]>('/candidates'),
  getById: (id: number) => api.get<Candidate>(`/candidates/${id}`),
  create: (data: Candidate) => api.post<Candidate>('/candidates', data),
  update: (id: number, data: Partial<Candidate>) => api.put(`/candidates/${id}`, data),
  delete: (id: number) => api.delete(`/candidates/${id}`)
};

export const interviewAPI = {
  getAll: () => api.get<Interview[]>('/interviews'),
  getById: (id: number) => api.get<Interview>(`/interviews/${id}`),
  getUpcoming: () => api.get<Interview[]>('/interviews/upcoming'),
  create: (data: Interview) => api.post<Interview>('/interviews', data),
  start: (id: number) => api.post(`/interviews/${id}/start`),
  end: (id: number) => api.post(`/interviews/${id}/end`),
  delete: (id: number) => api.delete(`/interviews/${id}`)
};

export const questionAPI = {
  getAll: () => api.get<Question[]>('/questions'),
  getByPosition: (position: string) => api.get<Question[]>(`/questions/position/${position}`),
  generate: (data: { position: string; candidateName?: string; resumeText?: string }) =>
    api.post<Question[]>('/questions/generate', data),
  create: (data: Question) => api.post<Question>('/questions', data),
  selectForInterview: (interviewId: number, questionId: number) =>
    api.post('/questions/select', { interviewId, questionId }),
  getSelectedQuestions: (interviewId: number) =>
    api.get<SelectedQuestion[]>(`/questions/interview/${interviewId}`),
  markCompleted: (id: number, notes?: string) =>
    api.put(`/questions/selected/${id}/complete`, { notes }),
  removeSelected: (id: number) => api.delete(`/questions/selected/${id}`),
  delete: (id: number) => api.delete(`/questions/${id}`)
};

export const evaluationAPI = {
  save: (data: Evaluation) => api.post('/evaluations', data),
  getByInterviewId: (interviewId: number) => api.get<Evaluation>(`/evaluations/interview/${interviewId}`)
};

export const feedbackAPI = {
  submit: (data: Feedback) => api.post('/feedback', data),
  getByInterviewId: (interviewId: number) => api.get<Feedback>(`/feedback/interview/${interviewId}`),
  getAll: () => api.get<Feedback[]>('/feedback')
};

export default api;
