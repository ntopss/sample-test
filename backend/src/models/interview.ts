import db from '../db/database';

export interface Interview {
  id?: number;
  candidate_id: number;
  interviewer_name: string;
  interviewer_email: string;
  scheduled_date: string;
  status?: string;
  started_at?: string;
  ended_at?: string;
  created_at?: string;
}

export interface InterviewWithCandidate extends Interview {
  candidate_name?: string;
  candidate_position?: string;
  candidate_experience_years?: number;
  candidate_education?: string;
  candidate_resume_url?: string;
}

export class InterviewModel {
  static create(interview: Interview): Interview {
    const stmt = db.prepare(`
      INSERT INTO interviews (candidate_id, interviewer_name, interviewer_email, scheduled_date, status)
      VALUES (?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      interview.candidate_id,
      interview.interviewer_name,
      interview.interviewer_email,
      interview.scheduled_date,
      interview.status || 'scheduled'
    );

    return { ...interview, id: Number(result.lastInsertRowid) };
  }

  static findById(id: number): InterviewWithCandidate | undefined {
    const stmt = db.prepare(`
      SELECT
        i.*,
        c.name as candidate_name,
        c.position as candidate_position,
        c.experience_years as candidate_experience_years,
        c.education as candidate_education,
        c.resume_url as candidate_resume_url
      FROM interviews i
      LEFT JOIN candidates c ON i.candidate_id = c.id
      WHERE i.id = ?
    `);
    return stmt.get(id) as InterviewWithCandidate | undefined;
  }

  static findAll(): InterviewWithCandidate[] {
    const stmt = db.prepare(`
      SELECT
        i.*,
        c.name as candidate_name,
        c.position as candidate_position,
        c.experience_years as candidate_experience_years,
        c.education as candidate_education,
        c.resume_url as candidate_resume_url
      FROM interviews i
      LEFT JOIN candidates c ON i.candidate_id = c.id
      ORDER BY i.scheduled_date DESC
    `);
    return stmt.all() as InterviewWithCandidate[];
  }

  static findByStatus(status: string): InterviewWithCandidate[] {
    const stmt = db.prepare(`
      SELECT
        i.*,
        c.name as candidate_name,
        c.position as candidate_position,
        c.experience_years as candidate_experience_years,
        c.education as candidate_education,
        c.resume_url as candidate_resume_url
      FROM interviews i
      LEFT JOIN candidates c ON i.candidate_id = c.id
      WHERE i.status = ?
      ORDER BY i.scheduled_date DESC
    `);
    return stmt.all(status) as InterviewWithCandidate[];
  }

  static findUpcoming(): InterviewWithCandidate[] {
    const stmt = db.prepare(`
      SELECT
        i.*,
        c.name as candidate_name,
        c.position as candidate_position,
        c.experience_years as candidate_experience_years,
        c.education as candidate_education,
        c.resume_url as candidate_resume_url
      FROM interviews i
      LEFT JOIN candidates c ON i.candidate_id = c.id
      WHERE datetime(i.scheduled_date) > datetime('now')
      AND i.status = 'scheduled'
      ORDER BY i.scheduled_date ASC
    `);
    return stmt.all() as InterviewWithCandidate[];
  }

  static updateStatus(id: number, status: string): boolean {
    const stmt = db.prepare('UPDATE interviews SET status = ? WHERE id = ?');
    const result = stmt.run(status, id);
    return result.changes > 0;
  }

  static startInterview(id: number): boolean {
    const stmt = db.prepare(`
      UPDATE interviews
      SET status = 'in_progress', started_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    const result = stmt.run(id);
    return result.changes > 0;
  }

  static endInterview(id: number): boolean {
    const stmt = db.prepare(`
      UPDATE interviews
      SET status = 'completed', ended_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    const result = stmt.run(id);
    return result.changes > 0;
  }

  static delete(id: number): boolean {
    const stmt = db.prepare('DELETE FROM interviews WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }
}
