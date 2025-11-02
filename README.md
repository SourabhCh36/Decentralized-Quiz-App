# Stellar Quiz Platform - Full Stack Web App

A complete full-stack web application for managing and participating in quizzes with rewards, built on top of the Soroban smart contract from `contracts/hello-world/src/lib.rs`.

## Architecture

### Backend (Express.js)
- RESTful API for quiz management
- Quiz creation, submission, and scoring
- Participant tracking and reward distribution
- Real-time statistics

### Frontend (React + Vite)
- Modern, responsive UI with Tailwind-like styling
- Quiz browsing and discovery
- Interactive quiz player
- Admin panel for quiz creation
- Dashboard with platform statistics
- Mobile-friendly design

## Project Structure

```
web-app/
├── backend/
│   ├── server.js          # Express server
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/    # React components
│   │   │   ├── QuizList.jsx
│   │   │   ├── QuizPlayer.jsx
│   │   │   ├── QuizCreator.jsx
│   │   │   └── Dashboard.jsx
│   │   ├── services/
│   │   │   └── api.js     # API client
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── package.json           # Monorepo config
└── README.md
```

## Installation

### Prerequisites
- Node.js 16+ and npm
- Stellar testnet account (for future Soroban integration)

### Setup Instructions

1. **Install dependencies**
```bash
cd /path/to/web-app
npm install
```

This will install packages for both backend and frontend due to the monorepo setup.

2. **Start the backend server**
```bash
cd backend
npm run dev
# Server runs on http://localhost:5000
```

3. **In a new terminal, start the frontend dev server**
```bash
cd frontend
npm run dev
# App runs on http://localhost:3000
```

## Features

### User Features
- **Browse Quizzes**: View all available quizzes with details
- **Take Quizzes**: Interactive quiz interface with multiple-choice questions
- **Track Progress**: Visual progress indicators while taking quizzes
- **View Results**: Detailed score breakdown and reward eligibility
- **Dashboard**: Platform statistics and overview

### Admin Features (Toggle "Admin Mode")
- **Create Quizzes**: Add new quizzes with multiple questions
- **Manage Questions**: Edit and remove questions before publishing
- **Set Rewards**: Define reward pools and passing scores
- **Toggle Status**: Activate/deactivate quizzes
- **View Analytics**: Monitor platform statistics

## API Endpoints

### Quizzes
- `GET /api/quizzes` - Get all quizzes
- `GET /api/quizzes/:quizId` - Get specific quiz
- `POST /api/quizzes` - Create new quiz
- `PATCH /api/quizzes/:quizId/status` - Toggle quiz status

### Quiz Participation
- `POST /api/quizzes/:quizId/play` - Submit quiz answers
- `GET /api/participants/:address/quiz/:quizId` - Get participant score

### Statistics
- `GET /api/stats` - Get platform statistics

### Rewards
- `POST /api/rewards/distribute` - Distribute rewards (admin)

## Connecting to Soroban Smart Contract

To integrate with the actual Soroban smart contract:

1. **Install Stellar SDK**
```bash
npm install @stellar/js-sdk soroban-client
```

2. **Update backend `server.js`** to call contract methods:
```javascript
import { Keypair, Networks, TransactionBuilder } from '@stellar/js-sdk';
import { Soroban } from 'soroban-client';

// Initialize contract connection
const sorobanServer = new Soroban.Server(SOROBAN_RPC_URL);
const contractId = 'YOUR_CONTRACT_ID';

// Example: Submit quiz to contract
app.post('/api/quizzes/:quizId/play', async (req, res) => {
  const { participant, answers } = req.body;
  
  // Call contract's play_quiz function
  const tx = await sorobanServer.submitTransaction(
    QuizContract.playQuiz(participant, quizId, answers)
  );
  
  // Process result...
});
```

3. **Update frontend `api.js`** for contract interactions

4. **Implement wallet connection** for authentication

## Development

### Frontend Development
- Uses React 18 with Hooks
- Vite for fast development
- Responsive CSS Grid/Flexbox layout
- Mobile-first design approach

### Backend Development
- Express.js middleware pattern
- In-memory data store (replace with database for production)
- CORS enabled for frontend communication
- Error handling and validation

### Running Tests
```bash
# Backend (when tests are added)
cd backend
npm run test

# Frontend (when tests are added)
cd frontend
npm run test
```

## Building for Production

### Frontend Build
```bash
cd frontend
npm run build
# Creates optimized build in dist/
```

### Backend Production
```bash
cd backend
NODE_ENV=production npm start
```

### Deploy
- Backend: Deploy to Node.js hosting (Heroku, Railway, Render, etc.)
- Frontend: Deploy to CDN (Vercel, Netlify, GitHub Pages, etc.)

## Environment Variables

### Backend (.env)
```
PORT=5000
NODE_ENV=development
SOROBAN_RPC_URL=https://soroban-testnet.stellar.org
NETWORK_PASSPHRASE=Test SDF Network ; September 2015
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000
VITE_SOROBAN_NETWORK=testnet
```

## Future Enhancements

- [ ] Real Soroban contract integration
- [ ] Wallet authentication (Freighter, Stellar Lab)
- [ ] PostgreSQL/MongoDB database
- [ ] User accounts and progress tracking
- [ ] Leaderboards
- [ ] Token/NFT rewards
- [ ] Quiz categories and difficulty levels
- [ ] Question bank management
- [ ] Export results as certificates
- [ ] Advanced analytics

## Technology Stack

**Frontend:**
- React 18
- Vite
- Axios
- CSS Grid/Flexbox

**Backend:**
- Node.js
- Express.js
- CORS

**Blockchain:**
- Stellar/Soroban (pending integration)

## License

MIT

## Support

For issues or questions, please open an issue in the repository.

---

**Built with ⭐ for the Stellar Network**
