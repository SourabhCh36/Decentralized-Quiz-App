import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory store for quiz data (replace with database in production)
const quizzesStore = {};
const participantsStore = {};
const statsStore = {
  total_participants: 0,
  total_rewards_distributed: 0,
  highest_score: 0,
  total_quizzes: 0
};

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Quiz platform backend is running' });
});

// Get all quizzes
app.get('/api/quizzes', (req, res) => {
  const quizzes = Object.values(quizzesStore).map(quiz => ({
    ...quiz,
    questions: quiz.questions.map(q => ({
      question_text: q.question_text,
      options: q.options,
      // Don't expose correct_answer for active quizzes
      correct_answer: !quiz.is_active ? q.correct_answer : undefined
    }))
  }));
  res.json({ quizzes, total: quizzes.length });
});

// Get quiz by ID
app.get('/api/quizzes/:quizId', (req, res) => {
  const quiz = quizzesStore[req.params.quizId];
  if (!quiz) {
    return res.status(404).json({ error: 'Quiz not found' });
  }
  
  const safeQuiz = {
    ...quiz,
    questions: quiz.questions.map(q => ({
      question_text: q.question_text,
      options: q.options,
      correct_answer: !quiz.is_active ? q.correct_answer : undefined
    }))
  };
  
  res.json(safeQuiz);
});

// Create quiz (admin only)
app.post('/api/quizzes', (req, res) => {
  const { title, description, questions, reward_pool, passing_score, adminAddress } = req.body;
  
  // Basic validation
  if (!title || !questions || questions.length === 0) {
    return res.status(400).json({ error: 'Invalid quiz data' });
  }
  
  if (passing_score > questions.length) {
    return res.status(400).json({ error: 'Passing score exceeds question count' });
  }
  
  const quizId = Date.now().toString();
  const newQuiz = {
    quiz_id: quizId,
    title,
    description,
    questions,
    reward_pool,
    passing_score,
    creator: adminAddress,
    is_active: true,
    created_at: Date.now()
  };
  
  quizzesStore[quizId] = newQuiz;
  statsStore.total_quizzes += 1;
  
  res.status(201).json({ quizId, message: 'Quiz created successfully' });
});

// Play quiz and submit answers
app.post('/api/quizzes/:quizId/play', (req, res) => {
  const { participant, answers } = req.body;
  const quizId = req.params.quizId;
  
  const quiz = quizzesStore[quizId];
  if (!quiz) {
    return res.status(404).json({ error: 'Quiz not found' });
  }
  
  if (!quiz.is_active) {
    return res.status(400).json({ error: 'Quiz is not active' });
  }
  
  if (answers.length !== quiz.questions.length) {
    return res.status(400).json({ error: 'Number of answers must match questions' });
  }
  
  // Check if already played
  const participantKey = `${participant}-${quizId}`;
  if (participantsStore[participantKey]) {
    return res.status(400).json({ error: 'You have already played this quiz' });
  }
  
  // Calculate score
  let score = 0;
  for (let i = 0; i < quiz.questions.length; i++) {
    if (answers[i] === quiz.questions[i].correct_answer) {
      score += 1;
    }
  }
  
  const record = {
    address: participant,
    score,
    quiz_id: quizId,
    timestamp: Date.now(),
    rewarded: false,
    answers
  };
  
  participantsStore[participantKey] = record;
  statsStore.total_participants += 1;
  
  if (score > statsStore.highest_score) {
    statsStore.highest_score = score;
  }
  
  const passed = score >= quiz.passing_score;
  
  res.json({
    score,
    total_questions: quiz.questions.length,
    passed,
    reward_eligible: passed,
    message: passed ? 'Congratulations! You passed!' : 'You did not pass this quiz'
  });
});

// Get participant score
app.get('/api/participants/:address/quiz/:quizId', (req, res) => {
  const participantKey = `${req.params.address}-${req.params.quizId}`;
  const record = participantsStore[participantKey];
  
  if (!record) {
    return res.json({
      address: req.params.address,
      score: 0,
      quiz_id: req.params.quizId,
      timestamp: 0,
      rewarded: false,
      answers: []
    });
  }
  
  res.json(record);
});

// Get quiz statistics
app.get('/api/stats', (req, res) => {
  res.json(statsStore);
});

// Toggle quiz status (admin only)
app.patch('/api/quizzes/:quizId/status', (req, res) => {
  const quiz = quizzesStore[req.params.quizId];
  if (!quiz) {
    return res.status(404).json({ error: 'Quiz not found' });
  }
  
  quiz.is_active = !quiz.is_active;
  res.json({ quiz_id: req.params.quizId, is_active: quiz.is_active });
});

// Distribute reward (admin only)
app.post('/api/rewards/distribute', (req, res) => {
  const { participant, quizId, rewardAmount } = req.body;
  const participantKey = `${participant}-${quizId}`;
  
  const record = participantsStore[participantKey];
  const quiz = quizzesStore[quizId];
  
  if (!record || !quiz) {
    return res.status(404).json({ error: 'Record or quiz not found' });
  }
  
  if (record.score < quiz.passing_score || record.rewarded) {
    return res.status(400).json({ error: 'Cannot distribute reward' });
  }
  
  record.rewarded = true;
  statsStore.total_rewards_distributed += rewardAmount;
  
  res.json({ message: 'Reward distributed successfully', participant, amount: rewardAmount });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Quiz platform backend running on http://localhost:${PORT}`);
});
