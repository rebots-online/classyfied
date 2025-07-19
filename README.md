# Of Course! - Interactive Learning App Generator

Generate interactive learning applications from YouTube content or topics using AI. This app transforms educational content into engaging, interactive experiences with lesson plans, handouts, and quizzes.

## Features

- **YouTube Integration**: Extract content from YouTube videos automatically
- **Topic-based Generation**: Create apps from any educational topic
- **Interactive Elements**: Generate comprehensive learning materials
- **Responsive Design**: Optimized for desktop and mobile viewing
- **Real-time Generation**: Watch the AI create your content live

## Recent Updates

### Layout Optimization (Latest)
- **Fixed Initial Scroll Issues**: Page now fits on screen without scrollbars on load
- **Browser UI Compatibility**: Optimized for Chrome bookmark bars and GNOME desktop environments
- **Responsive Improvements**: Better mobile and tablet experience
- **Reduced Vertical Space**: Minimized padding and gaps throughout the interface

## Run Locally

**Prerequisites:** Node.js (v16 or higher)

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure API Key:**
   Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Open in browser:**
   Navigate to `http://localhost:56872/`

## Project Structure

```
classyfied/
├── components/          # React components
├── lib/                # Utilities and API logic
├── docs/               # Documentation and checklists
├── public/             # Static assets
├── index.css           # Main stylesheet (recently optimized)
└── App.tsx             # Main application component
```

## Contributing

See [CHANGELOG.md](./CHANGELOG.md) for recent changes and development history.
