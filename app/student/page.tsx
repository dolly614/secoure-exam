'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldAlert, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

export default function StudentDashboard() {
  const router = useRouter();
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pt-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl bg-white shadow sm:rounded-lg overflow-hidden border border-gray-200">
        <div className="px-6 py-8 border-b border-gray-200 bg-blue-50 text-blue-900">
          <h1 className="text-2xl font-bold">Upcoming Exam: JavaScript Fundamentals</h1>
          <div className="mt-4 flex items-center space-x-6 text-sm">
            <div className="flex items-center"><Clock className="w-4 h-4 mr-1" /> 30 Minutes</div>
            <div className="flex items-center"><CheckCircle className="w-4 h-4 mr-1" /> 20 Questions</div>
          </div>
        </div>
        
        <div className="px-6 py-6">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center mb-4">
            <ShieldAlert className="w-5 h-5 mr-2 text-red-500" />
            Strict Proctoring Rules Apply
          </h2>
          
          <ul className="space-y-4 text-sm text-gray-700">
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
            <li className="flex items-start">
              <span className="text-red-500 mr-2 mt-0.5">•</span>
              <strong>Single Device Only:</strong> Logging in from another device will terminate this session.
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
              className="px-6 py-3 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              I Understand, Start Exam
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
