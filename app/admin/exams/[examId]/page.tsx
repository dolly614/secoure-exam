'use client';

import { useState, useEffect, use } from 'react';
import { Plus, X, Upload, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

type QuestionType = 'mcq' | 'short' | 'long';

interface Question {
  id: number;
  type: QuestionType;
  text: string;
  options?: string[];
  answer?: string;
}

export default function QuestionsPage({ params }: { params: Promise<{ examId: string }> }) {
  const resolvedParams = use(params);
  const examId = resolvedParams.examId;
  const [exam, setExam] = useState<any>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newQuestionType, setNewQuestionType] = useState<QuestionType>('mcq');
  const [newQuestion, setNewQuestion] = useState<{ text: string; options: string[]; answer: string }>({ 
    text: '', options: ['', '', '', ''], answer: '' 
  });

  useEffect(() => {
    const savedExams = localStorage.getItem('examsApp_exams');
    if (savedExams) {
      const parsedExams = JSON.parse(savedExams);
      const foundExam = parsedExams.find((e: any) => e.id === examId);
      if (foundExam) {
        setExam(foundExam);
        setQuestions(foundExam.questions || []);
      }
    }
  }, [examId]);

  const saveQuestions = (updatedQuestions: Question[]) => {
    setQuestions(updatedQuestions);
    const savedExams = localStorage.getItem('examsApp_exams');
    if (savedExams) {
      const parsedExams = JSON.parse(savedExams);
      const updatedExams = parsedExams.map((e: any) => {
        if (e.id === examId) {
          return { ...e, questions: updatedQuestions };
        }
        return e;
      });
      localStorage.setItem('examsApp_exams', JSON.stringify(updatedExams));
    }
  };

  const handleDeleteQuestion = (id: number) => {
    saveQuestions(questions.filter(qt => qt.id !== id));
  };

  const handleAddOptionChange = (index: number, value: string) => {
    const updatedOptions = [...newQuestion.options];
    updatedOptions[index] = value;
    setNewQuestion({ ...newQuestion, options: updatedOptions });
  };

  const handleSaveQuestion = () => {
    if (!newQuestion.text) {
      alert("Please enter the question text.");
      return;
    }

    let qToAdd: Question = {
      id: Date.now(),
      type: newQuestionType,
      text: newQuestion.text,
    };

    if (newQuestionType === 'mcq') {
      if (newQuestion.options.some(opt => !opt) || !newQuestion.answer) {
        alert("Please fill in all options and select a correct answer.");
        return;
      }
      if (!newQuestion.options.includes(newQuestion.answer)) {
        alert("The correct answer must match one of the options.");
        return;
      }
      qToAdd.options = newQuestion.options;
      qToAdd.answer = newQuestion.answer;
    } else {
      qToAdd.answer = newQuestion.answer; // Expected answer/rubric
    }
    
    saveQuestions([...questions, qToAdd]);
    setIsAdding(false);
    setNewQuestion({ text: '', options: ['', '', '', ''], answer: '' });
    setNewQuestionType('mcq');
  };

  if (!exam) return <div className="p-8">Loading exam...</div>;

  return (
    <div>
      <div className="mb-4">
        <Link href="/admin/exams" className="text-purple-600 hover:text-purple-800 flex items-center text-sm">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Exams
        </Link>
      </div>
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Questions: {exam.title}</h1>
          <p className="mt-2 text-sm text-gray-700">Class: {exam.className} | Code: {exam.accessCode}</p>
        </div>
        <div className="mt-4 sm:mt-0 flex gap-2">
          <button className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 sm:w-auto">
            <Upload className="w-4 h-4 mr-2" />
            Upload CSV/JSON
          </button>
          <button 
            onClick={() => setIsAdding(true)}
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 sm:w-auto"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Question
          </button>
        </div>
      </div>

      {isAdding && (
        <div className="bg-white shadow-sm ring-1 ring-black ring-opacity-5 rounded-lg p-6 mb-8 border border-purple-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">Add New Question</h2>
            <button onClick={() => setIsAdding(false)} className="text-gray-400 hover:text-gray-500">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Question Type</label>
              <select 
                title="Select question type"
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
                value={newQuestionType}
                onChange={(e) => setNewQuestionType(e.target.value as QuestionType)}
              >
                <option value="mcq">Multiple Choice</option>
                <option value="short">Short Answer</option>
                <option value="long">Long Answer (Essay)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Question Text</label>
              <textarea 
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-purple-500 focus:border-purple-500"
                rows={3}
                value={newQuestion.text}
                onChange={e => setNewQuestion({...newQuestion, text: e.target.value})}
                placeholder="Enter the question here..."
              />
            </div>
            
            {newQuestionType === 'mcq' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Options</label>
                {newQuestion.options.map((opt, idx) => (
                  <div key={idx} className="flex items-center space-x-2 mb-2">
                    <span className="text-gray-500 w-6 text-sm">{String.fromCharCode(65 + idx)}.</span>
                    <input 
                      type="text" 
                      className="flex-1 border border-gray-300 rounded-md p-2 focus:ring-purple-500 focus:border-purple-500"
                      value={opt}
                      onChange={e => handleAddOptionChange(idx, e.target.value)}
                      placeholder={`Option ${idx + 1}`}
                    />
                    <input 
                      type="radio" 
                      name="correct-answer"
                      checked={newQuestion.answer === opt && opt !== ''}
                      onChange={() => setNewQuestion({...newQuestion, answer: opt})}
                      disabled={!opt}
                      className="w-4 h-4 text-purple-600 focus:ring-purple-500"
                      title="Mark as correct answer"
                    />
                  </div>
                ))}
                <p className="text-xs text-gray-500 mt-2">Select the radio button next to the correct option.</p>
              </div>
            )}

            {(newQuestionType === 'short' || newQuestionType === 'long') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expected Answer / Rubric (Optional)</label>
                <textarea 
                  className="w-full border border-gray-300 rounded-md p-2 focus:ring-purple-500 focus:border-purple-500"
                  rows={newQuestionType === 'short' ? 2 : 5}
                  value={newQuestion.answer}
                  onChange={e => setNewQuestion({...newQuestion, answer: e.target.value})}
                  placeholder="Enter expected answer or grading criteria..."
                />
              </div>
            )}
            <div className="flex justify-end pt-4 border-t border-gray-100">
              <button 
                onClick={handleSaveQuestion}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
              >
                Save Question
              </button>
            </div>
          </div>
        </div>
      )}

      {questions.length === 0 ? (
        <div className="bg-white shadow-sm ring-1 ring-black ring-opacity-5 rounded-lg p-6 text-center">
          <p className="text-gray-500">No questions uploaded yet.</p>
        </div>
      ) : (
        <div className="bg-white shadow-sm ring-1 ring-black ring-opacity-5 rounded-lg overflow-hidden">
          <ul className="divide-y divide-gray-200">
            {questions.map((q, i) => (
              <li key={q.id} className="p-6">
                <div className="flex justify-between items-start">
                  <h3 className="text-sm font-medium text-gray-900"><span className="text-gray-500 mr-2">Q{i + 1}.</span>{q.text}</h3>
                  <button 
                    onClick={() => handleDeleteQuestion(q.id)}
                    className="text-red-500 text-sm hover:text-red-700"
                  >
                    Delete
                  </button>
                </div>
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {q.type === 'mcq' && q.options && q.options.map((opt, idx) => (
                    <div key={idx} className={`text-sm p-2 rounded-md ${opt === q.answer ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-gray-50 border border-gray-200 text-gray-700'}`}>
                      {String.fromCharCode(65 + idx)}. {opt} {opt === q.answer && '(Correct)'}
                    </div>
                  ))}
                </div>
                {q.type !== 'mcq' && (
                  <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-3 rounded border border-gray-200">
                    <strong>Type:</strong> {q.type === 'short' ? 'Short Answer' : 'Long Answer'}<br />
                    <strong>Expected:</strong> {q.answer || 'Not provided'}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
