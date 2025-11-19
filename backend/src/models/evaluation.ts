import db from '../db/database';

export interface Evaluation {
  id?: number;
  interview_id: number;
  job_fit_score?: number;
  experience_verification_score?: number;
  communication_score?: number;
  culture_fit_score?: number;
  notes?: string;
  recommendation?: string; // '적극추천' | '추천' | '보류' | '불합격'
  created_at?: string;
}

export class EvaluationModel {
  static createOrUpdate(evaluation: Evaluation): Evaluation {
    // Check if evaluation exists
    const existing = this.findByInterviewId(evaluation.interview_id);

    if (existing) {
      this.update(existing.id!, evaluation);
      return { ...evaluation, id: existing.id };
    }

    const stmt = db.prepare(`
      INSERT INTO evaluations (
        interview_id, job_fit_score, experience_verification_score,
        communication_score, culture_fit_score, notes, recommendation
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      evaluation.interview_id,
      evaluation.job_fit_score,
      evaluation.experience_verification_score,
      evaluation.communication_score,
      evaluation.culture_fit_score,
      evaluation.notes,
      evaluation.recommendation
    );

    return { ...evaluation, id: Number(result.lastInsertRowid) };
  }

  static findByInterviewId(interviewId: number): Evaluation | undefined {
    const stmt = db.prepare('SELECT * FROM evaluations WHERE interview_id = ?');
    return stmt.get(interviewId) as Evaluation | undefined;
  }

  static update(id: number, evaluation: Partial<Evaluation>): boolean {
    const fields = Object.keys(evaluation).filter(k => k !== 'id' && k !== 'interview_id');
    const values = fields.map(k => evaluation[k as keyof Evaluation]);

    const stmt = db.prepare(`
      UPDATE evaluations
      SET ${fields.map(f => `${f} = ?`).join(', ')}
      WHERE id = ?
    `);

    const result = stmt.run(...values, id);
    return result.changes > 0;
  }
}
