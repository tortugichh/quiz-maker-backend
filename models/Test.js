const mongoose = require('mongoose');

const testSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Test title is required'],
    trim: true,
    maxlength: [100, 'Test title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Test description is required'],
    trim: true,
    maxlength: [500, 'Test description cannot be more than 500 characters']
  },
  tags: {
    type: [String],
    default: []
  },
  questions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question'
  }]
}, { 
  timestamps: true 
});


testSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Test', testSchema);