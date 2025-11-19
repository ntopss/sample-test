import { Request, Response } from 'express';
import { QuestionModel } from '../models/question';
import { claudeService } from '../services/claudeService';

export const createQuestion = (req: Request, res: Response) => {
  try {
    const question = QuestionModel.create(req.body);
    res.status(201).json(question);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create question' });
  }
};

export const getAllQuestions = (req: Request, res: Response) => {
  try {
    const questions = QuestionModel.findAll();
    res.json(questions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
};

export const getQuestionsByPosition = (req: Request, res: Response) => {
  try {
    const questions = QuestionModel.findByPosition(req.params.position);
    res.json(questions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
};

export const generateQuestionsForInterview = async (req: Request, res: Response) => {
  try {
    const { position, candidateName, resumeText } = req.body;

    const questions = await claudeService.generateInterviewQuestions({
      position,
      candidateName,
      resumeText
    });

    res.json(questions);
  } catch (error) {
    console.error('Failed to generate questions:', error);
    res.status(500).json({ error: 'Failed to generate questions' });
  }
};

export const selectQuestionForInterview = (req: Request, res: Response) => {
  try {
    const { interviewId, questionId } = req.body;
    const selected = QuestionModel.selectQuestionForInterview(interviewId, questionId);
    res.status(201).json(selected);
  } catch (error) {
    res.status(500).json({ error: 'Failed to select question' });
  }
};

export const getSelectedQuestions = (req: Request, res: Response) => {
  try {
    const questions = QuestionModel.getSelectedQuestions(Number(req.params.interviewId));
    res.json(questions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch selected questions' });
  }
};

export const markQuestionCompleted = (req: Request, res: Response) => {
  try {
    const { notes } = req.body;
    const success = QuestionModel.markQuestionCompleted(Number(req.params.id), notes);

    if (!success) {
      return res.status(404).json({ error: 'Selected question not found' });
    }

    res.json({ message: 'Question marked as completed' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to mark question as completed' });
  }
};

export const removeSelectedQuestion = (req: Request, res: Response) => {
  try {
    const success = QuestionModel.removeSelectedQuestion(Number(req.params.id));

    if (!success) {
      return res.status(404).json({ error: 'Selected question not found' });
    }

    res.json({ message: 'Selected question removed' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove selected question' });
  }
};

export const deleteQuestion = (req: Request, res: Response) => {
  try {
    const success = QuestionModel.delete(Number(req.params.id));
    if (!success) {
      return res.status(404).json({ error: 'Question not found' });
    }
    res.json({ message: 'Question deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete question' });
  }
};
