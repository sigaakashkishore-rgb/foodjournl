const express = require('express');
const router = express.Router();
const {
  uploadVoice,
  getVoiceRecording,
  deleteVoiceRecording
} = require('../controllers/voiceController');
const auth = require('../middleware/auth');

// All voice routes require authentication
router.use(auth);

// POST /api/voice/upload - Upload and process voice recording
router.post('/upload', uploadVoice);

// GET /api/voice/:filename - Get voice recording by filename
router.get('/:filename', getVoiceRecording);

// DELETE /api/voice/:filename - Delete voice recording
router.delete('/:filename', deleteVoiceRecording);

module.exports = router;
