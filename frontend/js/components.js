// ==================== QUIZ LIST COMPONENT ====================
const QuizList = {
  async render(userAddress) {
    const mainContent = document.getElementById('mainContent');
    mainContent.innerHTML = '<div class="loading">Loading quizzes...</div>';

    try {
      const response = await quizAPI.getQuizzes();

      if (!response.ok) {
        mainContent.innerHTML = '<div class="error">Failed to load quizzes</div>';
        return;
      }

      const quizzes = response.data.quizzes || [];

      if (quizzes.length === 0) {
        mainContent.innerHTML = `
          <div class="quiz-list">
            <h2>Available Quizzes</h2>
            <div class="empty-state">
              <p>No quizzes available yet. Create one to get started!</p>
            </div>
          </div>
        `;
        return;
      }

      let quizzesHTML = '<div class="quiz-list"><h2>Available Quizzes</h2><div class="quizzes-grid">';

      quizzes.forEach((quiz) => {
        const statusClass = quiz.is_active ? 'active' : 'inactive';
        const statusText = quiz.is_active ? '🟢 Active' : '🔴 Inactive';
        const buttonText = quiz.is_active ? 'Take Quiz' : 'Not Available';

        quizzesHTML += `
          <div class="quiz-card">
            <div class="quiz-header">
              <h3>${quiz.title}</h3>
              <span class="status ${statusClass}">${statusText}</span>
            </div>
            <p class="description">${quiz.description}</p>
            <div class="quiz-stats">
              <div class="stat">
                <span class="label">Questions:</span>
                <span class="value">${quiz.questions.length}</span>
              </div>
              <div class="stat">
                <span class="label">Pass Score:</span>
                <span class="value">${quiz.passing_score}</span>
              </div>
              <div class="stat">
                <span class="label">Reward Pool:</span>
                <span class="value">$${quiz.reward_pool}</span>
              </div>
            </div>
            <button 
              class="play-btn" 
              onclick="app.handleQuizSelect('${quiz.quiz_id}')"
              ${!quiz.is_active ? 'disabled' : ''}
            >
              ${buttonText}
            </button>
          </div>
        `;
      });

      quizzesHTML += '</div></div>';
      mainContent.innerHTML = quizzesHTML;
    } catch (error) {
      console.error('Error rendering quizzes:', error);
      mainContent.innerHTML = '<div class="error">Failed to load quizzes</div>';
    }
  },
};

// ==================== QUIZ PLAYER COMPONENT ====================
const QuizPlayer = {
  state: {
    quiz: null,
    answers: [],
    currentQuestion: 0,
    submitted: false,
    result: null,
  },

  async render(quizId, userAddress) {
    const mainContent = document.getElementById('mainContent');
    mainContent.innerHTML = '<div class="loading">Loading quiz...</div>';

    try {
      const response = await quizAPI.getQuiz(quizId);

      if (!response.ok) {
        mainContent.innerHTML = '<div class="error">Quiz not found</div>';
        return;
      }

      this.state.quiz = response.data;
      this.state.answers = new Array(response.data.questions.length).fill(null);
      this.state.currentQuestion = 0;
      this.state.submitted = false;
      this.state.result = null;

      this.renderQuiz(userAddress);
    } catch (error) {
      console.error('Error loading quiz:', error);
      mainContent.innerHTML = '<div class="error">Failed to load quiz</div>';
    }
  },

  renderQuiz(userAddress) {
    if (this.state.submitted && this.state.result) {
      this.renderResult();
      return;
    }

    const mainContent = document.getElementById('mainContent');
    const quiz = this.state.quiz;
    const question = quiz.questions[this.state.currentQuestion];
    const progressPercentage = ((this.state.currentQuestion + 1) / quiz.questions.length) * 100;

    let optionsHTML = '';
    question.options.forEach((option, index) => {
      const checked = this.state.answers[this.state.currentQuestion] === index ? 'checked' : '';
      optionsHTML += `
        <label class="option">
          <input
            type="radio"
            name="answer"
            value="${index}"
            ${checked}
            onchange="QuizPlayer.state.answers[${this.state.currentQuestion}] = ${index}"
          />
          <span class="option-text">${option}</span>
        </label>
      `;
    });

    let dotsHTML = '';
    quiz.questions.forEach((_, index) => {
      const isActive = index === this.state.currentQuestion ? 'active' : '';
      const isAnswered = this.state.answers[index] !== null ? 'answered' : '';
      dotsHTML += `
        <button
          class="dot ${isActive} ${isAnswered}"
          onclick="QuizPlayer.goToQuestion(${index})"
          title="Question ${index + 1}"
        ></button>
      `;
    });

    const navigationHTML = this.state.currentQuestion === quiz.questions.length - 1
      ? `<button class="submit-btn" onclick="QuizPlayer.submitQuiz('${userAddress}')" ${this.state.answers.some(a => a === null) ? 'disabled' : ''}>Submit Quiz</button>`
      : `<button class="nav-btn" onclick="QuizPlayer.nextQuestion()">Next →</button>`;

    mainContent.innerHTML = `
      <div class="quiz-player">
        <div class="quiz-header">
          <h2>${quiz.title}</h2>
          <div class="progress-info">
            Question ${this.state.currentQuestion + 1} of ${quiz.questions.length}
          </div>
        </div>

        <div class="progress-bar">
          <div class="progress-fill" style="width: ${progressPercentage}%"></div>
        </div>

        <div class="question-card">
          <h3 class="question-text">${question.question_text}</h3>
          <div class="options">${optionsHTML}</div>
        </div>

        <div class="quiz-navigation">
          <button 
            class="nav-btn" 
            onclick="QuizPlayer.previousQuestion()"
            ${this.state.currentQuestion === 0 ? 'disabled' : ''}
          >
            ← Previous
          </button>

          <div class="question-dots">${dotsHTML}</div>

          ${navigationHTML}
        </div>
      </div>
    `;
  },

  renderResult() {
    const mainContent = document.getElementById('mainContent');
    const result = this.state.result;
    const quiz = this.state.quiz;
    const passPercentage = Math.round((result.score / result.total_questions) * 100);

    const resultClass = result.passed ? 'passed' : 'failed';
    const heading = result.passed ? '🎉 Congratulations!' : '❌ Try Again';
    const rewardHTML = result.reward_eligible
      ? '<p class="reward-info">✨ You are eligible for rewards!</p>'
      : '';

    mainContent.innerHTML = `
      <div class="quiz-result">
        <div class="result-card ${resultClass}">
          <h2>${heading}</h2>
          <p class="message">${result.message}</p>
          
          <div class="score-display">
            <div class="score-circle">
              <span class="percentage">${passPercentage}%</span>
              <span class="label">Score</span>
            </div>
          </div>

          <div class="score-details">
            <p><strong>Questions Answered:</strong> ${result.total_questions}</p>
            <p><strong>Correct Answers:</strong> ${result.score}</p>
            <p><strong>Pass Score Required:</strong> ${quiz.passing_score}</p>
            ${rewardHTML}
          </div>

          <button class="back-btn" onclick="app.goToPage('quizzes')">
            Back to Quizzes
          </button>
        </div>
      </div>
    `;
  },

  goToQuestion(index) {
    this.state.currentQuestion = index;
    this.renderQuiz(app.state.userAddress);
  },

  previousQuestion() {
    if (this.state.currentQuestion > 0) {
      this.state.currentQuestion--;
      this.renderQuiz(app.state.userAddress);
    }
  },

  nextQuestion() {
    if (this.state.currentQuestion < this.state.quiz.questions.length - 1) {
      this.state.currentQuestion++;
      this.renderQuiz(app.state.userAddress);
    }
  },

  async submitQuiz(userAddress) {
    try {
      const response = await quizAPI.playQuiz(
        this.state.quiz.quiz_id,
        userAddress,
        this.state.answers
      );

      if (!response.ok) {
        alert('Error submitting quiz: ' + response.response.data.error);
        return;
      }

      this.state.result = response.data;
      this.state.submitted = true;
      this.renderResult();
    } catch (error) {
      console.error('Error submitting quiz:', error);
      alert('Error submitting quiz');
    }
  },
};

// ==================== QUIZ CREATOR COMPONENT ====================
const QuizCreator = {
  state: {
    formData: {
      title: '',
      description: '',
      reward_pool: '',
      passing_score: '',
      questions: [],
    },
    currentQuestion: {
      question_text: '',
      options: ['', '', '', ''],
      correct_answer: 0,
    },
    success: false,
    loading: false,
  },

  render(userAddress) {
    const mainContent = document.getElementById('mainContent');

    if (this.state.success) {
      mainContent.innerHTML = `
        <div class="success-message">
          <h2>✅ Quiz Created Successfully!</h2>
          <p>Your quiz has been added to the platform.</p>
        </div>
      `;

      setTimeout(() => {
        app.goToPage('quizzes');
      }, 2000);
      return;
    }

    let questionsHTML = '';
    if (this.state.formData.questions.length > 0) {
      questionsHTML = '<div class="questions-list"><h3>Questions Added (' + this.state.formData.questions.length + ')</h3>';
      this.state.formData.questions.forEach((q, index) => {
        questionsHTML += `
          <div class="question-item">
            <div class="question-preview">
              <strong>${index + 1}. ${q.question_text}</strong>
              <p>Correct answer: ${q.options[q.correct_answer]}</p>
            </div>
            <button
              type="button"
              class="remove-btn"
              onclick="QuizCreator.removeQuestion(${index})"
            >
              Remove
            </button>
          </div>
        `;
      });
      questionsHTML += '</div>';
    }

    let optionsHTML = '';
    this.state.currentQuestion.options.forEach((option, index) => {
      const isCorrect = this.state.currentQuestion.correct_answer === index ? 'checked' : '';
      optionsHTML += `
        <div class="option-input-group">
          <input
            type="text"
            value="${option}"
            onchange="QuizCreator.state.currentQuestion.options[${index}] = this.value"
            placeholder="Option ${index + 1}"
          />
          <label class="radio-label">
            <input
              type="radio"
              name="correct_answer"
              ${isCorrect}
              onchange="QuizCreator.state.currentQuestion.correct_answer = ${index}"
            />
            Correct
          </label>
        </div>
      `;
    });

    mainContent.innerHTML = `
      <div class="quiz-creator">
        <h2>Create New Quiz</h2>
        
        <form onsubmit="QuizCreator.handleSubmit(event, '${userAddress}')">
          <div class="form-section">
            <h3>Quiz Details</h3>
            
            <div class="form-group">
              <label for="title">Quiz Title *</label>
              <input
                type="text"
                id="title"
                name="title"
                value="${this.state.formData.title}"
                onchange="QuizCreator.state.formData.title = this.value"
                placeholder="Enter quiz title"
                required
              />
            </div>

            <div class="form-group">
              <label for="description">Description *</label>
              <textarea
                id="description"
                name="description"
                value="${this.state.formData.description}"
                onchange="QuizCreator.state.formData.description = this.value"
                placeholder="Describe your quiz"
                rows="3"
                required
              ></textarea>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="reward_pool">Reward Pool ($) *</label>
                <input
                  type="number"
                  id="reward_pool"
                  name="reward_pool"
                  value="${this.state.formData.reward_pool}"
                  onchange="QuizCreator.state.formData.reward_pool = this.value"
                  placeholder="Total rewards available"
                  min="0"
                  required
                />
              </div>

              <div class="form-group">
                <label for="passing_score">Passing Score *</label>
                <input
                  type="number"
                  id="passing_score"
                  name="passing_score"
                  value="${this.state.formData.passing_score}"
                  onchange="QuizCreator.state.formData.passing_score = this.value"
                  placeholder="Minimum correct answers to pass"
                  min="1"
                  required
                />
              </div>
            </div>
          </div>

          <div class="form-section">
            <h3>Add Questions</h3>
            
            <div class="question-form">
              <div class="form-group">
                <label for="question_text">Question Text *</label>
                <input
                  type="text"
                  id="question_text"
                  value="${this.state.currentQuestion.question_text}"
                  onchange="QuizCreator.state.currentQuestion.question_text = this.value"
                  placeholder="Enter your question"
                />
              </div>

              <div class="options-container">
                <label>Answer Options *</label>
                ${optionsHTML}
              </div>

              <button
                type="button"
                class="add-question-btn"
                onclick="QuizCreator.addQuestion()"
                ${!this.state.currentQuestion.question_text.trim() ? 'disabled' : ''}
              >
                + Add This Question
              </button>
            </div>
          </div>

          ${questionsHTML}

          <div class="form-actions">
            <button type="button" class="cancel-btn" onclick="app.goToPage('quizzes')">
              Cancel
            </button>
            <button
              type="submit"
              class="submit-btn"
              ${this.state.loading || this.state.formData.questions.length === 0 ? 'disabled' : ''}
            >
              ${this.state.loading ? 'Creating...' : 'Create Quiz'}
            </button>
          </div>
        </form>
      </div>
    `;
  },

  addQuestion() {
    if (!this.state.currentQuestion.question_text.trim() || 
        this.state.currentQuestion.options.some(o => !o.trim())) {
      alert('Please fill all fields for this question');
      return;
    }

    this.state.formData.questions.push({ ...this.state.currentQuestion });

    this.state.currentQuestion = {
      question_text: '',
      options: ['', '', '', ''],
      correct_answer: 0,
    };

    this.render(app.state.userAddress);
  },

  removeQuestion(index) {
    this.state.formData.questions.splice(index, 1);
    this.render(app.state.userAddress);
  },

  async handleSubmit(event, userAddress) {
    event.preventDefault();

    if (!this.state.formData.title || !this.state.formData.description || 
        this.state.formData.questions.length === 0) {
      alert('Please fill all required fields');
      return;
    }

    if (parseInt(this.state.formData.passing_score) > this.state.formData.questions.length) {
      alert('Passing score cannot exceed number of questions');
      return;
    }

    try {
      this.state.loading = true;
      this.render(userAddress);

      const quizData = {
        ...this.state.formData,
        reward_pool: parseInt(this.state.formData.reward_pool),
        passing_score: parseInt(this.state.formData.passing_score),
        adminAddress: userAddress,
      };

      const response = await quizAPI.createQuiz(quizData);

      if (!response.ok) {
        alert('Error creating quiz: ' + response.response.data.error);
        this.state.loading = false;
        this.render(userAddress);
        return;
      }

      this.state.success = true;
      this.render(userAddress);
    } catch (error) {
      console.error('Error creating quiz:', error);
      alert('Error creating quiz');
      this.state.loading = false;
      this.render(userAddress);
    }
  },
};

// ==================== DASHBOARD COMPONENT ====================
const Dashboard = {
  async render(userAddress) {
    const mainContent = document.getElementById('mainContent');
    mainContent.innerHTML = '<div class="loading">Loading dashboard...</div>';

    try {
      const [statsRes, quizzesRes] = await Promise.all([
        quizAPI.getStats(),
        quizAPI.getQuizzes(),
      ]);

      if (!statsRes.ok || !quizzesRes.ok) {
        mainContent.innerHTML = '<div class="error">Failed to load dashboard data</div>';
        return;
      }

      const stats = statsRes.data;
      const quizzes = quizzesRes.data.quizzes || [];
      const activeQuizzes = quizzes.filter(q => q.is_active).length;
      const inactiveQuizzes = quizzes.length - activeQuizzes;

      let quizzesTableHTML = '';
      if (quizzes.length === 0) {
        quizzesTableHTML = '<p class="no-data">No quizzes created yet</p>';
      } else {
        quizzesTableHTML = `
          <div class="quizzes-table">
            <div class="table-header">
              <div class="col-title">Title</div>
              <div class="col-questions">Questions</div>
              <div class="col-reward">Reward Pool</div>
              <div class="col-status">Status</div>
            </div>
        `;

        quizzes.slice(0, 10).forEach((quiz) => {
          const badgeClass = quiz.is_active ? 'active' : 'inactive';
          const badgeText = quiz.is_active ? 'Active' : 'Inactive';
          quizzesTableHTML += `
            <div class="table-row">
              <div class="col-title">${quiz.title}</div>
              <div class="col-questions">${quiz.questions.length}</div>
              <div class="col-reward">$${quiz.reward_pool}</div>
              <div class="col-status">
                <span class="badge ${badgeClass}">${badgeText}</span>
              </div>
            </div>
          `;
        });

        quizzesTableHTML += '</div>';
      }

      mainContent.innerHTML = `
        <div class="dashboard">
          <h2>Platform Dashboard</h2>

          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-icon">📊</div>
              <div class="stat-content">
                <h3>Total Quizzes</h3>
                <p class="stat-value">${stats.total_quizzes}</p>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon">👥</div>
              <div class="stat-content">
                <h3>Total Participants</h3>
                <p class="stat-value">${stats.total_participants}</p>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon">💰</div>
              <div class="stat-content">
                <h3>Rewards Distributed</h3>
                <p class="stat-value">$${stats.total_rewards_distributed}</p>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon">🏆</div>
              <div class="stat-content">
                <h3>Highest Score</h3>
                <p class="stat-value">${stats.highest_score}</p>
              </div>
            </div>
          </div>

          <div class="quizzes-status">
            <h3>Quiz Status Overview</h3>
            <div class="status-cards">
              <div class="status-card active">
                <div class="status-icon">🟢</div>
                <div>
                  <p class="status-label">Active Quizzes</p>
                  <p class="status-number">${activeQuizzes}</p>
                </div>
              </div>
              <div class="status-card inactive">
                <div class="status-icon">🔴</div>
                <div>
                  <p class="status-label">Inactive Quizzes</p>
                  <p class="status-number">${inactiveQuizzes}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="recent-quizzes">
            <h3>Recent Quizzes</h3>
            ${quizzesTableHTML}
          </div>

          <div class="platform-info">
            <h3>Platform Information</h3>
            <div class="info-grid">
              <div class="info-item">
                <strong>Your Address:</strong>
                <code>${userAddress}</code>
              </div>
              <div class="info-item">
                <strong>Network:</strong>
                <p>Stellar Soroban (Testnet)</p>
              </div>
              <div class="info-item">
                <strong>Smart Contract:</strong>
                <p>Quiz Reward Contract</p>
              </div>
              <div class="info-item">
                <strong>Status:</strong>
                <p>✅ Connected</p>
              </div>
            </div>
          </div>
        </div>
      `;
    } catch (error) {
      console.error('Error loading dashboard:', error);
      mainContent.innerHTML = '<div class="error">Failed to load dashboard data</div>';
    }
  },
};
