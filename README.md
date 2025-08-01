# Daily Focus Coach

An AI-powered daily focus coach that helps you identify and complete your most important tasks while tracking progress toward bigger goals.

## 🎯 MVP Status: ✅ COMPLETED

The MVP is fully functional with all core features implemented and tested. Ready for deployment and daily use!

## ✨ Features

- **Daily Focus Question**: "What is the most important thing you can work on today?"
- **AI-Powered Insights**: Uses OpenAI GPT-4 to analyze patterns and provide intelligent recommendations
- **Goal Management**: Track both big goals and tiny daily tasks
- **Recurring Tasks**: Manage weekly and monthly recurring tasks with smart scheduling
- **Progress Visualization**: See your completion history and momentum
- **Cross-Device Access**: Works seamlessly on iPhone, Mac, and other devices
- **Local Storage**: Your data stays private and secure on your device
- **PWA Support**: Install as an app on your phone for native-like experience
- **Full-Screen Layout**: Clean, distraction-free interface optimized for focus

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- OpenAI API key (for AI features)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd daily-focus-coach
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser to `http://localhost:5173`

### Configuration

1. Click the settings icon in the top right
2. Enter your OpenAI API key
3. Configure your preferences (reminder time, notifications)
4. Start setting your daily focus!

## Usage

### Daily Workflow

1. **Morning Check-in**: Review yesterday's completion status
2. **Set Today's Focus**: Define your most important task
3. **AI Assistance**: Use the brain dump feature to get AI recommendations
4. **Track Progress**: Mark tasks complete and see your momentum
5. **Manage Goals**: Add and track both big goals and tiny tasks

### AI Features

- **Brain Dump Synthesis**: List everything on your mind, AI finds the priority
- **Pattern Analysis**: AI identifies your productivity patterns and trends
- **Goal Breakdown**: AI helps break big goals into daily actionable tasks
- **Priority Recommendations**: AI suggests what to focus on based on your history

## Technology Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS with custom design system
- **Icons**: Lucide React
- **AI**: OpenAI GPT-4 API
- **Storage**: Browser localStorage (with export/import capabilities)
- **PWA**: Service worker and manifest for app-like experience

## Project Structure

```
src/
├── components/          # React components
│   ├── Dashboard.tsx    # Main dashboard layout
│   ├── FocusCard.tsx    # Daily focus input/display
│   ├── GoalsList.tsx    # Big goals management
│   ├── TinyGoalsList.tsx # Quick tasks
│   └── ...
├── hooks/              # Custom React hooks
│   ├── useAI.ts        # AI service integration
│   └── useLocalStorage.ts # Storage utilities
├── services/           # Business logic
│   ├── ai.ts           # OpenAI API integration
│   └── storage.ts      # Data persistence
├── types/              # TypeScript definitions
├── utils/              # Helper functions
└── App.tsx             # Main application component
```

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Code Style

- TypeScript strict mode enabled
- Functional components with hooks
- Tailwind CSS for styling
- ESLint for code quality

## Deployment

### Build for Production

```bash
npm run build
```

### Deploy to Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Vercel will automatically detect it's a Vite project
3. Deploy with default settings

### Deploy to Netlify

1. Build the project: `npm run build`
2. Upload the `dist` folder to Netlify
3. Configure redirects for SPA routing

## Privacy & Security

- **Local Storage**: All data is stored locally in your browser
- **API Key Security**: Your OpenAI API key is stored locally and never sent to our servers
- **No Tracking**: No analytics or tracking scripts
- **Open Source**: Full transparency in how your data is handled

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## Roadmap

### Phase 2 Features
- [ ] Cloud sync with user accounts
- [ ] Team/family sharing capabilities
- [ ] Advanced analytics and reporting
- [ ] Calendar integration
- [ ] Voice input for task creation

### Phase 3 Features
- [ ] Habit tracking integration
- [ ] Time tracking capabilities
- [ ] Pomodoro timer integration
- [ ] Third-party app integrations (Notion, Todoist)
- [ ] Advanced AI coaching with personality

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/your-username/daily-focus-coach/issues) page
2. Create a new issue with detailed information
3. For AI-related issues, verify your OpenAI API key is valid and has sufficient credits

## Acknowledgments

- OpenAI for providing the GPT-4 API
- The React and Vite communities for excellent tooling
- Tailwind CSS for the utility-first CSS framework
- Lucide for the beautiful icon set
