# Daily Focus Coach

🌐 **Live App**: https://daily-focus-coach-9eyd3we4p-johns-projects-58c2e0cf.vercel.app

An AI-powered daily focus coach that helps you identify and complete your most important tasks while tracking progress toward bigger goals.

## 🎯 MVP Status: ✅ COMPLETED

The MVP is fully functional with all core features implemented and tested. Ready for deployment and daily use!

## ✨ Features

### 🎯 Core Functionality
- **Daily Focus Management**: Set and track your most important daily task with refresh capability
- **Daily Inspirational Quotes**: AI-generated motivational quotes with mood selection (motivational, business-focused, funny & witty, or dad jokes)
- **AI-Powered Insights**: Uses OpenAI GPT-4 to analyze patterns and provide intelligent recommendations
- **Goal Management**: Track both big goals and tiny daily tasks with progress visualization
- **Recurring Tasks**: Manage weekly and monthly recurring tasks with smart scheduling

### 🎨 User Experience
- **Tabbed Settings Interface**: Professional 5-tab navigation (General, Recurring, Stats, Achievements, Advanced)
- **Smart API Key Management**: Intelligent detection of environment vs user API keys with status indicators
- **Light & Dark Themes**: Toggle between themes with smooth transitions and comprehensive dark mode support
- **Mobile Optimized**: Responsive design with horizontal scroll tabs and touch-friendly interface
- **PWA Support**: Install as an app on your phone for native-like experience
- **Robust Update System**: Automatic PWA updates with user notifications and seamless deployment

### 📊 Data & Analytics
- **Enhanced Stats Display**: Beautiful 2x2 grid layout showing completion metrics and streaks
- **Progress Visualization**: See your completion history and momentum over time
- **Achievements System**: Comprehensive tracking of goal completions with detailed statistics
- **Recent Completions**: View your last 10 completed goals with completion dates and undo functionality
- **Streak Tracking**: Monitor current and longest completion streaks for motivation
- **Data Export**: Download complete backup of all your tasks, goals, and settings as JSON
- **Data Reset**: Secure data deletion with confirmation dialog for fresh starts

### 🔒 Privacy & Storage
- **Local Storage**: Your data stays private and secure on your device
- **Cross-Device Access**: Works seamlessly on iPhone, Mac, and other devices
- **No Tracking**: No analytics or tracking scripts, full privacy protection
- **Offline-First**: Full functionality without internet connection

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

#### Option 1: Shared API Key (Recommended for Production)
1. Set environment variable `VITE_OPENAI_API_KEY` with your OpenAI API key
2. Deploy - all users get AI features immediately without setup
3. See [OPENAI-API-SETUP.md](OPENAI-API-SETUP.md) for detailed instructions

#### Option 2: Individual User API Keys
1. Click the settings gear icon in the top right
2. Enter your OpenAI API key in the "OpenAI API Key" field
3. Configure your preferences (theme, daily quotes)
4. Start setting your daily focus!

**Note**: Environment variable takes priority over user-provided keys.

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

### 🌐 Live Production App
- **URL**: https://daily-focus-coach-9eyd3we4p-johns-projects-58c2e0cf.vercel.app
- **Platform**: Vercel
- **Status**: ✅ Live and fully functional
- **Auto-Deploy**: Enabled on GitHub pushes

### Build for Production

```bash
npm run build
```

### Deploy to Vercel (Recommended)

The app is already deployed on Vercel with the following configuration:

1. **Project**: `daily-project-coach`
2. **Framework**: Vite (auto-detected)
3. **Build Command**: `vite build`
4. **Output Directory**: `dist`
5. **Node Version**: 22.x

**To deploy your own instance:**
1. Fork this repository
2. Connect your GitHub repository to Vercel
3. Vercel will automatically detect it's a Vite project
4. Deploy with default settings

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

## Database & Cloud Sync Implementation

### 🚀 Next Phase: Cross-Device Synchronization
We're implementing Supabase-powered cloud sync to enable seamless access across iPhone, desktop, and all devices while maintaining the current offline-first experience.

**Implementation Documents:**
- 📋 **[DATABASE-CHECKLIST.md](DATABASE-CHECKLIST.md)** - Day-by-day implementation checklist
- 📖 **[DATABASE-IMPLEMENTATION-PLAN.md](DATABASE-IMPLEMENTATION-PLAN.md)** - Complete technical specification
- 🗄️ **[database-setup.sql](database-setup.sql)** - Ready-to-run SQL setup script

### Implementation Timeline (10 Days)
- **Phase 1 (Days 1-3)**: Supabase setup, authentication, core services
- **Phase 2 (Days 4-7)**: Hybrid storage, data migration, sync implementation
- **Phase 3 (Days 8-10)**: Real-time features, testing, production deployment

### Key Features Coming
- ✅ **Cross-Device Sync**: Access your data on iPhone, Mac, and any device
- ✅ **Offline-First**: Maintains current instant responsiveness
- ✅ **Real-time Updates**: Live synchronization across devices
- ✅ **Data Safety**: Cloud backup with local fallback
- ✅ **User Choice**: Optional cloud sync, local-only still available
- ✅ **Zero Disruption**: Existing users continue seamlessly

## Future Roadmap

### Phase 2 Features (Post-Database)
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

## Troubleshooting

### Daily Quotes Not Loading

**Problem**: Daily Inspiration shows "Click the refresh button to get your daily inspiration!"

**Solutions**:
1. **Check API Key Setup**:
   - Environment variable: Ensure `VITE_OPENAI_API_KEY` is set in Vercel
   - User key: Go to Settings → Enter OpenAI API key → Save
   - Verify key starts with `sk-` and is valid

2. **Check Browser Console**:
   - Open Developer Tools (F12) → Console tab
   - Look for detailed logging about quote generation
   - Check for API errors or key validation issues

3. **Verify OpenAI Account**:
   - Ensure API key has sufficient credits
   - Check [OpenAI Usage Dashboard](https://platform.openai.com/usage)
   - Verify API key permissions

### Settings Navigation Issues

**Problem**: Can't find specific settings or navigate the Settings panel

**Solution**: Settings now uses a modern tabbed interface:
- **General Tab**: Theme selection and daily quote preferences
- **Recurring Tab**: Manage recurring tasks and schedules
- **Stats Tab**: View completion metrics in beautiful 2x2 grid layout
- **Achievements Tab**: Track goal completions, streaks, and view achievement history
- **Advanced Tab**: API key management, data export, and reset options

**Multiple ways to close Settings**:
- **X Button**: Top-right corner of Settings panel
- **Gear Icon Toggle**: Click gear icon again to close
- **Cancel Button**: Bottom of Settings panel

### Dark Mode Issues

**Problem**: Some elements not properly themed in dark mode

**Solution**: All components now have comprehensive dark mode support:
- Header elements (title, buttons, borders)
- Settings panel (all form elements)
- Modal dialogs and dropdowns
- Proper contrast ratios maintained

### Cloud Sync Errors

**Problem**: "Cloud sync is not available" error message

**Solution**: This is expected behavior when Supabase is not configured:
- Error now shows as yellow warning (not red error)
- App works perfectly with local storage
- All features function normally without cloud sync
- Message explains local storage is being used

### Quote Refresh Not Working

**Problem**: Clicking refresh button doesn't generate new quotes

**Solutions**:
1. **Check API Key**: Same as "Daily Quotes Not Loading" above
2. **Check Console**: Look for detailed refresh logging
3. **Try Different Moods**: Test with different quote moods
4. **Verify Network**: Ensure internet connection is stable

### Settings Not Saving

**Problem**: Changes in Settings don't persist

**Solutions**:
1. **Click Save**: Ensure you click "Save Settings" button
2. **Check Local Storage**: Verify browser allows localStorage
3. **Clear Cache**: Try clearing browser cache and cookies
4. **Incognito Mode**: Test in private/incognito window

### App Performance Issues

**Problem**: App feels slow or unresponsive

**Solutions**:
1. **Clear Browser Cache**: Hard refresh (Ctrl+Shift+R)
2. **Check Network**: Verify stable internet connection
3. **Update Browser**: Ensure using modern browser version
4. **Disable Extensions**: Test with browser extensions disabled

### Mobile/PWA Issues

**Problem**: App doesn't work well on mobile or as PWA

**Solutions**:
1. **Install as PWA**: Use browser's "Add to Home Screen"
2. **Update Browser**: Ensure mobile browser is up to date
3. **Check Viewport**: App is optimized for mobile screens
4. **Touch Targets**: All buttons are touch-friendly

### API Rate Limiting

**Problem**: Getting rate limit errors from OpenAI

**Solutions**:
1. **Check Usage**: Monitor OpenAI usage dashboard
2. **Set Limits**: Configure usage limits in OpenAI account
3. **Upgrade Plan**: Consider higher tier OpenAI plan
4. **Reduce Requests**: Limit quote refresh frequency

### Data Loss Prevention

**Problem**: Worried about losing data

**Solutions**:
1. **Export Data**: Use Settings → Export feature (when available)
2. **Browser Backup**: Data persists in localStorage
3. **Cloud Sync**: Set up Supabase for cloud backup
4. **Multiple Devices**: Use same browser account across devices

### Development Issues

**Problem**: Issues running locally

**Solutions**:
1. **Node Version**: Ensure Node.js 18+ is installed
2. **Dependencies**: Run `npm install` to update packages
3. **Environment**: Create `.env.local` with API key
4. **Port Conflicts**: Try different port with `npm run dev -- --port 3000`

### Debugging Tips

**Enable Detailed Logging**:
1. Open browser Developer Tools (F12)
2. Go to Console tab
3. Look for messages starting with:
   - "Loading daily quote..."
   - "Refreshing quote..."
   - "Settings saved..."

**Check Network Requests**:
1. Developer Tools → Network tab
2. Look for OpenAI API requests
3. Check response status codes
4. Verify request headers include API key

## Support

If you encounter any issues or have questions:

1. **Check Troubleshooting**: Review the section above first
2. **Check Console**: Look for error messages in browser console
3. **Check Documentation**: Review [OPENAI-API-SETUP.md](OPENAI-API-SETUP.md)
4. **Create Issue**: Open a GitHub issue with detailed information
5. **Include Details**: Browser version, error messages, steps to reproduce

## Acknowledgments

- OpenAI for providing the GPT-4 API
- The React and Vite communities for excellent tooling
- Tailwind CSS for the utility-first CSS framework
- Lucide for the beautiful icon set
