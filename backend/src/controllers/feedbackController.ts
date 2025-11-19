import { Request, Response } from 'express';
import { FeedbackModel } from '../models/feedback';

export const submitFeedback = (req: Request, res: Response) => {
  try {
    const feedback = FeedbackModel.create(req.body);
    res.status(201).json(feedback);
  } catch (error) {
    res.status(500).json({ error: 'Failed to submit feedback' });
  }
};

export const getFeedbackByInterviewId = (req: Request, res: Response) => {
  try {
    const feedback = FeedbackModel.findByInterviewId(Number(req.params.interviewId));
    if (!feedback) {
      return res.status(404).json({ error: 'Feedback not found' });
    }
    res.json(feedback);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch feedback' });
  }
};

export const getAllFeedback = (req: Request, res: Response) => {
  try {
    const feedbacks = FeedbackModel.findAll();
    res.json(feedbacks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch feedback' });
  }
};
