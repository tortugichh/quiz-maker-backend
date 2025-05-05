const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  test: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Test',
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['single', 'multiple', 'text'],
    default: 'single'
  },
  text: {
    type: String,
    required: [true, 'Question text is required'],
    trim: true,
    maxlength: [500, 'Question text cannot be more than 500 characters']
  },
  options: {
    type: [String],
    validate: {
      validator: function(v) {
        return this.type === 'text' || (this.type !== 'text' && v.length >= 2);
      },
      message: 'Single and multiple choice questions require at least 2 options'
    }
  },
  correctAnswers: {
    type: [String],
    validate: {
      validator: function(v) {
        if (this.type === 'single') {
          return v.length === 1;
        }
        if (this.type === 'multiple') {
          return v.length >= 1;
        }
        return this.type !== 'text';
      },
      message: 'Invalid correct answers format for the question type'
    }
  },
  correctAnswerText: {
    type: String,
    validate: {
      validator: function(v) {
       
        return this.type !== 'text' || (this.type === 'text' && v && v.trim().length > 0);
      },
      message: 'Text questions require a correct answer text'
    }
  },
  points: {
    type: Number,
    required: true,
    min: [1, 'Points must be at least 1'],
    default: 1
  }
}, { 
  timestamps: true 
});

module.exports = mongoose.model('Question', questionSchema);