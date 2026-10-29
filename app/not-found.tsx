import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white p-4">
      <div className="max-w-md w-full bg-slate-800 p-8 rounded-xl border border-slate-700 text-center">
        <h2 className="text-3xl font-bold text-red-400 mb-2">404 - Page Not Found</h2>
        <p className="text-slate-300 mb-6">
          The requested page could not be found or you may not have access to this exam module.
        </p>
        <Link
          href="/"
          className="inline-block px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg transition"
        >
          Return to Portal
        </Link>
      </div>
    </div>
  );
}
