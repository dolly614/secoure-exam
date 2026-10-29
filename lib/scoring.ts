import { Exam, Question, QuestionReviewItem, ExamResult } from './types';

export interface ScoreCalculationInput {
  questions: Question[];
  answers: Record<number, string>;
  negativeMarkingEnabled?: boolean;
  negativeMarkingPercent?: number; // e.g. 25
  marksPerQuestion?: number; // default 1
}

export interface ScoreCalculationResult {
  totalQuestions: number;
  attemptedCount: number;
  unattemptedCount: number;
  correctCount: number;
  incorrectCount: number;
  negativeMarkingEnabled: boolean;
  negativeMarkingPercent: number;
  marksPerQuestion: number;
  penaltyPerWrongAnswer: number;
  totalDeduction: number;
  rawScore: number;
  finalScore: number;
  maxPossibleScore: number;
  percentage: number;
  questionReviews: QuestionReviewItem[];
}

export function calculateExamScore(input: ScoreCalculationInput): ScoreCalculationResult {
  const {
    questions,
    answers,
    negativeMarkingEnabled = false,
    negativeMarkingPercent = 0,
    marksPerQuestion = 1,
  } = input;

  let correctCount = 0;
  let incorrectCount = 0;
  let unattemptedCount = 0;

  // Penalty per wrong answer in marks
  // e.g. 25% of 1 mark = 0.25 marks penalty
  const penaltyPerWrongAnswer = negativeMarkingEnabled
    ? Number(((marksPerQuestion * negativeMarkingPercent) / 100).toFixed(4))
    : 0;

  const questionReviews: QuestionReviewItem[] = [];

  questions.forEach((q) => {
    const rawStudentAns = answers[q.id];
    const isAttempted = rawStudentAns !== undefined && rawStudentAns !== null && rawStudentAns.trim() !== '';
    const studentAnswer = isAttempted ? rawStudentAns.trim() : null;

    if (!isAttempted) {
      unattemptedCount++;
      questionReviews.push({
        questionId: q.id,
        questionText: q.text,
        type: q.type,
        studentAnswer: null,
        correctAnswer: q.answer,
        isCorrect: false,
        isAttempted: false,
        marksAwarded: 0,
      });
      return;
    }

    let isCorrect = false;

    if (q.type === 'mcq') {
      if (q.answer && studentAnswer?.toLowerCase() === q.answer.trim().toLowerCase()) {
        isCorrect = true;
      }
    } else {
      // Short or long answer
      if (q.answer && q.answer.trim()) {
        if (studentAnswer?.toLowerCase() === q.answer.trim().toLowerCase()) {
          isCorrect = true;
        }
      } else {
        // If no strict answer rubric provided, treat non-empty submission as awarded or manual review
        isCorrect = true;
      }
    }

    if (isCorrect) {
      correctCount++;
      questionReviews.push({
        questionId: q.id,
        questionText: q.text,
        type: q.type,
        studentAnswer,
        correctAnswer: q.answer,
        isCorrect: true,
        isAttempted: true,
        marksAwarded: marksPerQuestion,
      });
    } else {
      incorrectCount++;
      const penalty = negativeMarkingEnabled ? -penaltyPerWrongAnswer : 0;
      questionReviews.push({
        questionId: q.id,
        questionText: q.text,
        type: q.type,
        studentAnswer,
        correctAnswer: q.answer,
        isCorrect: false,
        isAttempted: true,
        marksAwarded: penalty,
      });
    }
  });

  const rawScore = Number((correctCount * marksPerQuestion).toFixed(2));
  const totalDeduction = Number((incorrectCount * penaltyPerWrongAnswer).toFixed(2));
  const calculatedScore = Number((rawScore - totalDeduction).toFixed(2));
  // Score clamped at 0 to avoid negative aggregate score, while preserving exact deduction breakdown
  const finalScore = Math.max(0, calculatedScore);
  const maxPossibleScore = Number((questions.length * marksPerQuestion).toFixed(2));
  const percentage = maxPossibleScore > 0 ? Number(((finalScore / maxPossibleScore) * 100).toFixed(1)) : 0;

  return {
    totalQuestions: questions.length,
    attemptedCount: correctCount + incorrectCount,
    unattemptedCount,
    correctCount,
    incorrectCount,
    negativeMarkingEnabled,
    negativeMarkingPercent,
    marksPerQuestion,
    penaltyPerWrongAnswer,
    totalDeduction,
    rawScore,
    finalScore,
    maxPossibleScore,
    percentage,
    questionReviews,
  };
}

export function formatMarks(num: number): string {
  if (Number.isInteger(num)) {
    return num.toString();
  }
  return num.toFixed(2).replace(/\.?0+$/, '');
}

export const INITIAL_DEFAULT_EXAMS: Exam[] = [
  {
    id: 'demo-exam-101',
    title: 'JavaScript Fundamentals & Logic',
    className: 'Class 10th - Computer Science',
    accessCode: '123456',
    negativeMarkingEnabled: true,
    negativeMarkingPercent: 25, // 25% penalty per wrong answer (-0.25 marks per 1 mark question)
    marksPerQuestion: 1,
    durationMinutes: 30,
    questions: [
      {
        id: 1,
        type: 'mcq',
        text: "What does 'typeof null' return in JavaScript?",
        options: ["'object'", "'null'", "'undefined'", "'number'"],
        answer: "'object'",
      },
      {
        id: 2,
        type: 'mcq',
        text: "Which method is used to remove the last element from an array?",
        options: ["pop()", "push()", "shift()", "unshift()"],
        answer: "pop()",
      },
      {
        id: 3,
        type: 'mcq',
        text: "Which keyword is used to declare a block-scoped variable in modern JavaScript?",
        options: ["let", "var", "scope", "define"],
        answer: "let",
      },
      {
        id: 4,
        type: 'mcq',
        text: "What is the output of '2' + 2 in JavaScript?",
        options: ["'22'", "4", "NaN", "TypeError"],
        answer: "'22'",
      },
      {
        id: 5,
        type: 'short',
        text: "What does JSON stand for?",
        answer: "JavaScript Object Notation",
      },
    ],
  },
  {
    id: 'demo-exam-102',
    title: 'Advanced Mathematics Midterm',
    className: 'Class 12th - Science',
    accessCode: '654321',
    negativeMarkingEnabled: true,
    negativeMarkingPercent: 33.33, // 1/3 mark penalty
    marksPerQuestion: 1,
    durationMinutes: 45,
    questions: [
      {
        id: 11,
        type: 'mcq',
        text: "What is the derivative of sin(x) with respect to x?",
        options: ["cos(x)", "-cos(x)", "-sin(x)", "tan(x)"],
        answer: "cos(x)",
      },
      {
        id: 12,
        type: 'mcq',
        text: "What is the value of log(1) at any valid positive base?",
        options: ["0", "1", "e", "undefined"],
        answer: "0",
      },
    ],
  },
];
