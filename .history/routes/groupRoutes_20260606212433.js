const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const { 
  createGroup, 
  joinGroup, 
  getGroup 
} = require('../controllers/groupController');

router.post('/create', protect, createGroup);
router.post('/join', protect, joinGroup);
router.get('/:groupId', protect, getGroup);

module.exports = router;