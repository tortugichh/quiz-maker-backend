const express = require('express');
const router = express.Router();
const {
  getTests,
  getTestById,
  createTest,
  updateTest,
  deleteTest
} = require('../controllers/testController');

const { checkAnswers } = require('../controllers/questionController');

router.get('/', getTests);

router.get('/:id', getTestById);

router.post('/', createTest);

router.put('/:id', updateTest);

router.delete('/:id', deleteTest);

router.post('/:testId/check', checkAnswers);

module.exports = router;