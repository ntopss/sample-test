import { Request, Response } from 'express';
import { InterviewModel } from '../models/interview';
import { emailService } from '../services/emailService';

export const createInterview = async (req: Request, res: Response) => {
  try {
    const interview = InterviewModel.create(req.body);

    // Get full interview details with candidate info
    const interviewDetails = InterviewModel.findById(interview.id!);

    // Schedule D-1 reminder email (will be handled by scheduler)
    res.status(201).json(interviewDetails);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create interview' });
  }
};

export const getAllInterviews = (req: Request, res: Response) => {
  try {
    const interviews = InterviewModel.findAll();
    res.json(interviews);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch interviews' });
  }
};

export const getInterviewById = (req: Request, res: Response) => {
  try {
    const interview = InterviewModel.findById(Number(req.params.id));
    if (!interview) {
      return res.status(404).json({ error: 'Interview not found' });
    }
    res.json(interview);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch interview' });
  }
};

export const getUpcomingInterviews = (req: Request, res: Response) => {
  try {
    const interviews = InterviewModel.findUpcoming();
    res.json(interviews);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch upcoming interviews' });
  }
};

export const startInterview = (req: Request, res: Response) => {
  try {
    const success = InterviewModel.startInterview(Number(req.params.id));
    if (!success) {
      return res.status(404).json({ error: 'Interview not found' });
    }
    res.json({ message: 'Interview started successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to start interview' });
  }
};

export const endInterview = async (req: Request, res: Response) => {
  try {
    const interviewId = Number(req.params.id);
    const success = InterviewModel.endInterview(interviewId);

    if (!success) {
      return res.status(404).json({ error: 'Interview not found' });
    }

    // Schedule feedback survey email (2 hours later)
    const interview = InterviewModel.findById(interviewId);
    if (interview) {
      setTimeout(async () => {
        await emailService.sendFeedbackSurvey(interview);
      }, 2 * 60 * 60 * 1000); // 2 hours
    }

    res.json({ message: 'Interview ended successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to end interview' });
  }
};

export const deleteInterview = (req: Request, res: Response) => {
  try {
    const success = InterviewModel.delete(Number(req.params.id));
    if (!success) {
      return res.status(404).json({ error: 'Interview not found' });
    }
    res.json({ message: 'Interview deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete interview' });
  }
};
