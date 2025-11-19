import { Request, Response } from 'express';
import { EvaluationModel } from '../models/evaluation';

export const saveEvaluation = (req: Request, res: Response) => {
  try {
    const evaluation = EvaluationModel.createOrUpdate(req.body);
    res.status(201).json(evaluation);
  } catch (error) {
    res.status(500).json({ error: 'Failed to save evaluation' });
  }
};

export const getEvaluationByInterviewId = (req: Request, res: Response) => {
  try {
    const evaluation = EvaluationModel.findByInterviewId(Number(req.params.interviewId));
    if (!evaluation) {
      return res.status(404).json({ error: 'Evaluation not found' });
    }
    res.json(evaluation);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch evaluation' });
  }
};
