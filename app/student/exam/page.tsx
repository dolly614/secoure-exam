'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Maximize, ShieldAlert, AlertTriangle, AlertCircle, Clock, Camera } from 'lucide-react';

const MOCK_QUESTIONS = [
  {
    id: 1,
    type: 'mcq',
    text: "What does 'typeof null' return in JavaScript?",
    options: ["'object'", "'null'", "'undefined'", "'number'"],
    answer: "'object'",
  },
  {
    id: 2,
    type: 'long',
    text: "Explain the difference between let, const, and var in JavaScript.",
    answer: "",
  },
  {
    id: 3,
    type: 'mcq',
    text: "Which method is used to remove the last element from an array?",
    options: ["pop()", "push()", "shift()", "unshift()"],
    answer: "pop()",
  },
  {
    id: 4,
    type: 'short',
    text: "What does JSON stand for?",
    answer: "",
  }
];

export default function ExamPage() {
  
  // State
  const [hasStarted, setHasStarted] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [streamReady, setStreamReady] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [violations, setViolations] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 mins in seconds
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitReason, setSubmitReason] = useState('');
  const [examTitle, setExamTitle] = useState('JavaScript Fundamentals');
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  
  const examContainerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Initialize and randomize questions
  useEffect(() => {
    let questionsToUse = MOCK_QUESTIONS;
    let examTitleToUse = "JavaScript Fundamentals"; // Default

    const currentExamId = localStorage.getItem('examsApp_currentExamId');
    if (currentExamId) {
      const savedExams = localStorage.getItem('examsApp_exams');
      if (savedExams) {
        const parsedExams = JSON.parse(savedExams);
        const exam = parsedExams.find((ex: any) => ex.id === currentExamId);
        if (exam && exam.questions && exam.questions.length > 0) {
          questionsToUse = exam.questions;
          examTitleToUse = exam.title || examTitleToUse;
        }
      }
    }
    
    // Store title in state or ref if needed - just storing for UI
    document.title = `${examTitleToUse} - Secure Exam`;
    setExamTitle(examTitleToUse);
    
    // Basic shuffle implementation
    const shuffledQuestions = [...questionsToUse].sort(() => Math.random() - 0.5);
    const randomizedWithOptions = shuffledQuestions.map(q => {
      if (q.type === 'mcq' && q.options) {
        return {
          ...q,
          options: [...q.options].sort(() => Math.random() - 0.5)
        };
      }
      return q;
    });
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setQuestions(randomizedWithOptions);
  }, []);

  const handleAutoSubmit = useCallback((reason: string) => {
    setIsSubmitted(true);
    setSubmitReason(reason);
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(err => console.error(err));
    }
    
    // Stop camera
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
  }, []);

  const handleViolation = useCallback((reason: string) => {
    if (isSubmitted) return;
    
    setViolations(prev => {
      const newCount = prev + 1;
      if (newCount >= 3) {
        handleAutoSubmit(`Suspicious Activity Limit Reached: ${reason}`);
      } else {
        alert(`WARNING: ${reason}. \nThis incident has been logged. \n${3 - newCount} warnings remaining before auto-submit.`);
      }
      return newCount;
    });
  }, [isSubmitted, handleAutoSubmit]);

  // Request camera and mic
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
        alert("Camera and microphone access is required for this exam.");
      }
    };
    
    startMedia();
    
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [isSubmitted]);

  // Re-attach stream to the video element if it changes (e.g., when verifying/starting)
  useEffect(() => {
    if (videoRef.current && streamRef.current) {
      if (videoRef.current.srcObject !== streamRef.current) {
        videoRef.current.srcObject = streamRef.current;
      }
    }
  });

  // Timer
  useEffect(() => {
    if (!hasStarted || isSubmitted) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
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

  // Prevent Default Context Menu & Copy/Paste
  useEffect(() => {
    if (!hasStarted || isSubmitted) return;
    
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    const handleCopy = (e: ClipboardEvent) => e.preventDefault();
    const handlePaste = (e: ClipboardEvent) => e.preventDefault();
    const handleKeyDown = (e: KeyboardEvent) => {
       // Prevent Ctrl+C, Ctrl+V, F12
       if ((e.ctrlKey && (e.key === 'c' || e.key === 'v')) || e.key === 'F12') {
         e.preventDefault();
       }
    }

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
      alert("Failed to enter fullscreen. Please check browser permissions.");
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md bg-white p-8 rounded-lg shadow-sm text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
            <ShieldAlert className="h-6 w-6 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Exam Submitted</h2>
          <p className="text-gray-600 mb-6 font-medium bg-gray-50 p-3 rounded">
            Reason: {submitReason || 'Manual Submit'}
          </p>
          <button 
            onClick={() => window.location.href = '/student'}
            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!isVerified) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="text-center mb-6">
            <Camera className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900">Identity Verification</h2>
            <p className="text-gray-600 mt-2 text-sm">Please allow camera and microphone access to verify your identity and monitor the exam.</p>
          </div>
          
          <div className="bg-gray-100 rounded-lg aspect-video mb-6 overflow-hidden flex items-center justify-center relative border border-gray-300">
             <video 
               ref={videoRef} 
               autoPlay 
               playsInline 
               muted 
               className="object-cover w-full h-full transform scale-x-[-1]" 
             />
             {!streamReady && (
               <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                 Loading camera...
               </div>
             )}
          </div>
          
          <button
            onClick={() => setIsVerified(true)}
            className="w-full py-3 px-4 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition"
          >
            Verify Face & Continue
          </button>
          
          <div className="mt-4 flex items-start p-3 bg-yellow-50 rounded-md text-sm text-yellow-800">
            <ShieldAlert className="w-4 h-4 mr-2 shrink-0 mt-0.5" />
            <p>Your camera and microphone will be recorded during the entire duration of the exam. Advanced AI monitoring is active.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={examContainerRef} className="min-h-screen bg-white text-gray-900 overflow-y-auto relative">
      {!hasStarted ? (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50 text-center">
          <Maximize className="w-16 h-16 text-blue-500 mb-4" />
          <h1 className="text-2xl font-bold mb-2">Ready to begin?</h1>
          <p className="text-gray-600 mb-8 max-w-md">
            Clicking start will open the exam in fullscreen mode. Do not exit fullscreen or switch tabs during the exam.
          </p>
          <button
            onClick={startExam}
            className="px-8 py-4 bg-blue-600 text-white font-bold rounded-lg shadow-lg hover:bg-blue-700 transition"
          >
            Start Exam
          </button>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto pb-24 relative">
          {/* Header Bar */}
          <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between z-10 shadow-sm">
            <div className="font-bold text-lg flex items-center">
               <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse mr-2"></div>
               {examTitle}
            </div>
            <div className="flex items-center space-x-6">
              <div className="flex items-center text-red-600 font-semibold" title="Warnings">
                <AlertCircle className="w-5 h-5 mr-1" />
                {violations} / 3 Warnings
              </div>
              <div className="flex items-center font-mono text-xl bg-gray-100 px-4 py-1 rounded border border-gray-200">
                <Clock className="w-5 h-5 mr-2 text-gray-400" />
                {formatTime(timeLeft)}
              </div>
              <button 
                onClick={() => handleAutoSubmit('Student submitted')}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded text-sm transition"
              >
                Submit Now
              </button>
            </div>
          </div>

          <div className="p-8 space-y-12 select-none">
             <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md mb-8 flex items-start text-sm text-yellow-800">
                <ShieldAlert className="w-5 h-5 mr-2 shrink-0" />
                <p>AI Proctoring Active: Your face, voice, and screen are being monitored. Suspicious behaviour will lead to auto-submission.</p>
             </div>
             
            {questions.map((q, index) => (
              <div key={q.id} className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h3 className="text-lg font-medium mb-4">
                  <span className="text-gray-500 mr-2">Q{index + 1}.</span>
                  {q.text}
                </h3>
                <div className="space-y-3">
                  {q.type === 'mcq' && q.options && q.options.map((opt: string, i: number) => (
                    <label 
                      key={i} 
                      className={`block p-4 border rounded-lg cursor-pointer transition-colors ${
                        answers[q.id] === opt 
                          ? 'border-blue-500 bg-blue-50 text-blue-900' 
                          : 'border-gray-300 bg-white hover:bg-gray-100'
                      }`}
                    >
                      <input 
                        type="radio" 
                        name={`q-${q.id}`} 
                        value={opt}
                        checked={answers[q.id] === opt}
                        onChange={() => setAnswers(prev => ({...prev, [q.id]: opt}))}
                        className="sr-only"
                      />
                      {opt}
                    </label>
                  ))}
                  
                  {q.type === 'short' && (
                    <input 
                      type="text"
                      className="w-full border border-gray-300 rounded-md p-3 focus:ring-blue-500 focus:border-blue-500 select-auto"
                      placeholder="Type your answer here..."
                      value={answers[q.id] || ''}
                      onChange={(e) => setAnswers(prev => ({...prev, [q.id]: e.target.value}))}
                      onPaste={(e) => e.preventDefault()}
                    />
                  )}

                  {q.type === 'long' && (
                    <textarea 
                      className="w-full border border-gray-300 rounded-md p-3 focus:ring-blue-500 focus:border-blue-500 select-auto min-h-[150px]"
                      placeholder="Type your comprehensive answer here..."
                      value={answers[q.id] || ''}
                      onChange={(e) => setAnswers(prev => ({...prev, [q.id]: e.target.value}))}
                      onPaste={(e) => e.preventDefault()}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Picture-in-Picture Camera View */}
          <div className="fixed bottom-6 right-6 w-48 aspect-video bg-black rounded-lg overflow-hidden border-2 border-gray-700 shadow-2xl z-50">
             <video 
               ref={videoRef} 
               autoPlay 
               playsInline 
               muted 
               className="object-cover w-full h-full transform scale-x-[-1]" 
             />
             <div className="absolute top-2 right-2 flex items-center bg-black/50 px-2 py-0.5 rounded text-[10px] text-white">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse mr-1.5"></div>
                REC
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
