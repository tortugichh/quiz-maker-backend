const Test = require('../models/Test');
const Question = require('../models/Question');


const getTests = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    let query = {};
    
    if (req.query.search) {
      query.$text = { $search: req.query.search };
    }
    
    if (req.query.tag) {
      query.tags = req.query.tag;
    }
    
    const total = await Test.countDocuments(query);
    
   
    const tests = await Test.find(query)
      .select('-questions') 
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
   
    res.json({
      total,
      page,
      limit,
      tests
    });
  } catch (error) {
    console.error('Error getting tests:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


const getTestById = async (req, res) => {
  try {
    const test = await Test.findById(req.params.id)
      .populate('questions');
    
    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }
    
    res.json(test);
  } catch (error) {
    console.error('Error getting test:', error);
    
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Test not found' });
    }
    
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


const createTest = async (req, res) => {
  try {
    const { title, description, tags } = req.body;
    
    
    if (!title || !description) {
      return res.status(400).json({ message: 'Title and description are required' });
    }
    
    
    const test = await Test.create({
      title,
      description,
      tags: tags || []
    });
    
    res.status(201).json(test);
  } catch (error) {
    console.error('Error creating test:', error);
    
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


const updateTest = async (req, res) => {
  try {
    const { title, description, tags } = req.body;
    
    let test = await Test.findById(req.params.id);
    
    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }
    
    if (title) test.title = title;
    if (description) test.description = description;
    if (tags) test.tags = tags;
    
    await test.save();
    
    res.json(test);
  } catch (error) {
    console.error('Error updating test:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Test not found' });
    }
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


const deleteTest = async (req, res) => {
  try {
    const test = await Test.findById(req.params.id);
    
    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }
    
    await Question.deleteMany({ test: req.params.id });
    
    await test.remove();
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting test:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Test not found' });
    }
    
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getTests,
  getTestById,
  createTest,
  updateTest,
  deleteTest
};