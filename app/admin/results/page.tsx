'use client';

import { useState, useEffect } from 'react';
import { 
  Percent, 
  Search, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  MinusCircle, 
  ShieldAlert, 
  Eye, 
  X,
  Download,
  Filter
} from 'lucide-react';
import { ExamResult } from '@/lib/types';
import { formatMarks } from '@/lib/scoring';

const DEFAULT_SAMPLE_RESULTS: ExamResult[] = [
  {
    id: 'res-sample-1',
    studentName: 'Priya Singh',
    studentEmail: 'priya.singh@example.com',
    examId: 'demo-exam-101',
    examTitle: 'JavaScript Fundamentals & Logic',
    className: 'Class 10th - Computer Science',
    totalQuestions: 5,
    attemptedCount: 4,
    unattemptedCount: 1,
    correctCount: 3,
    incorrectCount: 1,
    negativeMarkingEnabled: true,
    negativeMarkingPercent: 25,
    marksPerQuestion: 1,
    penaltyPerWrongAnswer: 0.25,
    totalDeduction: 0.25,
    rawScore: 3,
    finalScore: 2.75,
    maxPossibleScore: 5,
    percentage: 55.0,
    violations: 2,
    status: 'Submitted',
    submitReason: 'Completed by Student',
    submittedAt: new Date(Date.now() - 3600000).toISOString(),
    questionReviews: [
      {
        questionId: 1,
        questionText: "What does 'typeof null' return in JavaScript?",
        type: 'mcq',
        studentAnswer: "'object'",
        correctAnswer: "'object'",
        isCorrect: true,
        isAttempted: true,
        marksAwarded: 1,
      },
      {
        questionId: 2,
        questionText: "Which method is used to remove the last element from an array?",
        type: 'mcq',
        studentAnswer: "shift()",
        correctAnswer: "pop()",
        isCorrect: false,
        isAttempted: true,
        marksAwarded: -0.25,
      },
      {
        questionId: 3,
        questionText: "Which keyword is used to declare a block-scoped variable in modern JavaScript?",
        type: 'mcq',
        studentAnswer: "let",
        correctAnswer: "let",
        isCorrect: true,
        isAttempted: true,
        marksAwarded: 1,
      },
      {
        questionId: 4,
        questionText: "What is the output of '2' + 2 in JavaScript?",
        type: 'mcq',
        studentAnswer: "'22'",
        correctAnswer: "'22'",
        isCorrect: true,
        isAttempted: true,
        marksAwarded: 1,
      },
      {
        questionId: 5,
        questionText: "What does JSON stand for?",
        type: 'short',
        studentAnswer: null,
        correctAnswer: "JavaScript Object Notation",
        isCorrect: false,
        isAttempted: false,
        marksAwarded: 0,
      },
    ],
  },
  {
    id: 'res-sample-2',
    studentName: 'Rahul Kumar',
    studentEmail: 'rahul.kumar@example.com',
    examId: 'demo-exam-101',
    examTitle: 'JavaScript Fundamentals & Logic',
    className: 'Class 10th - Computer Science',
    totalQuestions: 5,
    attemptedCount: 5,
    unattemptedCount: 0,
    correctCount: 2,
    incorrectCount: 3,
    negativeMarkingEnabled: true,
    negativeMarkingPercent: 25,
    marksPerQuestion: 1,
    penaltyPerWrongAnswer: 0.25,
    totalDeduction: 0.75,
    rawScore: 2,
    finalScore: 1.25,
    maxPossibleScore: 5,
    percentage: 25.0,
    violations: 3,
    status: 'Auto Submitted',
    submitReason: 'Suspicious Activity Limit Reached: Tab Switch Detected',
    submittedAt: new Date(Date.now() - 7200000).toISOString(),
    questionReviews: [
      {
        questionId: 1,
        questionText: "What does 'typeof null' return in JavaScript?",
        type: 'mcq',
        studentAnswer: "'null'",
        correctAnswer: "'object'",
        isCorrect: false,
        isAttempted: true,
        marksAwarded: -0.25,
      },
      {
        questionId: 2,
        questionText: "Which method is used to remove the last element from an array?",
        type: 'mcq',
        studentAnswer: "pop()",
        correctAnswer: "pop()",
        isCorrect: true,
        isAttempted: true,
        marksAwarded: 1,
      },
      {
        questionId: 3,
        questionText: "Which keyword is used to declare a block-scoped variable in modern JavaScript?",
        type: 'mcq',
        studentAnswer: "var",
        correctAnswer: "let",
        isCorrect: false,
        isAttempted: true,
        marksAwarded: -0.25,
      },
      {
        questionId: 4,
        questionText: "What is the output of '2' + 2 in JavaScript?",
        type: 'mcq',
        studentAnswer: "4",
        correctAnswer: "'22'",
        isCorrect: false,
        isAttempted: true,
        marksAwarded: -0.25,
      },
      {
        questionId: 5,
        questionText: "What does JSON stand for?",
        type: 'short',
        studentAnswer: "JavaScript Object Notation",
        correctAnswer: "JavaScript Object Notation",
        isCorrect: true,
        isAttempted: true,
        marksAwarded: 1,
      },
    ],
  },
];

export default function ResultsPage() {
  const [results, setResults] = useState<ExamResult[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('examsApp_results');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        } catch (e) {
          console.error('Failed to parse results', e);
        }
      }
    }
    return DEFAULT_SAMPLE_RESULTS;
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedResult, setSelectedResult] = useState<ExamResult | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('examsApp_results');
    if (!saved) {
      localStorage.setItem('examsApp_results', JSON.stringify(DEFAULT_SAMPLE_RESULTS));
    }
  }, []);

  const clearAllResults = () => {
    if (confirm("Are you sure you want to clear all exam submission results?")) {
      setResults([]);
      localStorage.setItem('examsApp_results', JSON.stringify([]));
    }
  };

  const filtered = results.filter((r) => {
    const q = searchTerm.toLowerCase();
    return (
      r.studentName.toLowerCase().includes(q) ||
      r.studentEmail.toLowerCase().includes(q) ||
      r.examTitle.toLowerCase().includes(q) ||
      r.className.toLowerCase().includes(q)
    );
  });

  // Calculate summary metrics
  const totalSubmissions = results.length;
  const totalPenaltiesDeducted = results.reduce((acc, curr) => acc + (curr.totalDeduction || 0), 0);
  const avgScorePercent = totalSubmissions > 0 
    ? Math.round(results.reduce((acc, curr) => acc + (curr.percentage || 0), 0) / totalSubmissions) 
    : 0;
  const autoSubmittedCount = results.filter(r => r.status === 'Auto Submitted').length;

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Exam Results & Score Reports</h1>
          <p className="mt-1 text-sm text-gray-600">
            Real-time scoring logs, negative marking penalties, and proctoring violation alerts.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex gap-2">
          {results.length > 0 && (
            <button
              onClick={clearAllResults}
              className="inline-flex items-center px-3.5 py-2 border border-gray-300 text-xs font-medium rounded-md text-red-700 bg-white hover:bg-red-50 transition"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1.5" />
              Clear Results
            </button>
          )}
        </div>
      </div>

      {/* Analytics Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Submissions</span>
          <div className="text-2xl font-bold text-gray-900 mt-1">{totalSubmissions}</div>
          <span className="text-xs text-gray-500">Across all exams</span>
        </div>

        <div className="bg-amber-50 p-5 rounded-xl border border-amber-200 shadow-xs">
          <span className="text-xs font-semibold text-amber-800 uppercase tracking-wider flex items-center">
            <Percent className="w-3.5 h-3.5 mr-1 text-amber-700" />
            Total Negative Penalties
          </span>
          <div className="text-2xl font-bold text-amber-900 mt-1">
            -{formatMarks(totalPenaltiesDeducted)} pts
          </div>
          <span className="text-xs text-amber-700">Deducted for incorrect answers</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Average Score</span>
          <div className="text-2xl font-bold text-purple-700 mt-1">{avgScorePercent}%</div>
          <span className="text-xs text-gray-500">Net score with penalties</span>
        </div>

        <div className="bg-red-50 p-5 rounded-xl border border-red-200 shadow-xs">
          <span className="text-xs font-semibold text-red-800 uppercase tracking-wider">Auto-Submissions</span>
          <div className="text-2xl font-bold text-red-700 mt-1">{autoSubmittedCount}</div>
          <span className="text-xs text-red-600">Triggered by proctor alerts</span>
        </div>
      </div>

      {/* Search and Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3 bg-gray-50/50">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search student, email or exam..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-sm border border-gray-300 rounded-lg bg-white focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
          <span className="text-xs text-gray-500 self-end sm:self-center">
            Showing {filtered.length} of {results.length} result(s)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500 font-semibold">
              <tr>
                <th className="py-3.5 pl-6 pr-3">Student</th>
                <th className="px-3 py-3.5">Exam & Class</th>
                <th className="px-3 py-3.5">Final Score</th>
                <th className="px-3 py-3.5">Negative Penalty</th>
                <th className="px-3 py-3.5">Accuracy Breakdown</th>
                <th className="px-3 py-3.5">Proctoring Status</th>
                <th className="py-3.5 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-500 text-sm">
                    No results found matching your criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((res) => (
                  <tr key={res.id} className="hover:bg-gray-50/80 transition">
                    <td className="py-4 pl-6 pr-3 whitespace-nowrap">
                      <div className="font-semibold text-gray-900">{res.studentName}</div>
                      <div className="text-xs text-gray-500">{res.studentEmail}</div>
                    </td>

                    <td className="px-3 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{res.examTitle}</div>
                      <div className="text-xs text-gray-500">{res.className}</div>
                    </td>

                    <td className="px-3 py-4 whitespace-nowrap">
                      <div className="font-bold text-gray-900">
                        {formatMarks(res.finalScore)} <span className="text-xs text-gray-500 font-normal">/ {res.maxPossibleScore}</span>
                      </div>
                      <span className="inline-block text-[11px] font-semibold text-purple-700 bg-purple-50 px-1.5 py-0.2 rounded mt-0.5">
                        {res.percentage}%
                      </span>
                    </td>

                    <td className="px-3 py-4 whitespace-nowrap">
                      {res.negativeMarkingEnabled ? (
                        <div>
                          <span className="text-xs font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded">
                            -{formatMarks(res.totalDeduction)} pts
                          </span>
                          <div className="text-[11px] text-gray-500 mt-0.5">
                            {res.negativeMarkingPercent}% penalty ({res.incorrectCount} wrong)
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">None (0%)</span>
                      )}
                    </td>

                    <td className="px-3 py-4 whitespace-nowrap text-xs">
                      <div className="flex items-center space-x-2">
                        <span className="text-green-700 font-semibold" title="Correct">
                          ✓ {res.correctCount}
                        </span>
                        <span className="text-red-700 font-semibold" title="Incorrect">
                          ✗ {res.incorrectCount}
                        </span>
                        <span className="text-gray-500 font-medium" title="Unattempted">
                          ○ {res.unattemptedCount}
                        </span>
                      </div>
                      <div className="text-[11px] text-gray-500 mt-0.5">
                        Raw: {formatMarks(res.rawScore)} pts
                      </div>
                    </td>

                    <td className="px-3 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        res.status === 'Submitted'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {res.status}
                      </span>
                      {res.violations > 0 && (
                        <div className="text-[11px] text-red-600 font-medium mt-0.5">
                          {res.violations} warning(s)
                        </div>
                      )}
                    </td>

                    <td className="py-4 pr-6 text-right whitespace-nowrap">
                      <button
                        onClick={() => setSelectedResult(res)}
                        className="inline-flex items-center text-xs font-semibold text-purple-600 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 px-2.5 py-1.5 rounded-md transition"
                      >
                        <Eye className="w-3.5 h-3.5 mr-1" />
                        Breakdown
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detailed Question Review Modal */}
      {selectedResult && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col border border-gray-200 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-purple-50/60 rounded-t-2xl">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  {selectedResult.studentName}&apos;s Scoring Breakdown
                </h3>
                <p className="text-xs text-gray-600">
                  {selectedResult.examTitle} • {selectedResult.className}
                </p>
              </div>
              <button
                onClick={() => setSelectedResult(null)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Scoring Summary Pill Box */}
              <div className="grid grid-cols-3 gap-3 bg-gray-50 p-4 rounded-xl border border-gray-200 text-center">
                <div>
                  <span className="text-xs text-gray-500 font-medium">Final Score</span>
                  <div className="text-xl font-bold text-gray-900 mt-0.5">
                    {formatMarks(selectedResult.finalScore)} / {selectedResult.maxPossibleScore}
                  </div>
                  <span className="text-[11px] text-purple-600 font-semibold">{selectedResult.percentage}%</span>
                </div>

                <div>
                  <span className="text-xs text-gray-500 font-medium">Negative Deduction</span>
                  <div className="text-xl font-bold text-red-600 mt-0.5">
                    -{formatMarks(selectedResult.totalDeduction)}
                  </div>
                  <span className="text-[11px] text-amber-700 font-medium">
                    {selectedResult.negativeMarkingPercent}% penalty
                  </span>
                </div>

                <div>
                  <span className="text-xs text-gray-500 font-medium">Attempted</span>
                  <div className="text-xl font-bold text-gray-900 mt-0.5">
                    {selectedResult.attemptedCount} / {selectedResult.totalQuestions}
                  </div>
                  <span className="text-[11px] text-gray-500">
                    {selectedResult.unattemptedCount} skipped
                  </span>
                </div>
              </div>

              {/* Questions List */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Question-by-Question Marking Logs
                </h4>

                {selectedResult.questionReviews && selectedResult.questionReviews.length > 0 ? (
                  selectedResult.questionReviews.map((q, idx) => (
                    <div
                      key={q.questionId}
                      className={`p-3.5 rounded-xl border text-xs space-y-2 ${
                        !q.isAttempted
                          ? 'bg-gray-50 border-gray-200'
                          : q.isCorrect
                          ? 'bg-green-50/60 border-green-200'
                          : 'bg-red-50/60 border-red-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-semibold text-gray-900">
                          Q{idx + 1}. {q.questionText}
                        </span>
                        <span className={`shrink-0 font-bold px-2 py-0.5 rounded text-[11px] ${
                          !q.isAttempted
                            ? 'bg-gray-200 text-gray-700'
                            : q.isCorrect
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {q.marksAwarded > 0 ? `+${formatMarks(q.marksAwarded)} pts` : `${formatMarks(q.marksAwarded)} pts`}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <div>
                          <span className="text-gray-500 block">Student Answer:</span>
                          <span className={`font-semibold ${
                            !q.isAttempted ? 'text-gray-400 italic' : q.isCorrect ? 'text-green-800' : 'text-red-700'
                          }`}>
                            {q.studentAnswer || 'Not Attempted'}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500 block">Correct Answer:</span>
                          <span className="font-semibold text-gray-900">{q.correctAnswer || 'Not set'}</span>
                        </div>
                      </div>

                      {q.isAttempted && !q.isCorrect && selectedResult.negativeMarkingEnabled && (
                        <p className="text-[11px] text-red-600 font-medium">
                          ⚠️ Penalty of -{formatMarks(Math.abs(q.marksAwarded))} applied for this wrong answer ({selectedResult.negativeMarkingPercent}% penalty rule).
                        </p>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-500">No question breakdown logged for this attempt.</p>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 border-t border-gray-200 bg-gray-50 rounded-b-2xl flex justify-end">
              <button
                onClick={() => setSelectedResult(null)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg text-xs font-semibold transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
