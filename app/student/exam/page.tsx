'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Maximize, 
  ShieldAlert, 
  AlertCircle, 
  Clock, 
  Camera, 
  Percent, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  ArrowRight, 
  RotateCcw,
  MinusCircle,
  FileCheck
} from 'lucide-react';
import { Exam, Question, ExamResult, QuestionReviewItem } from '@/lib/types';
import { calculateExamScore, formatMarks, INITIAL_DEFAULT_EXAMS } from '@/lib/scoring';

export default function ExamPage() {
  // State
  const [hasStarted, setHasStarted] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [streamReady, setStreamReady] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [violations, setViolations] = useState(0);
  const [exam] = useState<Exam>(() => {
    if (typeof window !== 'undefined') {
      const currentExamId = localStorage.getItem('examsApp_currentExamId');
      const savedExams = localStorage.getItem('examsApp_exams');
      if (savedExams) {
        try {
          const parsedExams: Exam[] = JSON.parse(savedExams);
          if (currentExamId) {
            const found = parsedExams.find((e) => e.id === currentExamId);
            if (found && found.questions && found.questions.length > 0) {
              return found;
            }
          } else if (parsedExams.length > 0) {
            return parsedExams[0];
          }
        } catch (e) {
          console.error('Error reading exams from storage', e);
        }
      }
    }
    return INITIAL_DEFAULT_EXAMS[0];
  });

  const [questions] = useState<Question[]>(() => {
    let sourceQuestions = INITIAL_DEFAULT_EXAMS[0].questions;
    if (typeof window !== 'undefined') {
      const currentExamId = localStorage.getItem('examsApp_currentExamId');
      const savedExams = localStorage.getItem('examsApp_exams');
      if (savedExams) {
        try {
          const parsedExams: Exam[] = JSON.parse(savedExams);
          const found = currentExamId ? parsedExams.find((e) => e.id === currentExamId) : parsedExams[0];
          if (found?.questions && found.questions.length > 0) {
            sourceQuestions = found.questions;
          }
        } catch (e) {
          console.error(e);
        }
      }
    }
    // Shuffle questions and options for exam security
    const shuffled = [...sourceQuestions].sort(() => Math.random() - 0.5);
    return shuffled.map((q) => {
      if (q.type === 'mcq' && q.options) {
        return {
          ...q,
          options: [...q.options].sort(() => Math.random() - 0.5),
        };
      }
      return q;
    });
  });

  const [timeLeft, setTimeLeft] = useState(() => (exam.durationMinutes ? exam.durationMinutes * 60 : 30 * 60));
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitReason, setSubmitReason] = useState('');
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [result, setResult] = useState<ExamResult | null>(null);

  const examContainerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    document.title = `${exam.title} - Secure Exam`;
  }, [exam.title]);

  // Submit and Calculate Score with Negative Marking Logic
  const handleAutoSubmit = useCallback((reason: string) => {
    setIsSubmitted(true);
    setSubmitReason(reason);

    if (document.fullscreenElement) {
      document.exitFullscreen().catch((err) => console.error(err));
    }

    // Stop camera media tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }

    // Score calculation
    if (questions.length > 0) {
      const activeExam = exam || INITIAL_DEFAULT_EXAMS[0];
      const negEnabled = activeExam.negativeMarkingEnabled ?? false;
      const negPercent = activeExam.negativeMarkingPercent ?? 0;
      const marksPerQ = activeExam.marksPerQuestion ?? 1;

      const scoreData = calculateExamScore({
        questions,
        answers,
        negativeMarkingEnabled: negEnabled,
        negativeMarkingPercent: negPercent,
        marksPerQuestion: marksPerQ,
      });

      const studentEmail = localStorage.getItem('examsApp_currentStudentEmail') || 'student@example.com';
      const studentName = studentEmail.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

      const finalExamResult: ExamResult = {
        id: `res_${Date.now()}`,
        studentEmail,
        studentName,
        examId: activeExam.id,
        examTitle: activeExam.title,
        className: activeExam.className,
        totalQuestions: scoreData.totalQuestions,
        attemptedCount: scoreData.attemptedCount,
        unattemptedCount: scoreData.unattemptedCount,
        correctCount: scoreData.correctCount,
        incorrectCount: scoreData.incorrectCount,
        negativeMarkingEnabled: scoreData.negativeMarkingEnabled,
        negativeMarkingPercent: scoreData.negativeMarkingPercent,
        marksPerQuestion: scoreData.marksPerQuestion,
        penaltyPerWrongAnswer: scoreData.penaltyPerWrongAnswer,
        totalDeduction: scoreData.totalDeduction,
        rawScore: scoreData.rawScore,
        finalScore: scoreData.finalScore,
        maxPossibleScore: scoreData.maxPossibleScore,
        percentage: scoreData.percentage,
        violations,
        status: reason.toLowerCase().includes('limit') || reason.toLowerCase().includes('tab') || reason.toLowerCase().includes('fullscreen')
          ? 'Auto Submitted'
          : 'Submitted',
        submitReason: reason,
        submittedAt: new Date().toISOString(),
        questionReviews: scoreData.questionReviews,
      };

      setResult(finalExamResult);

      // Save to localStorage results list
      try {
        const storedResults = localStorage.getItem('examsApp_results');
        const resultsList: ExamResult[] = storedResults ? JSON.parse(storedResults) : [];
        resultsList.unshift(finalExamResult);
        localStorage.setItem('examsApp_results', JSON.stringify(resultsList));
      } catch (err) {
        console.error('Failed to save exam results', err);
      }
    }
  }, [answers, exam, questions, violations]);

  const handleViolation = useCallback((reason: string) => {
    if (isSubmitted) return;

    setViolations((prev) => {
      const newCount = prev + 1;
      if (newCount >= 3) {
        handleAutoSubmit(`Suspicious Activity Limit Reached: ${reason}`);
      } else {
        alert(`WARNING: ${reason}. \nThis incident has been logged. \n${3 - newCount} warnings remaining before auto-submit.`);
      }
      return newCount;
    });
  }, [isSubmitted, handleAutoSubmit]);

  // Request camera and microphone
  useEffect(() => {
    if (isSubmitted) return;

    const startMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setStreamReady(true);
      } catch (err) {
        console.error("Error accessing media devices.", err);
      }
    };

    startMedia();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isSubmitted]);

  // Re-attach stream to video element when verified / view changes
  useEffect(() => {
    if (videoRef.current && streamRef.current) {
      if (videoRef.current.srcObject !== streamRef.current) {
        videoRef.current.srcObject = streamRef.current;
      }
    }
  });

  // Countdown timer
  useEffect(() => {
    if (!hasStarted || isSubmitted) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoSubmit('Time Over');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [hasStarted, isSubmitted, handleAutoSubmit]);

  // Prevent Context Menu, Copy, Paste, and DevTools
  useEffect(() => {
    if (!hasStarted || isSubmitted) return;

    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    const handleCopy = (e: ClipboardEvent) => e.preventDefault();
    const handlePaste = (e: ClipboardEvent) => e.preventDefault();
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey && (e.key === 'c' || e.key === 'v')) || e.key === 'F12') {
        e.preventDefault();
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('copy', handleCopy);
    document.addEventListener('paste', handlePaste);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('paste', handlePaste);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [hasStarted, isSubmitted]);

  // Tab Switch & Blur Detection
  useEffect(() => {
    if (!hasStarted || isSubmitted) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        handleViolation('Tab Switch Detected');
      }
    };

    const handleBlur = () => {
      handleViolation('Window lost focus');
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
    };
  }, [hasStarted, isSubmitted, handleViolation]);

  // Fullscreen tracking
  useEffect(() => {
    const onFullscreenChange = () => {
      const isFull = !!document.fullscreenElement;
      setIsFullscreen(isFull);

      if (hasStarted && !isFull && !isSubmitted) {
        handleViolation('Exited Fullscreen');
      }
    };

    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, [hasStarted, isSubmitted, handleViolation]);

  const startExam = async () => {
    if (!examContainerRef.current) return;
    try {
      await examContainerRef.current.requestFullscreen();
      setHasStarted(true);
    } catch (err) {
      console.warn("Fullscreen request error, proceeding anyway", err);
      setHasStarted(true);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const clearSelection = (questionId: number) => {
    setAnswers((prev) => {
      const copy = { ...prev };
      delete copy[questionId];
      return copy;
    });
  };

  const negEnabled = exam?.negativeMarkingEnabled ?? false;
  const negPercent = exam?.negativeMarkingPercent ?? 0;
  const marksPerQ = exam?.marksPerQuestion ?? 1;
  const penaltyPerWrong = negEnabled ? (marksPerQ * negPercent) / 100 : 0;

  // -------------------------------------------------------------
  // 1. RESULT SCREEN WITH DETAILED NEGATIVE MARKING BREAKDOWN
  // -------------------------------------------------------------
  if (isSubmitted && result) {
    return (
      <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Main Score Hero Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-blue-700 px-6 py-8 text-white">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-white/20 text-white backdrop-blur-xs mb-2">
                    <FileCheck className="w-3.5 h-3.5 mr-1.5" />
                    Final Result & Score Analysis
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{result.examTitle}</h1>
                  <p className="text-indigo-100 text-sm mt-1">Student: <strong>{result.studentName}</strong> ({result.studentEmail})</p>
                </div>
                
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 sm:text-right border border-white/20 self-start sm:self-auto">
                  <span className="text-xs uppercase tracking-wider text-indigo-200 block font-medium">Final Score</span>
                  <div className="text-3xl sm:text-4xl font-black mt-0.5">
                    {formatMarks(result.finalScore)} <span className="text-lg text-indigo-200 font-normal">/ {result.maxPossibleScore}</span>
                  </div>
                  <div className="mt-1 text-xs font-semibold bg-white/25 px-2 py-0.5 rounded inline-block">
                    {result.percentage}% Accuracy Score
                  </div>
                </div>
              </div>
            </div>

            {/* Submission Reason and Proctoring Notice */}
            <div className="px-6 py-3 bg-gray-50 border-b border-gray-200 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center text-gray-700 font-medium">
                <span className="text-gray-500 mr-1.5">Submission status:</span>
                <span className={`px-2 py-0.5 rounded font-semibold ${
                  result.status === 'Submitted' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {result.status} ({result.submitReason})
                </span>
              </div>
              <div className="text-gray-500">
                Logged at: {new Date(result.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>

            {/* Negative Marking Calculation Metrics Grid */}
            <div className="p-6">
              <h2 className="text-sm font-bold uppercase tracking-wider text-gray-700 mb-4 flex items-center">
                <Percent className="w-4 h-4 mr-2 text-amber-600" />
                Marking Scheme & Negative Penalty Breakdown
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                  <div className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center mx-auto mb-2">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-semibold text-green-900 block">Correct Answers</span>
                  <div className="text-xl font-bold text-green-800 mt-1">
                    {result.correctCount} / {result.totalQuestions}
                  </div>
                  <span className="text-xs text-green-700 font-medium mt-0.5 block">
                    +{formatMarks(result.rawScore)} marks
                  </span>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                  <div className="w-8 h-8 rounded-full bg-red-100 text-red-700 flex items-center justify-center mx-auto mb-2">
                    <XCircle className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-semibold text-red-900 block">Wrong Answers</span>
                  <div className="text-xl font-bold text-red-800 mt-1">
                    {result.incorrectCount} / {result.totalQuestions}
                  </div>
                  <span className="text-xs text-red-700 font-bold mt-0.5 block">
                    -{formatMarks(result.totalDeduction)} marks penalty
                  </span>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
                  <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center mx-auto mb-2">
                    <MinusCircle className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-semibold text-gray-900 block">Unattempted / Skipped</span>
                  <div className="text-xl font-bold text-gray-800 mt-1">
                    {result.unattemptedCount} / {result.totalQuestions}
                  </div>
                  <span className="text-xs text-gray-600 font-medium mt-0.5 block">
                    0.0 marks deducted
                  </span>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
                  <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto mb-2">
                    <Percent className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-semibold text-amber-900 block">Configured Penalty</span>
                  <div className="text-xl font-bold text-amber-800 mt-1">
                    {result.negativeMarkingEnabled ? `${result.negativeMarkingPercent}%` : '0%'}
                  </div>
                  <span className="text-xs text-amber-700 font-medium mt-0.5 block">
                    {result.negativeMarkingEnabled ? `-${formatMarks(result.penaltyPerWrongAnswer)} per wrong answer` : 'No penalty'}
                  </span>
                </div>
              </div>

              {/* Formula Explanation Callout */}
              <div className="mt-4 p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-900 leading-relaxed">
                <strong>Scoring Calculation Engine:</strong> Raw Score ({formatMarks(result.rawScore)} pts) - Negative Penalty ({result.incorrectCount} incorrect × {formatMarks(result.penaltyPerWrongAnswer)} pts = -{formatMarks(result.totalDeduction)} pts) = <strong>Final Score: {formatMarks(result.finalScore)} pts</strong>.
              </div>
            </div>
          </div>

          {/* Question-by-Question Review with Deductions */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
            <h2 className="text-lg font-bold text-gray-900">Question-by-Question Review</h2>
            <p className="text-xs text-gray-500">
              Review your responses, correct answers, and individual negative marking deductions applied.
            </p>

            <div className="space-y-4 pt-2">
              {result.questionReviews?.map((item, index) => {
                return (
                  <div
                    key={item.questionId}
                    className={`p-4 rounded-xl border transition ${
                      !item.isAttempted
                        ? 'bg-gray-50 border-gray-200'
                        : item.isCorrect
                        ? 'bg-green-50/50 border-green-200'
                        : 'bg-red-50/50 border-red-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-semibold text-gray-900">
                        <span className="text-gray-400 mr-2">Q{index + 1}.</span>
                        {item.questionText}
                      </h3>

                      <div className="shrink-0">
                        {!item.isAttempted ? (
                          <span className="inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded bg-gray-200 text-gray-700">
                            Skipped (0 pts)
                          </span>
                        ) : item.isCorrect ? (
                          <span className="inline-flex items-center text-xs font-bold px-2 py-0.5 rounded bg-green-100 text-green-800">
                            +{formatMarks(item.marksAwarded)} pts
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-xs font-bold px-2 py-0.5 rounded bg-red-100 text-red-800">
                            {formatMarks(item.marksAwarded)} pts (Penalty)
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div className="bg-white p-2.5 rounded border border-gray-200">
                        <span className="text-gray-500 block">Your Answer:</span>
                        <span className={`font-semibold ${
                          !item.isAttempted
                            ? 'text-gray-400 italic'
                            : item.isCorrect
                            ? 'text-green-700'
                            : 'text-red-700'
                        }`}>
                          {item.studentAnswer || 'Not Attempted'}
                        </span>
                      </div>

                      <div className="bg-white p-2.5 rounded border border-gray-200">
                        <span className="text-gray-500 block">Correct Answer:</span>
                        <span className="font-semibold text-gray-900">
                          {item.correctAnswer || 'Evaluated Answer'}
                        </span>
                      </div>
                    </div>

                    {!item.isAttempted && (
                      <p className="mt-2 text-[11px] text-gray-500">
                        💡 Unattempted question received 0 marks with no negative marking penalty.
                      </p>
                    )}
                    {item.isAttempted && !item.isCorrect && (
                      <p className="mt-2 text-[11px] text-red-600 font-medium">
                        ⚠️ Incorrect response: -{formatMarks(Math.abs(item.marksAwarded))} marks deducted under the {result.negativeMarkingPercent}% penalty rule.
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-gray-100">
              <button
                onClick={() => {
                  window.location.href = '/student';
                }}
                className="px-5 py-2.5 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg text-sm font-medium transition"
              >
                Return to Dashboard
              </button>
              <button
                onClick={() => {
                  window.location.href = '/';
                }}
                className="px-5 py-2.5 bg-purple-600 text-white hover:bg-purple-700 rounded-lg text-sm font-medium transition shadow-xs"
              >
                Log Out / Switch Exam
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // 2. FACE & IDENTITY VERIFICATION VIEW
  // -------------------------------------------------------------
  if (!isVerified) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-lg bg-white rounded-2xl shadow-md border border-gray-200 p-8 space-y-6">
          <div className="text-center">
            <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Camera className="w-7 h-7 text-purple-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Identity Verification</h2>
            <p className="text-gray-600 mt-1 text-sm">
              Please allow camera and microphone access to verify your identity and monitor the exam.
            </p>
          </div>

          <div className="bg-gray-950 rounded-xl aspect-video overflow-hidden flex items-center justify-center relative border border-gray-300 shadow-inner">
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted 
              className="object-cover w-full h-full transform scale-x-[-1]" 
            />
            {!streamReady && (
              <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">
                Accessing webcam feed...
              </div>
            )}
            <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-xs px-2 py-0.5 rounded text-[11px] text-white flex items-center">
              <div className="w-2 h-2 rounded-full bg-green-500 mr-1.5 animate-pulse"></div>
              Camera Active
            </div>
          </div>

          {/* Exam Details & Negative Marking Warning Banner */}
          <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50 text-xs text-amber-900 space-y-1.5">
            <div className="font-bold flex items-center">
              <Percent className="w-3.5 h-3.5 mr-1 text-amber-700" />
              Negative Marking Policy for this Exam:
            </div>
            {negEnabled ? (
              <p>
                This exam has <strong>active negative marking ({negPercent}% penalty)</strong>. Each incorrect answer deducts <strong>-{formatMarks(penaltyPerWrong)} marks</strong>. Unattempted questions carry no penalty (0 marks). You may deselect answers if uncertain.
              </p>
            ) : (
              <p>Negative marking is not enabled for this exam. No penalty is deducted for wrong answers.</p>
            )}
          </div>

          <button
            onClick={() => setIsVerified(true)}
            className="w-full py-3.5 px-4 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition shadow-sm"
          >
            Verify Face & Continue
          </button>

          <div className="flex items-start p-3 bg-yellow-50 rounded-lg text-xs text-yellow-800 border border-yellow-200">
            <ShieldAlert className="w-4 h-4 mr-2 shrink-0 mt-0.5 text-yellow-700" />
            <p>Your camera, microphone, and screen are recorded throughout the test. Tab switching or exiting fullscreen will trigger cheating alerts.</p>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // 3. EXAM READY & LIVE PROCTORED TESTING VIEW
  // -------------------------------------------------------------
  return (
    <div ref={examContainerRef} className="min-h-screen bg-white text-gray-900 overflow-y-auto relative">
      {!hasStarted ? (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Maximize className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold mb-2 text-gray-900">Ready to begin the exam?</h1>
          <p className="text-gray-600 mb-4 max-w-md text-sm">
            Exam: <strong>{exam?.title}</strong> ({exam?.className})
          </p>

          {negEnabled && (
            <div className="mb-6 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 max-w-md text-left">
              <strong>⚠️ Negative Marking Alert:</strong> -{negPercent}% penalty per incorrect answer (-{formatMarks(penaltyPerWrong)} marks). Choose carefully, and leave questions blank if you are unsure to prevent deductions.
            </div>
          )}

          <p className="text-gray-500 mb-8 max-w-md text-xs">
            Clicking start will open fullscreen mode. Tab switches and exiting fullscreen are strictly recorded.
          </p>

          <button
            onClick={startExam}
            className="px-8 py-3.5 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-700 transition"
          >
            Enter Fullscreen & Start Exam
          </button>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto pb-24 relative">
          {/* Header Bar */}
          <div className="sticky top-0 bg-white/95 backdrop-blur-xs border-b border-gray-200 p-4 flex flex-wrap items-center justify-between z-10 shadow-xs gap-3">
            <div className="font-bold text-base sm:text-lg flex items-center">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse mr-2"></div>
              <span className="truncate max-w-[200px] sm:max-w-xs">{exam?.title}</span>
            </div>

            <div className="flex items-center space-x-3 sm:space-x-6">
              {negEnabled && (
                <div className="hidden sm:flex items-center text-xs font-semibold px-2.5 py-1 rounded bg-amber-50 text-amber-800 border border-amber-200">
                  <Percent className="w-3.5 h-3.5 mr-1 text-amber-600" />
                  -{negPercent}% Penalty
                </div>
              )}

              <div className="flex items-center text-red-600 font-semibold text-xs sm:text-sm" title="Warnings">
                <AlertCircle className="w-4 h-4 mr-1" />
                {violations} / 3 Warnings
              </div>

              <div className="flex items-center font-mono text-sm sm:text-base font-bold bg-gray-100 px-3 py-1 rounded border border-gray-200">
                <Clock className="w-4 h-4 mr-1.5 text-gray-500" />
                {formatTime(timeLeft)}
              </div>

              <button 
                onClick={() => {
                  if (confirm("Are you sure you want to finish and submit your exam?")) {
                    handleAutoSubmit('Student submitted');
                  }
                }}
                className="px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg text-sm transition shadow-xs"
              >
                Submit Now
              </button>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-8 select-none">
            {/* Proctoring & Negative Marking Notice */}
            <div className="space-y-2">
              <div className="bg-yellow-50 border border-yellow-200 p-3.5 rounded-xl flex items-start text-xs text-yellow-800">
                <ShieldAlert className="w-4 h-4 mr-2 shrink-0 mt-0.5" />
                <p>AI Proctoring Active: Your face, voice, and screen are continuously monitored. Suspicious behavior will trigger warnings and auto-submission.</p>
              </div>

              {negEnabled && (
                <div className="bg-amber-50/80 border border-amber-200 p-3.5 rounded-xl flex items-start text-xs text-amber-900 justify-between">
                  <div className="flex items-start">
                    <Percent className="w-4 h-4 mr-2 shrink-0 mt-0.5 text-amber-700" />
                    <div>
                      <strong>Negative Marking Active:</strong> +{marksPerQ} mark for correct, <strong>-{formatMarks(penaltyPerWrong)} marks ({negPercent}%)</strong> deducted for wrong answers. Skipped questions incur no deduction.
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Questions List */}
            {questions.map((q, index) => {
              const currentAnswer = answers[q.id];
              return (
                <div key={q.id} className="bg-gray-50/80 p-6 rounded-2xl border border-gray-200 space-y-4 shadow-xs">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-base font-semibold text-gray-900 leading-snug">
                      <span className="text-purple-600 mr-2 font-mono">Q{index + 1}.</span>
                      {q.text}
                    </h3>
                    <div className="shrink-0 flex items-center space-x-2">
                      <span className="text-xs bg-gray-200 text-gray-700 font-medium px-2 py-0.5 rounded">
                        +{marksPerQ} pts
                      </span>
                      {negEnabled && (
                        <span className="text-xs bg-red-100 text-red-700 font-semibold px-2 py-0.5 rounded">
                          -{formatMarks(penaltyPerWrong)} on wrong
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Options */}
                  <div className="space-y-2.5">
                    {q.type === 'mcq' && q.options && (
                      <>
                        <div className="space-y-2">
                          {q.options.map((opt: string, i: number) => {
                            const isSelected = currentAnswer === opt;
                            return (
                              <label 
                                key={i} 
                                className={`flex items-center p-3.5 border rounded-xl cursor-pointer transition text-sm ${
                                  isSelected 
                                    ? 'border-purple-500 bg-purple-50/70 text-purple-950 font-medium ring-1 ring-purple-300' 
                                    : 'border-gray-200 bg-white hover:bg-gray-100 text-gray-800'
                                }`}
                              >
                                <input 
                                  type="radio" 
                                  name={`q-${q.id}`} 
                                  value={opt}
                                  checked={isSelected}
                                  onChange={() => setAnswers((prev) => ({ ...prev, [q.id]: opt }))}
                                  className="w-4 h-4 text-purple-600 focus:ring-purple-500 mr-3 border-gray-300"
                                />
                                <span className="font-mono text-gray-400 mr-2 text-xs">{String.fromCharCode(65 + i)}.</span>
                                <span>{opt}</span>
                              </label>
                            );
                          })}
                        </div>

                        {/* Deselect / Clear Choice button for negative marking defense */}
                        {currentAnswer && (
                          <div className="flex justify-end pt-1">
                            <button
                              type="button"
                              onClick={() => clearSelection(q.id)}
                              className="inline-flex items-center text-xs text-gray-500 hover:text-red-600 underline font-medium transition"
                            >
                              <RotateCcw className="w-3 h-3 mr-1" />
                              Clear selection (Leave unattempted to avoid penalty)
                            </button>
                          </div>
                        )}
                      </>
                    )}

                    {q.type === 'short' && (
                      <div>
                        <input 
                          type="text"
                          className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:ring-purple-500 focus:border-purple-500 bg-white select-auto"
                          placeholder="Type your concise answer here..."
                          value={answers[q.id] || ''}
                          onChange={(e) => setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
                          onPaste={(e) => e.preventDefault()}
                        />
                        {answers[q.id] && (
                          <button
                            type="button"
                            onClick={() => clearSelection(q.id)}
                            className="mt-1 text-xs text-gray-500 hover:text-red-600 underline"
                          >
                            Clear answer
                          </button>
                        )}
                      </div>
                    )}

                    {q.type === 'long' && (
                      <div>
                        <textarea 
                          className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:ring-purple-500 focus:border-purple-500 bg-white select-auto min-h-[140px]"
                          placeholder="Type your detailed answer here..."
                          value={answers[q.id] || ''}
                          onChange={(e) => setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
                          onPaste={(e) => e.preventDefault()}
                        />
                        {answers[q.id] && (
                          <button
                            type="button"
                            onClick={() => clearSelection(q.id)}
                            className="mt-1 text-xs text-gray-500 hover:text-red-600 underline"
                          >
                            Clear answer
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Picture-in-Picture Live Webcam Feed */}
          <div className="fixed bottom-6 right-6 w-48 aspect-video bg-black rounded-xl overflow-hidden border-2 border-gray-700 shadow-2xl z-50">
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted 
              className="object-cover w-full h-full transform scale-x-[-1]" 
            />
            <div className="absolute top-2 right-2 flex items-center bg-black/60 backdrop-blur-xs px-2 py-0.5 rounded text-[10px] text-white font-medium">
              <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse mr-1.5"></div>
              PROCTOR CAM
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
