# Stellar Quiz - Vanilla HTML, CSS, JavaScript Version

This is a complete conversion of the React-based Stellar Quiz application to vanilla HTML, CSS, and JavaScript with no external frameworks.

## Project Structure

```
frontend/
├── index.html                 # Main HTML file (updated from React version)
├── styles/
│   └── main.css              # All CSS styles combined
├── js/
│   ├── api.js               # API service with fetch-based HTTP calls
│   ├── components.js        # UI components (QuizList, QuizPlayer, QuizCreator, Dashboard)
│   └── app.js              # Main application logic and state management
└── VANILLA_JS_README.md     # This file
```

## Key Features

### 1. No External Dependencies
- ✅ Pure vanilla JavaScript (ES6+)
- ✅ No React, Vue, Svelte, or other frameworks
- ✅ Standard HTML5 and CSS3
- ✅ Fetch API for HTTP requests (replaces axios)

### 2. Components
All React components have been converted to vanilla JavaScript objects:

#### QuizList
- Fetches and displays available quizzes
- Shows quiz cards with title, description, stats, and action buttons
- Handles quiz selection for playing

#### QuizPlayer
- Displays quiz questions one by one
- Manages answer selection
- Shows progress bar and question navigator
- Displays results with score calculation
- Handles form submission

#### QuizCreator
- Form for creating new quizzes
- Add/remove questions dynamically
- Multiple choice options editor
- Admin-only feature (toggled via "Admin Mode" button)

#### Dashboard
- Displays platform statistics
- Shows active/inactive quiz counts
- Lists recent quizzes in a table
- Shows platform connection information

### 3. State Management
Application state is managed through:
- `app.state` - Global application state (current page, user address, admin mode)
- Component-level state objects (QuizPlayer.state, QuizCreator.state)
- DOM updates via innerHTML manipulation

### 4. API Integration
The `quizAPI` object provides methods for:
- `getQuizzes()` - Fetch all quizzes
- `getQuiz(quizId)` - Fetch single quiz
- `createQuiz(quizData)` - Create new quiz
- `playQuiz(quizId, participant, answers)` - Submit quiz answers
- `getStats()` - Fetch dashboard statistics
- Other utility endpoints

## How to Use

### 1. Basic Setup
No build process is required. Simply serve the frontend directory:

```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx http-server

# Or any static file server
```

### 2. Navigation
- **Browse Quizzes** - View all available quizzes
- **Dashboard** - See platform statistics
- **Create Quiz** - Admin-only feature to create new quizzes (click "Admin Mode" first)

### 3. Taking a Quiz
1. Click "Take Quiz" on any quiz card
2. Select answers for each question
3. Use Previous/Next buttons to navigate
4. Click question dots to jump to specific questions
5. Submit when all questions are answered

### 4. Creating a Quiz (Admin)
1. Click "Admin Mode" button
2. Click "Create Quiz" tab
3. Fill quiz details (title, description, rewards, passing score)
4. Add questions with multiple choice options
5. Mark correct answers
6. Submit to create the quiz

## File Sizes Comparison

**React Version:**
- React + ReactDOM: ~40KB (minified)
- Vite build tools
- Multiple source files compiled

**Vanilla Version:**
- index.html: ~1KB
- styles/main.css: ~35KB (all CSS combined)
- js/api.js: ~1.5KB
- js/components.js: ~25KB
- js/app.js: ~4KB
- **Total: ~66.5KB** (no compilation needed, loads instantly)

## Key Differences from React Version

| Aspect | React | Vanilla |
|--------|-------|---------|
| State Management | useState hooks | Object properties |
| Rendering | JSX + Virtual DOM | innerHTML templates |
| Event Handling | onClick handlers | addEventListener/onclick |
| API Calls | axios | fetch API |
| Build Process | Vite | None required |
| Performance | Good | Slightly faster (no framework overhead) |
| Bundle Size | ~40KB + app code | Single HTML page |
| Browser Support | Modern browsers | All modern browsers |

## Browser Compatibility
- Chrome/Edge 60+
- Firefox 55+
- Safari 12+
- Opera 47+

All modern browsers support:
- ES6 JavaScript features
- CSS Grid and Flexbox
- Fetch API
- Promises/Async-await

## Customization

### Changing Colors
Edit CSS variables in `styles/main.css`:
```css
:root {
  --primary: #667eea;
  --secondary: #764ba2;
  --success: #48bb78;
  /* ... etc */
}
```

### Changing API Base URL
Edit `js/api.js`:
```javascript
const API_BASE_URL = '/api'; // Change this
```

### Adding New Components
Create new component objects in `js/components.js` following the pattern:
```javascript
const MyComponent = {
  render(userAddress) {
    // Component rendering logic
  }
};
```

## Performance Notes

1. **No Virtual DOM** - Direct DOM manipulation (faster for smaller apps)
2. **No Framework Overhead** - Smaller bundle, faster parsing
3. **Instant Load** - No build step required
4. **Progressive Enhancement** - Works even if JavaScript is disabled (basic HTML structure shows)

## Future Improvements

If you want to enhance this further:
1. Add local storage for user preferences
2. Implement quiz caching
3. Add service worker for offline support
4. Add PWA manifest for app-like experience
5. Implement lazy loading for images
6. Add analytics tracking

## Migration Notes

If migrating from the React version:
1. All React hooks (useState, useEffect) → Object properties
2. JSX → Template literals with innerHTML
3. Component props → Function parameters
4. Context API → Global `app.state` object
5. React Router → Manual page management in `app.js`

## Troubleshooting

### Pages not loading
- Check browser console for errors
- Ensure API endpoint is correct in `js/api.js`
- Verify CSS file is being loaded

### Styling issues
- Check that `styles/main.css` is linked in HTML
- Verify CSS file path is correct
- Clear browser cache (Ctrl+Shift+Delete)

### API errors
- Check backend is running at correct URL
- Verify API endpoints match backend implementation
- Check CORS headers if calling from different domain

## Support

For issues or questions about this vanilla JavaScript version, review the code structure in:
- `js/components.js` - Component implementation details
- `js/api.js` - API integration patterns
- `js/app.js` - State management and routing
