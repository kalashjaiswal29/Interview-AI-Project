import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

export default function History() {
  const [interviews, setInterviews] = useState([]);

  useEffect(() => {
    api.get('/interview/history').then((res) => setInterviews(res.data));
  }, []);

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-4">Interview History</h1>
      {interviews.length === 0 && <p>No interviews yet.</p>}
      <div className="space-y-3">
        {interviews.map((iv) => (
          <Link key={iv._id} to={iv.status === 'completed' ? `/feedback/${iv._id}` : `/interview/${iv._id}`}
            className="block border rounded p-3 hover:bg-slate-50">
            <div className="flex justify-between">
              <span className="font-medium">{iv.jobRole}</span>
              <span className="text-sm text-slate-500">
                {new Date(iv.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div className="text-sm text-slate-600">
              {iv.status === 'completed'
                ? `Score: ${iv.feedback?.score ?? '-'}/10`
                : 'In progress'}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
