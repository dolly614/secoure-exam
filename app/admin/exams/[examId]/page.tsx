'use client';

import { useState, useEffect, use } from 'react';
import { Plus, X, Upload, ArrowLeft, Percent, Settings, Check, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { Exam, Question, QuestionType } from '@/lib/types';
import { formatMarks } from '@/lib/scoring';

export default function QuestionsPage({ params }: { params: Promise<{ examId: string }> }) {
  const resolvedParams = use(params);
  const examId = resolvedParams.examId;
  const [exam, setExam] = useState<Exam | null>(() => {
    if (typeof window !== 'undefined') {
      const savedExams = localStorage.getItem('examsApp_exams');
      if (savedExams) {
        try {
          const parsedExams = JSON.parse(savedExams);
          return parsedExams.find((e: any) => e.id === examId) || null;
        } catch (err) {
          console.error(err);
        }
      }
    }
    return null;
  });
  const [questions, setQuestions] = useState<Question[]>(() => {
    if (typeof window !== 'undefined') {
      const savedExams = localStorage.getItem('examsApp_exams');
      if (savedExams) {
        try {
          const parsedExams = JSON.parse(savedExams);
          const foundExam = parsedExams.find((e: any) => e.id === examId);
          return foundExam?.questions || [];
        } catch (err) {
          console.error(err);
        }
      }
    }
    return [];
  });
  const [isAdding, setIsAdding] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settingsSavedMsg, setSettingsSavedMsg] = useState(false);
  const [newQuestionType, setNewQuestionType] = useState<QuestionType>('mcq');
  const [newQuestion, setNewQuestion] = useState<{ text: string; options: string[]; answer: string }>({ 
    text: '', options: ['', '', '', ''], answer: '' 
  });

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

  const updateExamSettings = (updatedExam: Exam) => {
    setExam(updatedExam);
    const savedExams = localStorage.getItem('examsApp_exams');
    if (savedExams) {
      const parsedExams = JSON.parse(savedExams);
      const updatedExams = parsedExams.map((e: any) => {
        if (e.id === examId) {
          return updatedExam;
        }
        return e;
      });
      localStorage.setItem('examsApp_exams', JSON.stringify(updatedExams));
      setSettingsSavedMsg(true);
      setTimeout(() => setSettingsSavedMsg(false), 3000);
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

  const negEnabled = exam.negativeMarkingEnabled ?? false;
  const negPercent = exam.negativeMarkingPercent ?? 0;
  const marks = exam.marksPerQuestion ?? 1;
  const penaltyPerWrong = negEnabled ? (marks * negPercent) / 100 : 0;

  return (
    <div>
      <div className="mb-4">
        <Link href="/admin/exams" className="text-purple-600 hover:text-purple-800 flex items-center text-sm font-medium">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Exams
        </Link>
      </div>

      {/* Header and Title */}
      <div className="sm:flex sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{exam.title}</h1>
          <p className="mt-1 text-sm text-gray-700">Class: <strong>{exam.className}</strong> | Access Code: <code className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded font-mono font-semibold">{exam.accessCode}</code></p>
        </div>
        <div className="mt-4 sm:mt-0 flex flex-wrap gap-2">
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className={`inline-flex items-center justify-center px-4 py-2 border text-sm font-medium rounded-md shadow-xs transition ${
              showSettings ? 'border-amber-400 bg-amber-50 text-amber-900' : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
            }`}
          >
            <Settings className="w-4 h-4 mr-2 text-purple-600" />
            Negative Marking Settings
          </button>
          <button 
            onClick={() => setIsAdding(true)}
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-xs text-white bg-purple-600 hover:bg-purple-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Question
          </button>
        </div>
      </div>

      {/* Negative Marking Banner */}
      <div className="mb-6 p-4 rounded-xl border border-amber-200 bg-amber-50/70 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-xs">
        <div className="flex items-start sm:items-center space-x-3">
          <div className="p-2 rounded-lg bg-amber-100 text-amber-800 shrink-0">
            <Percent className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-gray-900 text-sm">
                Negative Marking Status:
              </span>
              {negEnabled ? (
                <span className="text-xs bg-amber-200 text-amber-900 font-bold px-2 py-0.5 rounded">
                  Active ({negPercent}% penalty)
                </span>
              ) : (
                <span className="text-xs bg-gray-200 text-gray-700 font-medium px-2 py-0.5 rounded">
                  Disabled
                </span>
              )}
            </div>
            <p className="text-xs text-gray-600 mt-0.5">
              {negEnabled 
                ? `Correct answer = +${marks} mark | Wrong answer = -${formatMarks(penaltyPerWrong)} mark (${negPercent}%) | Skipped = 0 marks`
                : 'Students are not penalized for incorrect answers (0 mark penalty).'}
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="text-xs font-semibold text-amber-800 hover:text-amber-900 underline self-start sm:self-center"
        >
          {showSettings ? 'Hide Panel' : 'Configure Penalty'}
        </button>
      </div>

      {/* Negative Marking Configuration Dropdown/Drawer */}
      {showSettings && (
        <div className="mb-8 p-6 bg-white border border-purple-200 rounded-xl shadow-md ring-1 ring-purple-100 space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <h3 className="text-base font-bold text-gray-900 flex items-center">
              <Percent className="w-4 h-4 mr-2 text-purple-600" />
              Configure Negative Marking Rules for this Exam
            </h3>
            {settingsSavedMsg && (
              <span className="text-xs text-green-600 font-semibold flex items-center bg-green-50 px-2 py-1 rounded">
                <Check className="w-3.5 h-3.5 mr-1" /> Settings updated!
              </span>
            )}
          </div>

          <div className="space-y-4">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={exam.negativeMarkingEnabled ?? false}
                onChange={(e) => updateExamSettings({ ...exam, negativeMarkingEnabled: e.target.checked })}
                className="w-4 h-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
              />
              <span className="text-sm font-semibold text-gray-900">
                Enable Negative Marking Penalty for Incorrect Answers
              </span>
            </label>

            {exam.negativeMarkingEnabled && (
              <div className="bg-amber-50/60 p-4 rounded-lg border border-amber-200 space-y-3">
                <label className="block text-xs font-semibold text-amber-900 uppercase tracking-wider">
                  Select Penalty Percentage
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: '25% (1/4th penalty)', val: 25 },
                    { label: '33.33% (1/3rd penalty)', val: 33.33 },
                    { label: '50% (1/2 penalty)', val: 50 },
                    { label: '100% (1-to-1 penalty)', val: 100 },
                  ].map((p) => (
                    <button
                      key={p.val}
                      type="button"
                      onClick={() => updateExamSettings({ ...exam, negativeMarkingPercent: p.val })}
                      className={`text-xs px-3 py-1.5 rounded-md font-medium border transition ${
                        exam.negativeMarkingPercent === p.val
                          ? 'bg-amber-600 text-white border-amber-700 shadow-xs'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-amber-100'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center space-x-3 pt-2">
                  <div className="relative w-36">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={exam.negativeMarkingPercent ?? 25}
                      onChange={(e) =>
                        updateExamSettings({
                          ...exam,
                          negativeMarkingPercent: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full border border-gray-300 rounded-md p-2 text-sm pr-7 bg-white focus:ring-purple-500 focus:border-purple-500"
                    />
                    <span className="absolute right-2.5 top-2 text-xs text-gray-500 font-semibold">%</span>
                  </div>
                  <span className="text-xs text-gray-700">
                    Penalty per wrong answer: <strong>-{formatMarks((marks * (exam.negativeMarkingPercent ?? 25)) / 100)} marks</strong>
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

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

