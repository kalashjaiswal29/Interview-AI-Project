const express = require('express');
const protect = require('../middleware/auth');
const {
  startInterview,
  respondToInterview,
  getInterview,
  getHistory,
} = require('../controllers/interviewController');

const router = express.Router();

router.post('/start', protect, startInterview);
router.post('/:id/respond', protect, respondToInterview);
router.get('/history', protect, getHistory);
router.get('/:id', protect, getInterview);

module.exports = router;
