'use client';

import { Camera } from 'lucide-react';

export default function AdminDashboard() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Live Exam Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-gray-500 text-sm font-medium">Total Active</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">124</p>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-gray-500 text-sm font-medium">Verified Identity</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">120</p>
        </div>
        <div className="bg-green-50 rounded-lg p-6 shadow-sm border border-green-100">
          <h3 className="text-green-600 text-sm font-medium">Smooth Progress</h3>
          <p className="text-3xl font-bold text-green-700 mt-2">115</p>
        </div>
        <div className="bg-red-50 rounded-lg p-6 shadow-sm border border-red-100">
          <h3 className="text-red-600 text-sm font-medium">Cheating Alerts</h3>
          <p className="text-3xl font-bold text-red-700 mt-2">3</p>
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900 flex items-center">
             <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse mr-2"></div>
             Live Monitoring
          </h2>
          <span className="text-xs text-gray-500">Auto-refreshing...</span>
        </div>
        <table className="min-w-full divide-y divide-gray-200">
           <thead className="bg-gray-50">
             <tr>
               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Feed</th>
               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name & ID</th>
               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">AI Status</th>
               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Violations</th>
               <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
             </tr>
           </thead>
           <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                 <td className="px-6 py-4 whitespace-nowrap">
                   <div className="h-16 w-24 bg-gray-200 rounded overflow-hidden flex items-center justify-center text-gray-400">
                     <Camera className="w-6 h-6" />
                   </div>
                 </td>
                 <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">Rahul Kumar</div>
                    <div className="text-sm text-gray-500">ID: 2024-STD-101</div>
                 </td>
                 <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Suspicious Eye Movement
                    </span>
                 </td>
                 <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-bold">2</td>
                 <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900 mr-4">Preview feed</button>
                    <button className="text-red-600 hover:text-red-900">Force Submit</button>
                 </td>
              </tr>
              <tr>
                 <td className="px-6 py-4 whitespace-nowrap">
                   <div className="h-16 w-24 bg-gray-200 rounded overflow-hidden flex items-center justify-center text-gray-400">
                     <Camera className="w-6 h-6" />
                   </div>
                 </td>
                 <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">Priya Singh</div>
                    <div className="text-sm text-gray-500">ID: 2024-STD-102</div>
                 </td>
                 <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Normal
                    </span>
                 </td>
                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">0</td>
                 <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900 mr-4">Preview feed</button>
                    <button className="text-red-600 hover:text-red-900">Force Submit</button>
                 </td>
              </tr>
           </tbody>
        </table>
      </div>

      <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-medium text-gray-900">Recent Automated Terminations</h2>
        </div>
        <div className="divide-y divide-gray-200">
          <div className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Arjun Verma</p>
              <p className="text-sm text-gray-500">Exited Fullscreen (Limit Reached)</p>
            </div>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              Exam Locked
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
