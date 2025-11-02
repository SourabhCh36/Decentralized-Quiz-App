const API_BASE_URL = '/api';

// Utility function to make API calls
async function apiCall(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const config = { ...defaultOptions, ...options };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return { data, ok: true };
  } catch (error) {
    console.error('API Error:', error);
    return { error, ok: false, response: { data: { error: error.message } } };
  }
}

// Quiz API endpoints
const quizAPI = {
  getQuizzes: () => 
    apiCall('/quizzes', { method: 'GET' }),

  getQuiz: (quizId) => 
    apiCall(`/quizzes/${quizId}`, { method: 'GET' }),

  createQuiz: (quizData) => 
    apiCall('/quizzes', {
      method: 'POST',
      body: JSON.stringify(quizData),
    }),

  playQuiz: (quizId, participant, answers) => 
    apiCall(`/quizzes/${quizId}/play`, {
      method: 'POST',
      body: JSON.stringify({ participant, answers }),
    }),

  getParticipantScore: (address, quizId) => 
    apiCall(`/participants/${address}/quiz/${quizId}`, { method: 'GET' }),

  getStats: () => 
    apiCall('/stats', { method: 'GET' }),

  toggleQuizStatus: (quizId) => 
    apiCall(`/quizzes/${quizId}/status`, { method: 'PATCH' }),

  distributeReward: (participant, quizId, rewardAmount) => 
    apiCall('/rewards/distribute', {
      method: 'POST',
      body: JSON.stringify({ participant, quizId, rewardAmount }),
    }),
};
