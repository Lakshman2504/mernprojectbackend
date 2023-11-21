const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = 4000;

// Enable CORS
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Body parser middleware
app.use(bodyParser.json());

// MongoDB connection
mongoose.connect('mongodb+srv://chennupati2504:lakshman%2325@cluster0.lktmtbc.mongodb.net/test', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;

db.on('error', (err) => {
  console.log('MongoDB connection error:', err);
});

db.once('open', () => {
  console.log('Connected to MongoDB');
});

// MongoDB connection for students
const studentDB = mongoose.createConnection('mongodb+srv://chennupati2504:lakshman%2325@cluster0.lktmtbc.mongodb.net/student', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

studentDB.on('error', (err) => {
  console.log('Student DB connection error:', err);
});

studentDB.once('open', () => {
  console.log('Connected to Student DB');
});

// Student model
// Student model
const studentSchema = new mongoose.Schema({
  registrationNumber: String, 
  score: Number,
});

const Student = studentDB.model('Student', studentSchema);


// Question model
const questionSchema = new mongoose.Schema({
  
  testTitle: String,
  testTime: Number,
  questions: [{
    question: String,
    options: [String],
    correctAnswer: String
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Question = mongoose.model('Question', questionSchema);

// Save questions
app.post('/questions', async (req, res) => {
  const { testTitle, testTime, questions } = req.body;


  try {
    const newQuestion = await Question.create({
      
      testTitle,
      testTime,
      questions: questions.map(({ question, options, correctAnswer }) => ({
          question,
          options,
          correctAnswer,
        })),
        createdAt: new Date(),
    });
    res.status(201).json({ newQuestion });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete question
app.delete('/questions/:id', async (req, res) => {
  try {
    await Question.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Question deleted' });
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
});

// Update question
app.put('/questions/:id', async (req, res) => {
  try {
    const updatedQuestion = await Question.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.status(200).json(updatedQuestion);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
});

// Retrieve all questions
// Retrieve all questions with test title and test time
app.get('/questions', async (req, res) => {
  try {
    const questions = await Question.find({}, 'testTitle testTime questions')
      .sort({ createdAt: -1 });

    res.status(200).json(questions);
  
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// Save student data

app.post('/saveStudentData', async (req, res) => {
  try {
    const { registrationNumber, score } = req.body;
    console.log('Received data from client - Registration Number:', registrationNumber, 'Score:', score); 

    const newStudent = await Student.create({ 
      registrationNumber,  
      score
    });
    console.log('Student data saved successfully:', newStudent);
    res.status(201).json({ message: 'Student data saved successfully' });
  } catch (error) {
    console.error('Error saving student data:', error);
    res.status(500).json({ message: error.message });
  }
});



// Fetch all student data
app.get('/saveStudentData', async (req, res) => {
  try {
    const students = await Student.find({}, 'registrationNumber score').sort({ _id: -1 });
    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
