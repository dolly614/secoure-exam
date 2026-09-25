'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, User, ShieldAlert } from 'lucide-react';
import { motion } from 'motion/react';

export default function Home() {
  const router = useRouter();
  const [role, setRole] = useState<'student' | 'admin'>('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [examKey, setExamKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [studentClicks, setStudentClicks] = useState(0);
  const [isAdminVisible, setIsAdminVisible] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (role === 'student') {
      const savedExams = localStorage.getItem('examsApp_exams');
      let isCodeValid = false;
      let matchedExamId = '';
      
      if (savedExams) {
        const parsedExams = JSON.parse(savedExams);
        const exam = parsedExams.find((ex: any) => ex.accessCode === examKey);
        if (exam) {
          isCodeValid = true;
          matchedExamId = exam.id;
        }
      }

      if (!isCodeValid) {
        if (examKey === '123456') { // Fallback demo
           // DO NOTHING, ALLOW DEMO
        } else {
          alert("Invalid Exam Key! Please ask your teacher for the correct code.");
          return;
        }
      } else {
        localStorage.setItem('examsApp_currentExamId', matchedExamId);
      }
    }

    setLoading(true);

    // MOCK LOGIN FOR NOW - Users need to configure Supabase to use the real auth.
    // In a real app we would use supabase.auth.signInWithPassword(...)
    setTimeout(() => {
      setLoading(false);
      if (role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/student/exam');
      }
    }, 1000);
  };

  const handleStudentClick = () => {
    setRole('student');
    if (!isAdminVisible) {
      const newClicks = studentClicks + 1;
      if (newClicks >= 9) {
        setIsAdminVisible(true);
      }
      setStudentClicks(newClicks);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
            <ShieldCheck className="w-10 h-10 text-white" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Secure Exam Portal
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          High-security proctored examination system
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="flex justify-center space-x-4 mb-8">
            <button
              onClick={handleStudentClick}
              className={`flex-1 py-2 px-4 rounded-md flex items-center justify-center space-x-2 border transition-colors ${
                role === 'student'
                  ? 'bg-blue-50 border-blue-500 text-blue-700'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Student</span>
            </button>
            {isAdminVisible && (
              <button
                onClick={() => setRole('admin')}
                className={`flex-1 py-2 px-4 rounded-md flex items-center justify-center space-x-2 border transition-colors ${
                  role === 'admin'
                    ? 'bg-purple-50 border-purple-500 text-purple-700'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <ShieldAlert className="w-4 h-4" />
                <span>Admin</span>
              </button>
            )}
          </div>

          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder={role === 'admin' ? 'admin@example.com' : 'student@example.com'}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Demo: type anything"
                />
              </div>
            </div>

            {role === 'student' && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Exam Key
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={examKey}
                    onChange={(e) => setExamKey(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm font-mono tracking-widest text-lg text-center"
                    placeholder="Enter 6-digit key"
                  />
                  <p className="mt-1 text-xs text-gray-500 text-center">
                    (Default demo key is 123456. Admin can change this in settings.)
                  </p>
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                  role === 'admin' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-blue-600 hover:bg-blue-700'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
            
            <div className="mt-4 p-4 text-sm bg-yellow-50 text-yellow-800 rounded-md border border-yellow-200">
              <strong className="block mb-1">Demo Mode:</strong>
              This application requires Supabase connection for real Auth/DB. You can click Login to see the mock UI interfaces.
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
