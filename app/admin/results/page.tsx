'use client';

export default function ResultsPage() {
  return (
    <div>
       <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Results & Cheating Alerts</h1>
        <p className="mt-2 text-sm text-gray-700">Detailed logs of student activities and auto-submissions.</p>
      </div>

       <div className="bg-white shadow-sm ring-1 ring-black ring-opacity-5 rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Student</th>
              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Score</th>
              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Violations</th>
              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
             <tr>
                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">Priya Singh</td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">12 / 20</td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                   <ul className="text-red-500 text-xs list-disc list-inside">
                     <li>Exited fullscreen</li>
                   </ul>
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  <span className="inline-flex rounded-full bg-red-100 px-2 text-xs font-semibold leading-5 text-red-800">
                    Auto Submitted
                  </span>
                </td>
              </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
