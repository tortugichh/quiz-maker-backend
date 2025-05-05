const Question = require('../models/Question');
const Test = require('../models/Test');


const addQuestion = async (req, res) => {
  try {
    const { testId } = req.params;
    const { type, text, options, correctAnswers, correctAnswerText, points } = req.body;
    
    const test = await Test.findById(testId);
    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }
    
    if ((type === 'single' || type === 'multiple') && (!options || options.length < 2)) {
      return res.status(400).json({ 
        message: 'Single and multiple choice questions require at least 2 options' 
      });
    }
    
    if (type === 'single' && (!correctAnswers || correctAnswers.length !== 1)) {
      return res.status(400).json({ 
        message: 'Single choice questions require exactly one correct answer' 
      });
    }
    
    if (type === 'multiple' && (!correctAnswers || correctAnswers.length < 1)) {
      return res.status(400).json({ 
        message: 'Multiple choice questions require at least one correct answer' 
      });
    }
    
    if (type === 'text' && (!correctAnswerText || correctAnswerText.trim() === '')) {
      return res.status(400).json({ 
        message: 'Text questions require a correct answer text' 
      });
    }
    
    const questionData = {
      test: testId,
      type,
      text,
      points: points || 1
    };
    
    if (type === 'single' || type === 'multiple') {
      questionData.options = options;
      questionData.correctAnswers = correctAnswers;
    } else if (type === 'text') {
      questionData.correctAnswerText = correctAnswerText;
    }
    
    const question = await Question.create(questionData);
    
    test.questions.push(question._id);
    await test.save();
    
    res.status(201).json(question);
  } catch (error) {
    console.error('Error adding question:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


const updateQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, text, options, correctAnswers, correctAnswerText, points } = req.body;
    
    let question = await Question.findById(id);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }
    
    if (type && (type !== question.type)) {
      return res.status(400).json({ 
        message: 'Cannot change question type. Please delete and create a new question instead.' 
      });
    }
    
    if ((question.type === 'single' || question.type === 'multiple') && 
        options && options.length < 2) {
      return res.status(400).json({ 
        message: 'Single and multiple choice questions require at least 2 options' 
      });
    }
    
    if (question.type === 'single' && correctAnswers && correctAnswers.length !== 1) {
      return res.status(400).json({ 
        message: 'Single choice questions require exactly one correct answer' 
      });
    }
    
    if (question.type === 'multiple' && correctAnswers && correctAnswers.length < 1) {
      return res.status(400).json({ 
        message: 'Multiple choice questions require at least one correct answer' 
      });
    }
    
    if (question.type === 'text' && 
        correctAnswerText !== undefined && 
        (!correctAnswerText || correctAnswerText.trim() === '')) {
      return res.status(400).json({ 
        message: 'Text questions require a correct answer text' 
      });
    }
    
    if (text) question.text = text;
    if (points) question.points = points;
    
    if (question.type === 'single' || question.type === 'multiple') {
      if (options) question.options = options;
      if (correctAnswers) question.correctAnswers = correctAnswers;
    } else if (question.type === 'text') {
      if (correctAnswerText) question.correctAnswerText = correctAnswerText;
    }
    
    await question.save();
    
    res.json(question);
  } catch (error) {
    console.error('Error updating question:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Question not found' });
    }
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


const deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    
    const question = await Question.findById(id);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }
    
    await Test.findByIdAndUpdate(
      question.test,
      { $pull: { questions: id } }
    );
    
    await question.remove();
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting question:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Question not found' });
    }
    
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


const checkAnswers = async (req, res) => {
  try {
    const { testId } = req.params;
    const { answers } = req.body; 
    
    if (!answers || typeof answers !== 'object') {
      return res.status(400).json({ message: 'Answers must be provided as an object' });
    }
    
    const test = await Test.findById(testId).populate('questions');
    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }
    
    let totalPoints = 0;
    let earnedPoints = 0;
    let correctCount = 0;
    let incorrectCount = 0;
    
    const results = await Promise.all(test.questions.map(async (question) => {
      const questionId = question._id.toString();
      const userAnswer = answers[questionId];
      
      if (userAnswer === undefined) {
        totalPoints += question.points;
        incorrectCount++;
        return {
          questionId,
          correct: false,
          points: 0,
          possiblePoints: question.points
        };
      }
      
      let isCorrect = false;
      
      if (question.type === 'single') {
        isCorrect = userAnswer === question.correctAnswers[0];
      } 
      else if (question.type === 'multiple') {
        const userAnswerArray = Array.isArray(userAnswer) ? userAnswer : [userAnswer];
        isCorrect = question.correctAnswers.length === userAnswerArray.length &&
                    question.correctAnswers.every(answer => userAnswerArray.includes(answer));
      } 
      else if (question.type === 'text') {
        isCorrect = userAnswer.trim().toLowerCase() === question.correctAnswerText.trim().toLowerCase();
      }
      
      totalPoints += question.points;
      if (isCorrect) {
        earnedPoints += question.points;
        correctCount++;
      } else {
        incorrectCount++;
      }
      
      return {
        questionId,
        correct: isCorrect,
        points: isCorrect ? question.points : 0,
        possiblePoints: question.points
      };
    }));
    
    
    const percentageScore = totalPoints > 0 
      ? Math.round((earnedPoints / totalPoints) * 100) 
      : 0;
    
    res.json({
      testId,
      results,
      summary: {
        totalPoints,
        earnedPoints,
        percentageScore,
        correctCount,
        incorrectCount,
        totalQuestions: test.questions.length
      }
    });
  } catch (error) {
    console.error('Error checking answers:', error);
    
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Test not found' });
    }
    
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  addQuestion,
  updateQuestion,
  deleteQuestion,
  checkAnswers
};