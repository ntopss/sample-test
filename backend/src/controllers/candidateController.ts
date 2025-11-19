import { Request, Response } from 'express';
import { CandidateModel } from '../models/candidate';

export const createCandidate = (req: Request, res: Response) => {
  try {
    const candidate = CandidateModel.create(req.body);
    res.status(201).json(candidate);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create candidate' });
  }
};

export const getAllCandidates = (req: Request, res: Response) => {
  try {
    const candidates = CandidateModel.findAll();
    res.json(candidates);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch candidates' });
  }
};

export const getCandidateById = (req: Request, res: Response) => {
  try {
    const candidate = CandidateModel.findById(Number(req.params.id));
    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }
    res.json(candidate);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch candidate' });
  }
};

export const updateCandidate = (req: Request, res: Response) => {
  try {
    const success = CandidateModel.update(Number(req.params.id), req.body);
    if (!success) {
      return res.status(404).json({ error: 'Candidate not found' });
    }
    res.json({ message: 'Candidate updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update candidate' });
  }
};

export const deleteCandidate = (req: Request, res: Response) => {
  try {
    const success = CandidateModel.delete(Number(req.params.id));
    if (!success) {
      return res.status(404).json({ error: 'Candidate not found' });
    }
    res.json({ message: 'Candidate deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete candidate' });
  }
};
