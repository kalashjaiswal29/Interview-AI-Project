import { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function Interview() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [chat, setChat] = useState(
    location.state?.firstQuestion
      ? [{ role: 'question', content: location.state.firstQuestion }]
      : []
  );
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const bottomRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat]);

  // Optional voice input via Web Speech API (Chrome-based browsers)
  const toggleListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Voice input is not supported in this browser. Try Chrome.');
      return;
    }

    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setAnswer((prev) => (prev ? prev + ' ' + transcript : transcript));
    };
    recognition.onend = () => setListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!answer.trim()) return;

    const userAnswer = answer;
    setChat((prev) => [...prev, { role: 'answer', content: userAnswer }]);
    setAnswer('');
    setLoading(true);

    try {
      const { data } = await api.post(`/interview/${id}/respond`, { answer: userAnswer });

      if (data.done) {
        navigate(`/feedback/${id}`);
      } else {
        setChat((prev) => [...prev, { role: 'question', content: data.question }]);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow flex flex-col h-[75vh]">
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {chat.map((msg, i) => (
          <div key={i} className={msg.role === 'question' ? 'text-left' : 'text-right'}>
            <span className={`inline-block px-4 py-2 rounded-2xl max-w-[80%] ${
              msg.role === 'question' ? 'bg-slate-200' : 'bg-indigo-600 text-white'
            }`}>
              {msg.content}
            </span>
          </div>
        ))}
        {loading && <p className="text-sm text-slate-400">Interviewer is thinking...</p>}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t flex gap-2">
        <button type="button" onClick={toggleListening}
          className={`px-3 rounded ${listening ? 'bg-red-500 text-white' : 'bg-slate-200'}`}>
          🎤
        </button>
        <input value={answer} onChange={(e) => setAnswer(e.target.value)}
          placeholder="Type your answer..."
          className="flex-1 border rounded px-3 py-2" disabled={loading} />
        <button type="submit" disabled={loading}
          className="bg-indigo-600 text-white px-4 rounded hover:bg-indigo-700 disabled:opacity-50">
          Send
        </button>
      </form>
    </div>
  );
}
