'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Key, Users, Percent, Settings2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Exam } from '@/lib/types';
import { INITIAL_DEFAULT_EXAMS, formatMarks } from '@/lib/scoring';

export default function ExamsPage() {
  const [exams, setExams] = useState<Exam[]>(() => {
    if (typeof window !== 'undefined') {
      const savedExams = localStorage.getItem('examsApp_exams');
      if (savedExams) {
        try {
          const parsed = JSON.parse(savedExams);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        } catch (e) {
          console.error('Failed to parse exams', e);
        }
      }
    }
    return INITIAL_DEFAULT_EXAMS;
  });
  const [isAdding, setIsAdding] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [newExam, setNewExam] = useState({
    title: '',
    className: '',
    accessCode: '',
    negativeMarkingEnabled: true,
    negativeMarkingPercent: 25,
    marksPerQuestion: 1,
  });
  const router = useRouter();

  useEffect(() => {
    const savedExams = localStorage.getItem('examsApp_exams');
    if (!savedExams) {
      localStorage.setItem('examsApp_exams', JSON.stringify(INITIAL_DEFAULT_EXAMS));
    }
  }, []);

  const saveExams = (updated: Exam[]) => {
    setExams(updated);
    localStorage.setItem('examsApp_exams', JSON.stringify(updated));
  };

  const generateCode = () => {
    setNewExam({
      ...newExam,
      accessCode: Math.floor(100000 + Math.random() * 900000).toString(),
    });
  };

  const handleCreate = () => {
    if (!newExam.title.trim() || !newExam.className.trim() || !newExam.accessCode.trim()) {
      alert("Please fill in all required fields.");
      return;
    }
    const exam: Exam = {
      id: Date.now().toString(),
      title: newExam.title.trim(),
      className: newExam.className.trim(),
      accessCode: newExam.accessCode.trim(),
      negativeMarkingEnabled: newExam.negativeMarkingEnabled,
      negativeMarkingPercent: newExam.negativeMarkingEnabled ? Number(newExam.negativeMarkingPercent) || 0 : 0,
      marksPerQuestion: Number(newExam.marksPerQuestion) || 1,
      questions: [],
      createdAt: new Date().toISOString(),
    };
    saveExams([...exams, exam]);
    setIsAdding(false);
    setNewExam({
      title: '',
      className: '',
      accessCode: '',
      negativeMarkingEnabled: true,
      negativeMarkingPercent: 25,
      marksPerQuestion: 1,
    });
  };

  const handleSaveEdit = () => {
    if (!editingExam) return;
    const updated = exams.map((e) => (e.id === editingExam.id ? editingExam : e));
    saveExams(updated);
    setEditingExam(null);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this exam?")) {
      saveExams(exams.filter((e) => e.id !== id));
    }
  };

  return (
    <div>
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Exams</h1>
          <p className="mt-2 text-sm text-gray-700">
            Create class-wise exams with unique access codes and configurable negative marking penalty percentages.
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button 
            onClick={() => {
              setIsAdding(true);
              setEditingExam(null);
            }}
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Exam
          </button>
        </div>
      </div>

      {/* Create Exam Modal / Section */}
      {isAdding && (
        <div className="bg-white shadow-lg border border-purple-200 rounded-xl p-6 mb-8 max-w-2xl ring-1 ring-purple-100">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
            <h2 className="text-lg font-bold text-gray-900 flex items-center">
              <Plus className="w-5 h-5 mr-2 text-purple-600" />
              Create New Exam
            </h2>
            <button 
              onClick={() => setIsAdding(false)} 
              className="text-gray-400 hover:text-gray-600 text-sm font-medium"
            >
              Cancel
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Exam Title *</label>
              <input 
                type="text" 
                className="mt-1 w-full border border-gray-300 rounded-md p-2.5 text-sm focus:ring-purple-500 focus:border-purple-500"
                placeholder="e.g. Midterm Mathematics or Physics Finals"
                value={newExam.title}
                onChange={e => setNewExam({...newExam, title: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Class / Target Group *</label>
                <input 
                  type="text" 
                  className="mt-1 w-full border border-gray-300 rounded-md p-2.5 text-sm focus:ring-purple-500 focus:border-purple-500"
                  placeholder="e.g. Class 10th A"
                  value={newExam.className}
                  onChange={e => setNewExam({...newExam, className: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Marks per Question</label>
                <input 
                  type="number"
                  min="0.5"
                  step="0.5" 
                  className="mt-1 w-full border border-gray-300 rounded-md p-2.5 text-sm focus:ring-purple-500 focus:border-purple-500"
                  value={newExam.marksPerQuestion}
                  onChange={e => setNewExam({...newExam, marksPerQuestion: parseFloat(e.target.value) || 1})}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">6-Digit Access Key *</label>
              <div className="mt-1 flex space-x-2">
                <input 
                  type="text" 
                  className="flex-1 border border-gray-300 rounded-md p-2.5 text-sm font-mono tracking-widest focus:ring-purple-500 focus:border-purple-500"
                  placeholder="6-digit code"
                  maxLength={6}
                  value={newExam.accessCode}
                  onChange={e => setNewExam({...newExam, accessCode: e.target.value})}
                />
                <button 
                  type="button"
                  onClick={generateCode}
                  className="px-4 py-2.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-md border hover:bg-gray-200 transition"
                >
                  Generate
                </button>
              </div>
            </div>

            {/* Negative Marking Configuration Panel */}
            <div className="bg-amber-50/70 border border-amber-200 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newExam.negativeMarkingEnabled}
                    onChange={(e) => setNewExam({ ...newExam, negativeMarkingEnabled: e.target.checked })}
                    className="w-4 h-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
                  />
                  <span className="font-semibold text-sm text-gray-900 flex items-center">
                    <Percent className="w-4 h-4 mr-1.5 text-amber-700" />
                    Enable Negative Marking Penalty
                  </span>
                </label>
                {newExam.negativeMarkingEnabled && (
                  <span className="text-xs bg-amber-200 text-amber-900 font-semibold px-2 py-0.5 rounded">
                    Active Penalty
                  </span>
                )}
              </div>

              {newExam.negativeMarkingEnabled && (
                <div className="pt-2 border-t border-amber-200/60 space-y-3">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-amber-900 mb-1.5">
                      Penalty Percentage per Incorrect Answer
                    </label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {[
                        { label: '25% (1/4th)', val: 25 },
                        { label: '33.33% (1/3rd)', val: 33.33 },
                        { label: '50% (1/2)', val: 50 },
                        { label: '100% (Full)', val: 100 },
                      ].map((preset) => (
                        <button
                          key={preset.val}
                          type="button"
                          onClick={() => setNewExam({ ...newExam, negativeMarkingPercent: preset.val })}
                          className={`text-xs px-2.5 py-1.5 rounded-md font-medium border transition ${
                            newExam.negativeMarkingPercent === preset.val
                              ? 'bg-amber-600 text-white border-amber-700 shadow-sm'
                              : 'bg-white text-gray-700 border-gray-300 hover:bg-amber-100/50'
                          }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center space-x-2">
                      <div className="relative flex-1 max-w-xs">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          value={newExam.negativeMarkingPercent}
                          onChange={(e) =>
                            setNewExam({ ...newExam, negativeMarkingPercent: parseFloat(e.target.value) || 0 })
                          }
                          className="w-full border border-gray-300 rounded-md p-2 text-sm pr-8 bg-white focus:ring-purple-500 focus:border-purple-500"
                          placeholder="e.g. 25"
                        />
                        <span className="absolute right-3 top-2 text-sm text-gray-500">%</span>
                      </div>
                      <span className="text-xs text-gray-600">penalty per wrong answer</span>
                    </div>
                  </div>

                  <p className="text-xs text-amber-800 leading-relaxed bg-white/70 p-2.5 rounded border border-amber-200/80">
                    💡 <strong>Calculation Rule:</strong> Each correct answer gets <strong>+{newExam.marksPerQuestion} mark</strong>.
                    Each incorrect answer deducts <strong>-{formatMarks((newExam.marksPerQuestion * newExam.negativeMarkingPercent) / 100)} marks</strong> ({newExam.negativeMarkingPercent}% of question mark).
                    Unattempted questions receive <strong>0 marks</strong> (no deduction).
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-3 space-x-3">
              <button 
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded-md hover:bg-gray-50 text-sm font-medium"
              >
                Cancel
              </button>
              <button 
                type="button"
                onClick={handleCreate}
                className="px-5 py-2 bg-purple-600 text-white text-sm font-medium rounded-md hover:bg-purple-700 shadow-sm"
              >
                Create Exam
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Exam Settings Modal */}
      {editingExam && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 space-y-4 border border-gray-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 flex items-center">
                <Settings2 className="w-5 h-5 mr-2 text-purple-600" />
                Edit Exam & Negative Marking
              </h2>
              <button 
                onClick={() => setEditingExam(null)} 
                className="text-gray-400 hover:text-gray-600 text-sm"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Exam Title</label>
              <input
                type="text"
                value={editingExam.title}
                onChange={(e) => setEditingExam({ ...editingExam, title: e.target.value })}
                className="mt-1 w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-purple-500 focus:border-purple-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Class / Group</label>
                <input
                  type="text"
                  value={editingExam.className}
                  onChange={(e) => setEditingExam({ ...editingExam, className: e.target.value })}
                  className="mt-1 w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Access Key</label>
                <input
                  type="text"
                  maxLength={6}
                  value={editingExam.accessCode}
                  onChange={(e) => setEditingExam({ ...editingExam, accessCode: e.target.value })}
                  className="mt-1 w-full border border-gray-300 rounded-md p-2 text-sm font-mono tracking-widest focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
            </div>

            {/* Negative Marking Edit Panel */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3.5 space-y-3">
              <label className="flex items-center space-x-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editingExam.negativeMarkingEnabled ?? false}
                  onChange={(e) => setEditingExam({ ...editingExam, negativeMarkingEnabled: e.target.checked })}
                  className="w-4 h-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
                />
                <span className="font-semibold text-sm text-gray-900">Enable Negative Marking Penalty</span>
              </label>

              {editingExam.negativeMarkingEnabled && (
                <div className="space-y-2 pt-2 border-t border-amber-200">
                  <div className="flex flex-wrap gap-2">
                    {[
                      { label: '25% (1/4th)', val: 25 },
                      { label: '33.33% (1/3rd)', val: 33.33 },
                      { label: '50% (1/2)', val: 50 },
                      { label: '100%', val: 100 },
                    ].map((p) => (
                      <button
                        key={p.val}
                        type="button"
                        onClick={() => setEditingExam({ ...editingExam, negativeMarkingPercent: p.val })}
                        className={`text-xs px-2.5 py-1 rounded font-medium border ${
                          editingExam.negativeMarkingPercent === p.val
                            ? 'bg-amber-600 text-white border-amber-700'
                            : 'bg-white text-gray-700 border-gray-300'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={editingExam.negativeMarkingPercent ?? 25}
                      onChange={(e) =>
                        setEditingExam({
                          ...editingExam,
                          negativeMarkingPercent: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-28 border border-gray-300 rounded-md p-1.5 text-sm bg-white"
                    />
                    <span className="text-xs text-amber-900 font-medium">% penalty per wrong answer</span>
                  </div>

                  <p className="text-xs text-amber-800">
                    Each wrong answer will deduct {editingExam.negativeMarkingPercent ?? 25}% of the question mark.
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingExam(null)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                className="px-4 py-2 bg-purple-600 text-white rounded-md text-sm font-medium hover:bg-purple-700 shadow-sm"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Exams Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {exams.length === 0 && !isAdding && (
          <div className="col-span-full bg-white shadow-sm ring-1 ring-black ring-opacity-5 rounded-lg p-8 text-center">
            <p className="text-gray-500">No exams created yet. Click &quot;Create Exam&quot; to get started.</p>
          </div>
        )}
        {exams.map((exam) => {
          const negEnabled = exam.negativeMarkingEnabled ?? false;
          const penaltyPercent = exam.negativeMarkingPercent ?? 0;
          const marks = exam.marksPerQuestion ?? 1;
          const penaltyDeduction = negEnabled ? (marks * penaltyPercent) / 100 : 0;

          return (
            <div 
              key={exam.id} 
              className="bg-white rounded-xl border border-gray-200 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden"
            >
              <div className="p-5">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-bold text-gray-900 truncate pr-4">{exam.title}</h3>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => setEditingExam(exam)}
                      className="p-1 text-gray-400 hover:text-purple-600 rounded transition"
                      title="Edit exam & negative marking"
                    >
                      <Settings2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(exam.id)} 
                      className="p-1 text-gray-400 hover:text-red-500 rounded transition" 
                      title="Delete exam"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-3 flex items-center text-sm text-gray-600">
                  <Users className="w-4 h-4 mr-2 text-gray-400" />
                  <span>{exam.className}</span>
                </div>

                <div className="mt-2 flex items-center text-sm text-gray-600">
                  <Key className="w-4 h-4 mr-2 text-purple-600" />
                  <span className="font-mono bg-purple-50 text-purple-700 px-2 py-0.5 rounded font-semibold">
                    {exam.accessCode}
                  </span>
                </div>

                {/* Negative Marking Badge & Details */}
                <div className="mt-4 pt-3 border-t border-gray-100">
                  {negEnabled ? (
                    <div className="bg-amber-50 border border-amber-200 rounded-md p-2.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-amber-900 flex items-center">
                          <Percent className="w-3.5 h-3.5 mr-1 text-amber-700" />
                          Negative Marking Active
                        </span>
                        <span className="font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">
                          -{penaltyPercent}%
                        </span>
                      </div>
                      <p className="text-[11px] text-amber-700 mt-1">
                        Deducts <strong>-{formatMarks(penaltyDeduction)} mark</strong> per wrong answer
                      </p>
                    </div>
                  ) : (
                    <div className="bg-gray-50 border border-gray-200 rounded-md p-2 flex items-center justify-between text-xs text-gray-500">
                      <span>Negative Marking:</span>
                      <span className="font-medium text-gray-600">Disabled (0 penalty)</span>
                    </div>
                  )}
                </div>

                <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                  <span>{exam.questions?.length || 0} Questions configured</span>
                  <span>{marks} mark/question</span>
                </div>
              </div>

              <div className="bg-gray-50 px-5 py-3 border-t rounded-b-xl flex items-center justify-between">
                <Link 
                  href={`/admin/exams/${exam.id}`} 
                  className="text-purple-600 hover:text-purple-900 text-sm font-medium inline-flex items-center"
                >
                  Manage Questions →
                </Link>
                <button
                  onClick={() => setEditingExam(exam)}
                  className="text-xs text-gray-500 hover:text-gray-800 underline"
                >
                  Edit Settings
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
