const Resume = require('../models/Resume');
const { parseResumeFile } = require('../utils/parseResume');

exports.uploadResume = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const parsedText = await parseResumeFile(req.file.buffer, req.file.originalname);

    if (!parsedText || parsedText.trim().length < 20) {
      return res.status(400).json({ message: 'Could not extract readable text from this file' });
    }

    const resume = await Resume.create({
      userId: req.userId,
      filename: req.file.originalname,
      parsedText,
    });

    res.status(201).json({ resumeId: resume._id, filename: resume.filename });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMyResumes = async (req, res) => {
  const resumes = await Resume.find({ userId: req.userId }).select('filename createdAt');
  res.json(resumes);
};
