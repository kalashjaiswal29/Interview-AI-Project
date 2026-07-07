const Interview = require('../models/Interview');
const Resume = require('../models/Resume');
const { callClaude } = require('../utils/claude');

const MAX_QUESTIONS = 4;

function buildSystemPrompt(resumeText, jobRole) {
  return `You are an experienced technical interviewer conducting a mock interview for a "${jobRole}" position.

Candidate's resume:
"""
${resumeText.slice(0, 6000)}
"""

Rules:
- Ask exactly one question at a time.
- Tailor questions to the resume and the job role. Mix behavioral and role-specific/technical questions.
- If an answer is vague or shallow, ask a sharp follow-up before moving on.
- Keep questions concise, realistic, and professional - like a real interviewer.
- After ${MAX_QUESTIONS} total questions have been asked and answered, end the interview and provide feedback instead of another question.

You must respond ONLY with valid JSON, no markdown formatting, no extra text. Use one of these two shapes exactly:

For a question:
{"type": "question", "content": "your question here"}

For the final wrap-up (only after ${MAX_QUESTIONS} questions):
{"type": "complete", "score": <0-10 integer>, "strengths": ["...", "..."], "improvements": ["...", "..."], "summary": "2-3 sentence overall summary"}`;
}

function parseClaudeJSON(raw) {
  const cleaned = raw.replace(/```json|```/g, '').trim();
  return JSON.parse(cleaned);
}

exports.startInterview = async (req, res) => {
  try {
    const { resumeId, jobRole } = req.body;
    if (!resumeId || !jobRole) {
      return res.status(400).json({ message: 'resumeId and jobRole are required' });
    }

    const resume = await Resume.findOne({ _id: resumeId, userId: req.userId });
    if (!resume) return res.status(404).json({ message: 'Resume not found' });

    const interview = await Interview.create({
      userId: req.userId,
      resumeId,
      jobRole,
      messages: [],
    });

    const systemPrompt = buildSystemPrompt(resume.parsedText, jobRole);
    const raw = await callClaude(systemPrompt, [
      { role: 'user', content: 'Begin the interview with your first question.' },
    ]);

    const parsed = parseClaudeJSON(raw);

    interview.messages.push({ role: 'question', content: parsed.content });
    interview.questionCount = 1;
    await interview.save();

    res.status(201).json({
      interviewId: interview._id,
      question: parsed.content,
      questionNumber: 1,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.respondToInterview = async (req, res) => {
  try {
    const { answer } = req.body;
    if (!answer) return res.status(400).json({ message: 'Answer is required' });

    const interview = await Interview.findOne({ _id: req.params.id, userId: req.userId });
    if (!interview) return res.status(404).json({ message: 'Interview not found' });
    if (interview.status === 'completed') {
      return res.status(400).json({ message: 'This interview has already ended' });
    }

    const resume = await Resume.findById(interview.resumeId);
    interview.messages.push({ role: 'answer', content: answer });

    const systemPrompt = buildSystemPrompt(resume.parsedText, interview.jobRole);

    const history = interview.messages.map((m) => ({
      role: m.role === 'question' ? 'assistant' : 'user',
      content: m.content,
    }));

    const raw = await callClaude(systemPrompt, history);
    const parsed = parseClaudeJSON(raw);

    if (parsed.type === 'complete') {
      interview.status = 'completed';
      interview.feedback = {
        score: parsed.score,
        strengths: parsed.strengths,
        improvements: parsed.improvements,
        summary: parsed.summary,
      };
      await interview.save();
      return res.json({ done: true, feedback: interview.feedback });
    }

    interview.messages.push({ role: 'question', content: parsed.content });
    interview.questionCount += 1;
    await interview.save();

    res.json({
      done: false,
      question: parsed.content,
      questionNumber: interview.questionCount,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getInterview = async (req, res) => {
  const interview = await Interview.findOne({ _id: req.params.id, userId: req.userId });
  if (!interview) return res.status(404).json({ message: 'Interview not found' });
  res.json(interview);
};

exports.getHistory = async (req, res) => {
  const interviews = await Interview.find({ userId: req.userId })
    .select('jobRole status feedback.score createdAt')
    .sort('-createdAt');
  res.json(interviews);
};
