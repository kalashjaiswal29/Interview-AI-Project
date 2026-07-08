import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
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
    if (!file) {
      const msg = 'Please upload your resume (PDF or DOCX)';
      setError(msg);
      toast.error(msg);
      return;
    }

    setLoading(true);
    const toastId = toast.loading('Uploading resume & analyzing job role...');
    try {
      const formData = new FormData();
      formData.append('resume', file);
      const uploadRes = await api.post('/resume/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.loading('Generating custom AI questions...', { id: toastId });

      const role = customRole.trim() || jobRole;
      const startRes = await api.post('/interview/start', {
        resumeId: uploadRes.data.resumeId,
        jobRole: role,
      });

      toast.success('Interview prepared successfully! Good luck!', { id: toastId });

      navigate(`/interview/${startRes.data.interviewId}`, {
        state: { firstQuestion: startRes.data.question, questionNumber: 1 },
      });
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Something went wrong';
      setError(errMsg);
      toast.error(errMsg, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl w-full mx-auto my-8 clay-card p-6 md:p-8">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
          Start a Mock Interview
        </h1>
        <p className="text-slate-400 text-sm mt-1">Get customized AI questions matching your resume and role.</p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium">
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={handleStart} className="space-y-6">
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Upload Resume (PDF/DOCX)
          </label>
          <label className="flex flex-col items-center justify-center border border-dashed border-slate-700 hover:border-indigo-500/60 bg-slate-900/40 rounded-2xl p-6 cursor-pointer transition-all duration-300 group">
            <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">📄</span>
            <span className="text-sm text-slate-300 font-medium group-hover:text-indigo-400 transition-colors">
              {file ? file.name : 'Choose or drag your resume'}
            </span>
            {file && (
              <span className="text-xs text-slate-500 mt-1">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </span>
            )}
            <span className="text-xs text-slate-500 mt-1">PDF or DOCX formats only</span>
            <input
              type="file"
              accept=".pdf,.docx"
              onChange={(e) => setFile(e.target.files[0])}
              className="hidden"
            />
          </label>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Target Job Role
          </label>
          <select
            value={jobRole}
            onChange={(e) => setJobRole(e.target.value)}
            className="w-full clay-input px-4 py-3 text-sm cursor-pointer"
          >
            {ROLES.map((r) => (
              <option key={r} value={r} className="bg-slate-900 text-slate-200">
                {r}
              </option>
            ))}
          </select>
        </div>

        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-slate-800"></div>
          <span className="flex-shrink mx-4 text-slate-500 text-xs font-semibold uppercase tracking-wider">Or</span>
          <div className="flex-grow border-t border-slate-800"></div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Type a Custom Role
          </label>
          <input
            type="text"
            placeholder="e.g. Machine Learning Engineer"
            value={customRole}
            onChange={(e) => setCustomRole(e.target.value)}
            className="w-full clay-input px-4 py-3 text-sm"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full clay-btn clay-btn-primary py-3.5 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Preparing interview...' : '🚀 Start Interview'}
        </button>
      </form>
    </div>
  );
}

