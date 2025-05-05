const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');


dotenv.config();


const testRoutes = require('./routes/testRoute');
const questionRoutes = require('./routes/questionRoutes');



const app = express();
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));


app.use(cors());

app.use(express.json());


app.use('/api/tests', testRoutes);
app.use('/api', questionRoutes);


app.get('/', (req, res) => {
  res.send('QuizMaker API is running');
});


app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'production' ? {} : err
  });
});


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;