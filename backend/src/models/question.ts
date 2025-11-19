import db from '../db/database';

export interface Question {
  id?: number;
  category: string; // '직무경험' | '이력서기반' | '일반역량'
  content: string;
  position?: string;
  metadata?: string;
  created_at?: string;
}

export interface SelectedQuestion {
  id?: number;
  interview_id: number;
  question_id: number;
  is_completed?: number;
  notes?: string;
  created_at?: string;
}

export interface SelectedQuestionWithDetails extends SelectedQuestion {
  question_category?: string;
  question_content?: string;
  question_position?: string;
}

export class QuestionModel {
  static create(question: Question): Question {
    const stmt = db.prepare(`
      INSERT INTO questions (category, content, position, metadata)
      VALUES (?, ?, ?, ?)
    `);

    const result = stmt.run(
      question.category,
      question.content,
      question.position,
      question.metadata
    );

    return { ...question, id: Number(result.lastInsertRowid) };
  }

  static findById(id: number): Question | undefined {
    const stmt = db.prepare('SELECT * FROM questions WHERE id = ?');
    return stmt.get(id) as Question | undefined;
  }

  static findByPosition(position: string): Question[] {
    const stmt = db.prepare(`
      SELECT * FROM questions
      WHERE position = ? OR position IS NULL
      ORDER BY category, created_at DESC
    `);
    return stmt.all(position) as Question[];
  }

  static findByCategory(category: string): Question[] {
    const stmt = db.prepare('SELECT * FROM questions WHERE category = ? ORDER BY created_at DESC');
    return stmt.all(category) as Question[];
  }

  static findAll(): Question[] {
    const stmt = db.prepare('SELECT * FROM questions ORDER BY category, created_at DESC');
    return stmt.all() as Question[];
  }

  static selectQuestionForInterview(interviewId: number, questionId: number): SelectedQuestion {
    const stmt = db.prepare(`
      INSERT INTO selected_questions (interview_id, question_id)
      VALUES (?, ?)
    `);

    const result = stmt.run(interviewId, questionId);
    return {
      id: Number(result.lastInsertRowid),
      interview_id: interviewId,
      question_id: questionId
    };
  }

  static getSelectedQuestions(interviewId: number): SelectedQuestionWithDetails[] {
    const stmt = db.prepare(`
      SELECT
        sq.*,
        q.category as question_category,
        q.content as question_content,
        q.position as question_position
      FROM selected_questions sq
      LEFT JOIN questions q ON sq.question_id = q.id
      WHERE sq.interview_id = ?
      ORDER BY sq.created_at ASC
    `);
    return stmt.all(interviewId) as SelectedQuestionWithDetails[];
  }

  static markQuestionCompleted(selectedQuestionId: number, notes?: string): boolean {
    const stmt = db.prepare(`
      UPDATE selected_questions
      SET is_completed = 1, notes = ?
      WHERE id = ?
    `);
    const result = stmt.run(notes || null, selectedQuestionId);
    return result.changes > 0;
  }

  static removeSelectedQuestion(selectedQuestionId: number): boolean {
    const stmt = db.prepare('DELETE FROM selected_questions WHERE id = ?');
    const result = stmt.run(selectedQuestionId);
    return result.changes > 0;
  }

  static delete(id: number): boolean {
    const stmt = db.prepare('DELETE FROM questions WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }
}
