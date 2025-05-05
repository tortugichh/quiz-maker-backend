const express = require('express');
const router = express.Router();
const {
  addQuestion,
  updateQuestion,
  deleteQuestion
} = require('../controllers/questionController');

router.post('/tests/:testId/questions', addQuestion);

router.put('/questions/:id', updateQuestion);

router.delete('/questions/:id', deleteQuestion);

module.exports = router;