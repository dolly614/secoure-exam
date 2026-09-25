'use client';

import { useState, useEffect } from 'react';
import { Key, Save, RefreshCw } from 'lucide-react';

export default function SettingsPage() {
  const [examKey, setExamKey] = useState('123456');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const storedKey = localStorage.getItem('examKey');
    if (storedKey) {
      setExamKey(storedKey);
    }
  }, []);

  const handleSave = () => {
    if (examKey.length !== 6) {
      alert('Exam key must be exactly 6 characters.');
      return;
    }
    localStorage.setItem('examKey', examKey);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const generateRandomKey = () => {
    const randomKey = Math.floor(100000 + Math.random() * 900000).toString();
    setExamKey(randomKey);
    setIsSaved(false);
  };

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>
      
      <div className="bg-white shadow-sm ring-1 ring-black ring-opacity-5 rounded-lg p-6">
        <div className="mb-6 border-b border-gray-200 pb-4">
          <h2 className="text-lg font-medium text-gray-900 flex items-center">
            <Key className="w-5 h-5 mr-2 text-purple-600" />
            Exam Access Settings
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage the global 6-digit key required for students to enter the exam.
          </p>
        </div>

        <div className="max-w-md">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Current Exam Key
          </label>
          <div className="flex items-center space-x-4">
            <input
              type="text"
              maxLength={6}
              value={examKey}
              onChange={(e) => {
                setExamKey(e.target.value);
                setIsSaved(false);
              }}
              className="font-mono text-2xl tracking-widest text-center shadow-sm focus:ring-purple-500 focus:border-purple-500 block w-full sm:text-lg border-gray-300 rounded-md py-3 border"
            />
            <button
              onClick={generateRandomKey}
              className="p-3 border border-gray-300 rounded-md text-gray-500 hover:bg-gray-50 hover:text-gray-700 focus:outline-none"
              title="Generate Random Key"
            >
              <RefreshCw className="w-6 h-6" />
            </button>
          </div>
          <p className="mt-2 text-xs text-gray-500">
            Provide this key to students before the exam starts.
          </p>

          <div className="mt-6 flex items-center space-x-4">
            <button
              onClick={handleSave}
              className="inline-flex justify-center items-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </button>
            {isSaved && (
              <span className="text-sm text-green-600 font-medium">
                Successfully saved!
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
