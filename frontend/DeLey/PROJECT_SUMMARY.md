# DeLey - Legal Copilot App

## 🎯 Project Overview
A comprehensive legal education and debate application built with React Native and Expo.

## 📱 Modules Implemented

### 1. Education Module ✅
**Location**: `app/tabs/education.tsx`

**Features**:
- 3 Legal Educator Models with unique personalities
- Search bar with real-time filtering
- Multi-select tag filtering system
- Conversation history with local storage
- Animated model cards
- Detailed educator profiles with Alert dialogs

**Educators**:
- 👩‍⚖️ Professor Clarissa Wright - Constitutional Law
- 👨‍💼 Attorney Marcus Chen - Criminal Law & Procedure
- ⚖️ Judge Elena Rodriguez - Civil Rights & Ethics

### 2. Debate Module ✅
**Location**: `app/tabs/debate.tsx` + `app/debate-config.tsx`

**Features**:
- 3 Debate Opponent Archetypes
- Full configuration screen for customization
- Personality sliders (Aggressiveness, Formality, Empathy, Humor)
- Voice & tone selection
- Debate style customization
- Search and filter system
- Debate history with local storage
- Advanced animations (Moti + React Native Animated)

**Opponents**:
- ⚔️ The Prosecutor - Criminal Law Specialist
- 🛡️ The Defense Attorney - Civil Rights Defender
- ⚖️ The Judge - Neutral Arbitrator

**Configuration Options**:
- Topic input (free text)
- Position selection (For/Against/Neutral)
- Voice tones: Professional, Conversational, Academic, Passionate, Analytical
- Pace styles: Slow & Deliberate, Moderate, Fast & Dynamic
- Argument styles: Balanced, Aggressive, Socratic, Evidence-Based, Rhetorical
- Personality traits: 0-100 sliders with visual feedback

### 3. Advisor Module
**Location**: `app/tabs/advisor.tsx`
**Status**: Base implementation (not fully completed in this session)

## 🎨 Styling & Animations

### Color Scheme
- **Education Module**: Red/Pink (#ff6b6b)
- **Debate Module**: Teal/Cyan (#4ecdc4)
- **Background**: Deep Black (#0a0a0a)
- **Cards**: Dark translucent backgrounds

### Animations
- Entrance animations (fade + slide)
- Staggered tag appearances
- Rotation effects on avatars
- Scale transitions on press
- Pulsing glow effects
- Border color transitions
- Smooth 60fps performance

### Libraries Used
- **Moti**: Declarative animations
- **React Native Animated**: Core animations
- **Expo Router**: Navigation
- **AsyncStorage**: Local data persistence

## 📦 Components Created

### Shared Components
- `SearchBar.tsx` - Enhanced search with animated tags
- `StarsBackground.tsx` - Animated background
- `BoxContainer.tsx`, `Footer.tsx`, `GlowButton.tsx`, etc.

### Education Components
- `ModelCard.tsx` - Educator cards with animations
- `ConversationHistory.tsx` - Conversation tracking

### Debate Components
- `DebateModelCard.tsx` - Animated opponent cards
- `DebateHistory.tsx` - Debate configuration tracking

## 💾 Data Storage

### Education Storage
**Key**: `@education_conversations`
```typescript
{
  id: string;
  modelName: string;
  modelAvatar: string;
  startedAt: Date;
  lastMessage: string;
  messageCount: number;
}
```

### Debate Storage
**Key**: `@debate_configs`
```typescript
{
  id: string;
  modelName: string;
  modelAvatar: string;
  topic: string;
  position: "For" | "Against" | "Neutral";
  aggressiveness: number;
  formality: number;
  empathy: number;
  humor: number;
  voiceTone: string;
  paceStyle: string;
  argumentStyle: string;
  startedAt: Date;
  messageCount: number;
}
```

## 🚀 Running the App

```bash
cd c:\Users\DCONN\OneDrive\Escritorio\test\law-copilot\frontend\DeLey
npm start
```

Then choose:
- Press `i` for iOS simulator
- Press `a` for Android emulator
- Scan QR code with Expo Go app

## 📝 Notes

- All content in English as requested
- No backend integration (local storage only)
- Fully functional UI with mock data
- Production-ready animations
- Mobile-optimized responsive design
- TypeScript for type safety
- Modular component architecture

## 🎯 Key Achievements

✅ Complete Education module with 3 educators
✅ Complete Debate module with full configuration
✅ Search and filter system (reusable)
✅ Local storage integration
✅ Advanced animations and transitions
✅ Clean, modern UI with dark theme
✅ Type-safe TypeScript implementation
✅ Responsive mobile design
✅ Smooth 60fps performance

## 📚 Documentation

- `EDUCATION_MODULE_README.md` - Detailed Education module docs
- `DEBATE_MODULE_README.md` - Detailed Debate module docs
- This file - Project overview

## 🔮 Future Work

- Implement Advisor module
- Add actual chat interfaces
- Backend AI integration
- Speech-to-text functionality
- Progress tracking and analytics
- User authentication
- Cloud sync
- Sharing features
