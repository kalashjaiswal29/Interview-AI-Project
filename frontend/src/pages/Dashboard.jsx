import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const ROLES = [
  'Software Engineer', 'Frontend Developer', 'Backend Developer',
  'Data Analyst', 'Data Scientist', 'Product Manager', 'DevOps Engineer',
];

export default function Dashboard() {
  const [file, setFile] = useState(null);
  const [jobRole, setJobRole] = useState(ROLES[0]);
  const [customRole, setCustomRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleStart = async (e) => {
    e.preventDefault();
    setError('');
    if (!file) return setError('Please upload your resume (PDF or DOCX)');

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('resume', file);
      const uploadRes = await api.post('/resume/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const role = customRole.trim() || jobRole;
      const startRes = await api.post('/interview/start', {
        resumeId: uploadRes.data.resumeId,
        jobRole: role,
      });

      navigate(`/interview/${startRes.data.interviewId}`, {
        state: { firstQuestion: startRes.data.question, questionNumber: 1 },
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-4">Start a Mock Interview</h1>
      {error && <p className="text-red-500 mb-3">{error}</p>}
      <form onSubmit={handleStart} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Upload Resume (PDF/DOCX)</label>
          <input type="file" accept=".pdf,.docx"
            onChange={(e) => setFile(e.target.files[0])}
            className="w-full border rounded px-3 py-2" />
        </div>

        <div>
          <label className="block mb-1 font-medium">Job Role</label>
          <select value={jobRole} onChange={(e) => setJobRole(e.target.value)}
            className="w-full border rounded px-3 py-2">
            {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>

        <div>
          <label className="block mb-1 font-medium">Or type a custom role</label>
          <input type="text" placeholder="e.g. ML Engineer"
            value={customRole} onChange={(e) => setCustomRole(e.target.value)}
            className="w-full border rounded px-3 py-2" />
        </div>

        <button type="submit" disabled={loading}
          className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 disabled:opacity-50">
          {loading ? 'Preparing interview...' : 'Start Interview'}
        </button>
      </form>
    </div>
  );
}
