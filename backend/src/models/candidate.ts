import db from '../db/database';

export interface Candidate {
  id?: number;
  name: string;
  position: string;
  experience_years?: number;
  education?: string;
  resume_url?: string;
  created_at?: string;
}

export class CandidateModel {
  static create(candidate: Candidate): Candidate {
    const stmt = db.prepare(`
      INSERT INTO candidates (name, position, experience_years, education, resume_url)
      VALUES (?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      candidate.name,
      candidate.position,
      candidate.experience_years,
      candidate.education,
      candidate.resume_url
    );

    return { ...candidate, id: Number(result.lastInsertRowid) };
  }

  static findById(id: number): Candidate | undefined {
    const stmt = db.prepare('SELECT * FROM candidates WHERE id = ?');
    return stmt.get(id) as Candidate | undefined;
  }

  static findAll(): Candidate[] {
    const stmt = db.prepare('SELECT * FROM candidates ORDER BY created_at DESC');
    return stmt.all() as Candidate[];
  }

  static update(id: number, candidate: Partial<Candidate>): boolean {
    const fields = Object.keys(candidate).filter(k => k !== 'id');
    const values = fields.map(k => candidate[k as keyof Candidate]);

    const stmt = db.prepare(`
      UPDATE candidates
      SET ${fields.map(f => `${f} = ?`).join(', ')}
      WHERE id = ?
    `);

    const result = stmt.run(...values, id);
    return result.changes > 0;
  }

  static delete(id: number): boolean {
    const stmt = db.prepare('DELETE FROM candidates WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }
}
