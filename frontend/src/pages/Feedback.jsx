import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';

export default function Feedback() {
  const { id } = useParams();
  const [interview, setInterview] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/interview/${id}`)
      .then((res) => setInterview(res.data))
      .catch((err) => setError(err.response?.data?.message || 'Could not load feedback'));
  }, [id]);

  if (error) return <p className="text-red-500">{error}</p>;
  if (!interview) return <p>Loading feedback...</p>;

  const { feedback, jobRole } = interview;

  return (
    <div className="bg-white p-6 rounded-lg shadow space-y-4">
      <h1 className="text-2xl font-bold">Interview Feedback — {jobRole}</h1>

      {feedback ? (
        <>
          <div className="text-4xl font-bold text-indigo-600">{feedback.score}/10</div>
          <p className="text-slate-700">{feedback.summary}</p>

          <div>
            <h2 className="font-semibold text-green-700">Strengths</h2>
            <ul className="list-disc ml-5">
              {feedback.strengths?.map((s, i) => <li key={i}>{s}</li>)}
            </ul>
          </div>

          <div>
            <h2 className="font-semibold text-amber-700">Areas to Improve</h2>
            <ul className="list-disc ml-5">
              {feedback.improvements?.map((s, i) => <li key={i}>{s}</li>)}
            </ul>
          </div>
        </>
      ) : (
        <p>This interview is still in progress.</p>
      )}

      <Link to="/dashboard" className="inline-block mt-4 text-indigo-600">
        Start another interview →
      </Link>
    </div>
  );
}
