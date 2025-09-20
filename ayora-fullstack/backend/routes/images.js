const express = require('express');
const router = express.Router();
const {
  uploadImage,
  getImage,
  deleteImage
} = require('../controllers/imageController');
const auth = require('../middleware/auth');

// All image routes require authentication
router.use(auth);

// POST /api/images/upload - Upload image
router.post('/upload', uploadImage);

// GET /api/images/:filename - Get image by filename
router.get('/:filename', getImage);

// DELETE /api/images/:filename - Delete image
router.delete('/:filename', deleteImage);

module.exports = router;
