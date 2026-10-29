export type QuestionType = 'mcq' | 'short' | 'long';

export interface Question {
  id: number;
  type: QuestionType;
  text: string;
  options?: string[];
  answer?: string;
  marks?: number; // Default 1
}

export interface Exam {
  id: string;
  title: string;
  className: string;
  accessCode: string;
  questions: Question[];
  negativeMarkingEnabled?: boolean;
  negativeMarkingPercent?: number; // e.g. 25 for 25% penalty (0.25 per 1 mark)
  marksPerQuestion?: number; // default 1
  durationMinutes?: number; // default 30
  createdAt?: string;
}

export interface QuestionReviewItem {
  questionId: number;
  questionText: string;
  type: QuestionType;
  studentAnswer: string | null;
  correctAnswer?: string;
  isCorrect: boolean;
  isAttempted: boolean;
  marksAwarded: number; // positive for correct, negative for penalty, 0 for unattempted
}

export interface ExamResult {
  id: string;
  studentEmail: string;
  studentName: string;
  examId: string;
  examTitle: string;
  className: string;
  totalQuestions: number;
  attemptedCount: number;
  unattemptedCount: number;
  correctCount: number;
  incorrectCount: number;
  negativeMarkingEnabled: boolean;
  negativeMarkingPercent: number; // e.g. 25
  marksPerQuestion: number; // default 1
  penaltyPerWrongAnswer: number; // (marksPerQuestion * negativeMarkingPercent) / 100
  totalDeduction: number; // incorrectCount * penaltyPerWrongAnswer
  rawScore: number; // correctCount * marksPerQuestion
  finalScore: number; // Math.max(0, rawScore - totalDeduction)
  maxPossibleScore: number;
  percentage: number;
  violations: number;
  status: 'Submitted' | 'Auto Submitted';
  submitReason: string;
  submittedAt: string;
  questionReviews?: QuestionReviewItem[];
}
