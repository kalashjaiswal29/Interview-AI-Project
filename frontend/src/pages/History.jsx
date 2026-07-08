import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../api/axios';

export default function History() {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/interview/history')
      .then((res) => {
        setInterviews(res.data);
        setLoading(false);
      })
      .catch((err) => {
        toast.error('Failed to load interview history');
        setLoading(false);
      });
  }, []);

  return (
    <div className="max-w-2xl w-full mx-auto my-8 clay-card p-6 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Interview History
          </h1>
          <p className="text-slate-400 text-sm mt-1">Review your past practice sessions and feedback.</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400 text-sm">
          <div className="animate-spin inline-block w-6 h-6 border-2 border-current border-t-transparent text-indigo-500 rounded-full mb-2"></div>
          <div>Loading history...</div>
        </div>
      ) : interviews.length === 0 ? (
        <div className="text-center py-12 px-4 bg-slate-900/30 border border-dashed border-slate-800 rounded-2xl">
          <span className="text-4xl mb-3 block">🗓️</span>
          <p className="text-slate-400 font-medium">No interviews taken yet.</p>
          <Link
            to="/dashboard"
            className="clay-btn clay-btn-primary px-4 py-2 mt-4 text-sm"
          >
            Start Your First Interview
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {interviews.map((iv) => {
            const isCompleted = iv.status === 'completed';
            const dateStr = new Date(iv.createdAt).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });

            return (
              <Link
                key={iv._id}
                to={isCompleted ? `/feedback/${iv._id}` : `/interview/${iv._id}`}
                className="block bg-slate-900/40 border border-white/5 hover:border-indigo-500/30 hover:bg-slate-800/40 p-4 rounded-2xl shadow-sm transition-all duration-300 hover:-translate-y-0.5 group"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-slate-200 group-hover:text-white transition-colors text-base md:text-lg">
                      {iv.jobRole}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">Taken on {dateStr}</p>
                  </div>
                  {isCompleted ? (
                    <div className="flex flex-col items-end">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[inset_1px_1px_2px_rgba(255,255,255,0.1)]">
                        Score: {iv.feedback?.score ?? '-'}/10
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-[inset_1px_1px_2px_rgba(255,255,255,0.1)] animate-pulse">
                      In Progress
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

