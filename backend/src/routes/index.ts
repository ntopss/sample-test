import express from 'express';
import * as candidateController from '../controllers/candidateController';
import * as interviewController from '../controllers/interviewController';
import * as questionController from '../controllers/questionController';
import * as evaluationController from '../controllers/evaluationController';
import * as feedbackController from '../controllers/feedbackController';

const router = express.Router();

// Candidate routes
router.post('/candidates', candidateController.createCandidate);
router.get('/candidates', candidateController.getAllCandidates);
router.get('/candidates/:id', candidateController.getCandidateById);
router.put('/candidates/:id', candidateController.updateCandidate);
router.delete('/candidates/:id', candidateController.deleteCandidate);

// Interview routes
router.post('/interviews', interviewController.createInterview);
router.get('/interviews', interviewController.getAllInterviews);
router.get('/interviews/upcoming', interviewController.getUpcomingInterviews);
router.get('/interviews/:id', interviewController.getInterviewById);
router.post('/interviews/:id/start', interviewController.startInterview);
router.post('/interviews/:id/end', interviewController.endInterview);
router.delete('/interviews/:id', interviewController.deleteInterview);

// Question routes
router.post('/questions', questionController.createQuestion);
router.get('/questions', questionController.getAllQuestions);
router.get('/questions/position/:position', questionController.getQuestionsByPosition);
router.post('/questions/generate', questionController.generateQuestionsForInterview);
router.post('/questions/select', questionController.selectQuestionForInterview);
router.get('/questions/interview/:interviewId', questionController.getSelectedQuestions);
router.put('/questions/selected/:id/complete', questionController.markQuestionCompleted);
router.delete('/questions/selected/:id', questionController.removeSelectedQuestion);
router.delete('/questions/:id', questionController.deleteQuestion);

// Evaluation routes
router.post('/evaluations', evaluationController.saveEvaluation);
router.get('/evaluations/interview/:interviewId', evaluationController.getEvaluationByInterviewId);

// Feedback routes
router.post('/feedback', feedbackController.submitFeedback);
router.get('/feedback/interview/:interviewId', feedbackController.getFeedbackByInterviewId);
router.get('/feedback', feedbackController.getAllFeedback);

export default router;
