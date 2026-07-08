import { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
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
      toast.error('Voice input is not supported in this browser. Try using Chrome.');
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
    toast.success('Listening... speak now!', { duration: 2000, icon: '🎙️' });
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
        toast.success('Interview completed! Loading feedback...');
        navigate(`/feedback/${id}`);
      } else {
        setChat((prev) => [...prev, { role: 'question', content: data.question }]);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl w-full mx-auto my-6 clay-card flex flex-col h-[78vh] overflow-hidden">
      {/* Header bar of the Chat */}
      <div className="px-6 py-4 bg-slate-900/40 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping"></div>
          <div>
            <h2 className="font-bold text-slate-100 text-sm md:text-base">Active Mock Interview</h2>
            <p className="text-xs text-slate-400">Answer clearly. Take your time.</p>
          </div>
        </div>
      </div>

      {/* Message Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
        {chat.length === 0 && (
          <div className="text-center py-12 text-slate-500 text-sm">
            Waiting for the first question...
          </div>
        )}
        
        {chat.map((msg, i) => {
          const isQuestion = msg.role === 'question';
          return (
            <div key={i} className={`flex flex-col ${isQuestion ? 'items-start' : 'items-end'}`}>
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1 px-2">
                {isQuestion ? '🤖 Interviewer' : '👤 You'}
              </span>
              <span className={`inline-block px-5 py-3 text-sm max-w-[85%] leading-relaxed ${
                isQuestion ? 'clay-bubble-question' : 'clay-bubble-answer'
              }`}>
                {msg.content}
              </span>
            </div>
          );
        })}

        {loading && (
          <div className="flex flex-col items-start">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1 px-2">
              🤖 Interviewer
            </span>
            <div className="clay-bubble-question px-5 py-4 flex gap-1.5 items-center">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '0ms' }}></span>
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '150ms' }}></span>
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '300ms' }}></span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <form onSubmit={handleSubmit} className="p-4 bg-slate-900/40 border-t border-white/5 flex gap-3 items-center">
        <button
          type="button"
          onClick={toggleListening}
          className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl transition-all duration-300 ${
            listening
              ? 'bg-red-500 text-white animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.5)]'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white shadow-[inset_1px_1px_2px_rgba(255,255,255,0.05),_inset_-2px_-2px_4px_rgba(0,0,0,0.3)]'
          }`}
          title={listening ? 'Stop listening' : 'Start voice input'}
        >
          🎙️
        </button>
        <input
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder={listening ? "Listening... Speak now." : "Type or speak your answer here..."}
          className="flex-1 clay-input px-4 py-3.5 text-sm"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !answer.trim()}
          className="clay-btn clay-btn-primary px-6 py-3.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Send
        </button>
      </form>
    </div>
  );
}

