'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Key, Users } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export interface Exam {
  id: string;
  title: string;
  className: string;
  accessCode: string;
  questions: any[];
}

export default function ExamsPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newExam, setNewExam] = useState({ title: '', className: '', accessCode: '' });
  const router = useRouter();

  useEffect(() => {
    const savedExams = localStorage.getItem('examsApp_exams');
    if (savedExams) {
      setExams(JSON.parse(savedExams));
    }
  }, []);

  const saveExams = (updated: Exam[]) => {
    setExams(updated);
    localStorage.setItem('examsApp_exams', JSON.stringify(updated));
  };

  const generateCode = () => {
    setNewExam({
      ...newExam,
      accessCode: Math.floor(100000 + Math.random() * 900000).toString()
    });
  };

  const handleCreate = () => {
    if (!newExam.title || !newExam.className || !newExam.accessCode) {
      alert("Please fill in all fields.");
      return;
    }
    const exam: Exam = {
      id: Date.now().toString(),
      ...newExam,
      questions: []
    };
    saveExams([...exams, exam]);
    setIsAdding(false);
    setNewExam({ title: '', className: '', accessCode: '' });
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this exam?")) {
      saveExams(exams.filter(e => e.id !== id));
    }
  };

  return (
    <div>
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Exams</h1>
          <p className="mt-2 text-sm text-gray-700">Create class-wise exams with unique access codes.</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button 
            onClick={() => setIsAdding(true)}
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Exam
          </button>
        </div>
      </div>

      {isAdding && (
        <div className="bg-white shadow border rounded-lg p-6 mb-8 max-w-2xl">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Create New Exam</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Exam Title</label>
              <input 
                type="text" 
                className="mt-1 w-full border border-gray-300 rounded-md p-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="e.g. Midterm Mathematics"
                value={newExam.title}
                onChange={e => setNewExam({...newExam, title: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Class/Target Group</label>
              <input 
                type="text" 
                className="mt-1 w-full border border-gray-300 rounded-md p-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="e.g. Class 10th A"
                value={newExam.className}
                onChange={e => setNewExam({...newExam, className: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Access Key</label>
              <div className="mt-1 flex space-x-2">
                <input 
                  type="text" 
                  className="flex-1 border border-gray-300 rounded-md p-2 focus:ring-purple-500 focus:border-purple-500 font-mono"
                  placeholder="6-digit code"
                  maxLength={6}
                  value={newExam.accessCode}
                  onChange={e => setNewExam({...newExam, accessCode: e.target.value})}
                />
                <button 
                  onClick={generateCode}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md border hover:bg-gray-200"
                >
                  Generate
                </button>
              </div>
            </div>
            <div className="flex justify-end pt-4 space-x-3">
              <button 
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button 
                onClick={handleCreate}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
              >
                Create Exam
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {exams.length === 0 && !isAdding && (
          <div className="col-span-full bg-white shadow-sm ring-1 ring-black ring-opacity-5 rounded-lg p-8 text-center">
            <p className="text-gray-500">No exams created yet. Click "Create Exam" to get started.</p>
          </div>
        )}
        {exams.map(exam => (
          <div key={exam.id} className="bg-white rounded-lg border shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="p-5">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-bold text-gray-900 truncate pr-4">{exam.title}</h3>
                <button onClick={() => handleDelete(exam.id)} className="text-gray-400 hover:text-red-500" title="Delete exam">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
              <div className="mt-4 flex items-center text-sm text-gray-600">
                <Users className="w-4 h-4 mr-2" />
                <span>{exam.className}</span>
              </div>
              <div className="mt-2 flex items-center text-sm text-gray-600">
                <Key className="w-4 h-4 mr-2 text-purple-600" />
                <span className="font-mono bg-purple-50 text-purple-700 px-2 rounded">{exam.accessCode}</span>
              </div>
              <div className="mt-4 text-sm text-gray-500">
                {exam.questions?.length || 0} Questions configured
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3 border-t rounded-b-lg">
              <Link href={`/admin/exams/${exam.id}`} className="text-purple-600 hover:text-purple-900 text-sm font-medium inline-block w-full text-center">
                Manage Questions →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
