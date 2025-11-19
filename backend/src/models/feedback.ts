import db from '../db/database';

export interface FeedbackSurvey {
  id?: number;
  interview_id: number;
  interviewer_attitude_score?: number;
  question_relevance_score?: number;
  company_impression_score?: number;
  improvement_feedback?: string;
  created_at?: string;
}

export class FeedbackModel {
  static create(feedback: FeedbackSurvey): FeedbackSurvey {
    const stmt = db.prepare(`
      INSERT INTO feedback_surveys (
        interview_id, interviewer_attitude_score, question_relevance_score,
        company_impression_score, improvement_feedback
      )
      VALUES (?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      feedback.interview_id,
      feedback.interviewer_attitude_score,
      feedback.question_relevance_score,
      feedback.company_impression_score,
      feedback.improvement_feedback
    );

    return { ...feedback, id: Number(result.lastInsertRowid) };
  }

  static findByInterviewId(interviewId: number): FeedbackSurvey | undefined {
    const stmt = db.prepare('SELECT * FROM feedback_surveys WHERE interview_id = ?');
    return stmt.get(interviewId) as FeedbackSurvey | undefined;
  }

  static findAll(): FeedbackSurvey[] {
    const stmt = db.prepare('SELECT * FROM feedback_surveys ORDER BY created_at DESC');
    return stmt.all() as FeedbackSurvey[];
  }
}
