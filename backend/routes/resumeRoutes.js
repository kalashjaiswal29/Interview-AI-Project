const express = require('express');
const multer = require('multer');
const protect = require('../middleware/auth');
const { uploadResume, getMyResumes } = require('../controllers/resumeController');

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.post('/upload', protect, upload.single('resume'), uploadResume);
router.get('/', protect, getMyResumes);

module.exports = router;
