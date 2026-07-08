import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../api/axios';

export default function Feedback() {
  const { id } = useParams();
  const [interview, setInterview] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/interview/${id}`)
      .then((res) => {
        setInterview(res.data);
        setLoading(false);
      })
      .catch((err) => {
        const errMsg = err.response?.data?.message || 'Could not load feedback';
        setError(errMsg);
        toast.error(errMsg);
        setLoading(false);
      });
  }, [id]);

  if (error) {
    return (
      <div className="max-w-2xl w-full mx-auto my-8 p-6 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl text-center">
        <span className="text-3xl block mb-2">⚠️</span>
        <p className="font-semibold">{error}</p>
        <Link to="/dashboard" className="clay-btn clay-btn-secondary px-4 py-2 mt-4 text-sm">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  if (loading || !interview) {
    return (
      <div className="max-w-2xl w-full mx-auto my-8 p-12 text-center text-slate-400 text-sm">
        <div className="animate-spin inline-block w-6 h-6 border-2 border-current border-t-transparent text-indigo-500 rounded-full mb-2"></div>
        <div>Generating report & detailed insights...</div>
      </div>
    );
  }

  const { feedback, jobRole } = interview;

  return (
    <div className="max-w-2xl w-full mx-auto my-8 clay-card p-6 md:p-8 space-y-6">
      <div className="border-b border-white/5 pb-4">
        <span className="text-xs font-semibold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20">
          Interview Report
        </span>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-100 mt-2">
          {jobRole}
        </h1>
      </div>

      {feedback ? (
        <>
          {/* Score & Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center bg-slate-900/40 p-5 rounded-2xl border border-white/5">
            <div className="col-span-1 flex flex-col items-center justify-center p-3 bg-indigo-600/10 border border-indigo-500/20 rounded-xl shadow-inner">
              <span className="text-3xl md:text-4xl font-extrabold text-indigo-400">
                {feedback.score}
              </span>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mt-1">
                Out of 10
              </span>
            </div>
            <div className="col-span-3 text-sm text-slate-300 leading-relaxed">
              <span className="font-semibold text-slate-200 block mb-1">Executive Summary</span>
              {feedback.summary}
            </div>
          </div>

          {/* Strengths */}
          <div className="clay-card-emerald p-5">
            <h2 className="font-bold text-emerald-400 text-base md:text-lg mb-3 flex items-center gap-2">
              <span>✅</span> Strengths
            </h2>
            <ul className="space-y-2 text-slate-300 text-sm">
              {feedback.strengths?.map((s, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span className="text-emerald-500 mt-0.5">•</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Improvements */}
          <div className="clay-card-amber p-5">
            <h2 className="font-bold text-amber-400 text-base md:text-lg mb-3 flex items-center gap-2">
              <span>💡</span> Areas to Improve
            </h2>
            <ul className="space-y-2 text-slate-300 text-sm">
              {feedback.improvements?.map((s, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span className="text-amber-500 mt-0.5">•</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
        </>
      ) : (
        <div className="text-center py-8 text-slate-400">
          <span className="text-3xl block mb-2">⌛</span>
          <p className="font-medium">This interview is still in progress.</p>
        </div>
      )}

      <div className="pt-4 border-t border-white/5 flex flex-col sm:flex-row gap-3">
        <Link to="/dashboard" className="clay-btn clay-btn-primary flex-1 py-3 text-center">
          Start Another Interview
        </Link>
        <Link to="/history" className="clay-btn clay-btn-secondary py-3 px-6 text-center">
          View History
        </Link>
      </div>
    </div>
  );
}

