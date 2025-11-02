// Main App State and Logic
const app = {
  state: {
    currentPage: 'quizzes',
    selectedQuizId: null,
    userAddress: 'user_' + Math.random().toString(36).substr(2, 9),
    isAdmin: false,
  },

  init() {
    this.setupEventListeners();
    this.updateUI();
    this.goToPage('quizzes');
  },

  setupEventListeners() {
    // Navigation tabs
    const navTabs = document.getElementById('navTabs');
    navTabs.addEventListener('click', (e) => {
      if (e.target.classList.contains('tab')) {
        const page = e.target.dataset.page;
        this.goToPage(page);
      }
    });

    // Admin toggle
    const adminToggle = document.getElementById('adminToggle');
    adminToggle.addEventListener('click', () => {
      this.state.isAdmin = !this.state.isAdmin;
      this.updateUI();
    });

    // User address display
    const userAddressEl = document.getElementById('userAddress');
    userAddressEl.textContent = this.state.userAddress.substr(0, 20) + '...';
  },

  updateUI() {
    // Update admin toggle button
    const adminToggle = document.getElementById('adminToggle');
    adminToggle.textContent = this.state.isAdmin ? 'Admin Mode' : 'User Mode';
    adminToggle.classList.toggle('active', this.state.isAdmin);

    // Show/hide create quiz tab
    const createTab = document.getElementById('createTab');
    createTab.classList.toggle('hidden', !this.state.isAdmin);

    // Update active tab
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
      const isActive = tab.dataset.page === this.state.currentPage;
      tab.classList.toggle('active', isActive);
    });
  },

  goToPage(page) {
    this.state.currentPage = page;
    this.updateUI();

    switch (page) {
      case 'quizzes':
        QuizList.render(this.state.userAddress);
        break;
      case 'dashboard':
        Dashboard.render(this.state.userAddress);
        break;
      case 'create':
        if (this.state.isAdmin) {
          // Reset quiz creator state
          QuizCreator.state = {
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
          };
          QuizCreator.render(this.state.userAddress);
        } else {
          this.goToPage('quizzes');
        }
        break;
      default:
        QuizList.render(this.state.userAddress);
    }
  },

  handleQuizSelect(quizId) {
    this.state.selectedQuizId = quizId;
    this.state.currentPage = 'play';
    this.updateUI();
    
    // Hide nav tabs for quiz player view
    const navTabs = document.getElementById('navTabs');
    navTabs.style.display = 'none';
    
    QuizPlayer.render(quizId, this.state.userAddress);
  },

  goBackToQuizzes() {
    // Show nav tabs again
    const navTabs = document.getElementById('navTabs');
    navTabs.style.display = 'flex';
    
    this.goToPage('quizzes');
  },
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  app.init();
});
