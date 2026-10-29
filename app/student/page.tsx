'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldAlert, AlertTriangle, CheckCircle, Clock, Percent } from 'lucide-react';
import { Exam } from '@/lib/types';
import { INITIAL_DEFAULT_EXAMS, formatMarks } from '@/lib/scoring';

export default function StudentDashboard() {
  const router = useRouter();
  const [exam] = useState<Exam>(() => {
    if (typeof window !== 'undefined') {
      const currentExamId = localStorage.getItem('examsApp_currentExamId');
      const savedExams = localStorage.getItem('examsApp_exams');
      if (savedExams) {
        try {
          const parsed: Exam[] = JSON.parse(savedExams);
          if (currentExamId) {
            const found = parsed.find(e => e.id === currentExamId);
            if (found) return found;
          } else if (parsed.length > 0) {
            return parsed[0];
          }
        } catch (e) {
          console.error('Failed to load exam in student dashboard', e);
        }
      }
    }
    return INITIAL_DEFAULT_EXAMS[0];
  });

  const negEnabled = exam.negativeMarkingEnabled ?? false;
  const negPercent = exam.negativeMarkingPercent ?? 0;
  const marks = exam.marksPerQuestion ?? 1;
  const penalty = negEnabled ? (marks * negPercent) / 100 : 0;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pt-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl bg-white shadow sm:rounded-xl overflow-hidden border border-gray-200">
        <div className="px-6 py-8 border-b border-gray-200 bg-gradient-to-r from-blue-700 to-indigo-700 text-white">
          <span className="text-xs font-semibold bg-white/20 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            {exam.className}
          </span>
          <h1 className="text-2xl font-bold mt-2">{exam.title}</h1>
          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-blue-100">
            <div className="flex items-center"><Clock className="w-4 h-4 mr-1.5" /> {exam.durationMinutes || 30} Minutes</div>
            <div className="flex items-center"><CheckCircle className="w-4 h-4 mr-1.5" /> {exam.questions?.length || 5} Questions</div>
            {negEnabled ? (
              <div className="flex items-center bg-amber-400 text-amber-950 font-bold px-2 py-0.5 rounded text-xs">
                <Percent className="w-3.5 h-3.5 mr-1" /> Negative Marking: -{negPercent}%
              </div>
            ) : (
              <div className="flex items-center bg-blue-500/40 text-white px-2 py-0.5 rounded text-xs">
                No Negative Marking
              </div>
            )}
          </div>
        </div>
        
        <div className="px-6 py-6">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center mb-4">
            <ShieldAlert className="w-5 h-5 mr-2 text-red-500" />
            Strict Proctoring & Marking Instructions
          </h2>
          
          <ul className="space-y-4 text-sm text-gray-700">
            {negEnabled && (
              <li className="flex items-start bg-amber-50 p-3 rounded-lg border border-amber-200 text-amber-900">
                <Percent className="w-4 h-4 mr-2 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <strong>Negative Marking Penalty Applied:</strong> Each correct response awards <strong>+{marks} mark</strong>. Each incorrect answer will deduct <strong>-{formatMarks(penalty)} mark ({negPercent}%)</strong> from your total score. Unattempted questions receive <strong>0 marks</strong>.
                </div>
              </li>
            )}
            <li className="flex items-start">
              <span className="text-red-500 mr-2 mt-0.5">•</span>
              <strong>AI Camera & Audio Monitoring:</strong> Your face and voice will be monitored during the entire exam. Face verification is required before starting.
            </li>
            <li className="flex items-start">
              <span className="text-red-500 mr-2 mt-0.5">•</span>
              <strong>Fullscreen Lock:</strong> The exam must be taken in Fullscreen mode. Exiting fullscreen may result in auto-submission.
            </li>
            <li className="flex items-start">
              <span className="text-red-500 mr-2 mt-0.5">•</span>
              <strong>Tab Switch Detection:</strong> Switching to other tabs (Google, ChatGPT, etc.) will be logged as cheating and may auto-submit your exam.
            </li>
            <li className="flex items-start">
              <span className="text-red-500 mr-2 mt-0.5">•</span>
              <strong>Copy & Paste Blocked:</strong> Right-click, Ctrl+C, and Ctrl+V are disabled.
            </li>
          </ul>

          <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-md p-4 flex">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mr-3 shrink-0" />
            <p className="text-sm text-yellow-800">
              Ensure you have a stable internet connection before starting. The timer will not stop once started.
            </p>
          </div>

          <div className="mt-8 flex items-center justify-between">
            <button 
              onClick={() => router.push('/')}
              className="text-gray-500 hover:text-gray-900 text-sm font-medium"
            >
              Logout
            </button>
            <button
              onClick={() => router.push('/student/exam')}
              className="px-6 py-3 border border-transparent shadow-sm text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              I Understand, Start Exam
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
