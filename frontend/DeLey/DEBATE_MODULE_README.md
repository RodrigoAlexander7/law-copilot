# Debate Module - Implementation Guide

## Overview
The Debate Module is a fully interactive legal debate platform where users can configure AI opponents with customizable personalities, voice tones, and debate styles.

## Features Implemented

### 1. **Debate Model Cards** (DebateModelCard Component)
- 3 debate opponent archetypes:
  - **The Prosecutor** ⚔️ - Aggressive, evidence-based criminal law specialist
  - **The Defense Attorney** 🛡️ - Analytical constitutional law defender
  - **The Judge** ⚖️ - Neutral, balanced arbitrator
- Each model includes:
  - Animated avatar with rotation effect
  - Category and difficulty level
  - Color-coded difficulty badges
  - Descriptive tags for filtering
  - Pulsing glow effects
  - Touch animations (scale on press)

### 2. **Configuration Screen** (debate-config.tsx)
Users can fully customize their debate opponent with:

#### Debate Setup
- **Topic Input**: Free text for debate subject
- **Position Selection**: For, Against, or Neutral

#### Voice & Tone Configuration
- **Voice Tone**: Professional, Conversational, Academic, Passionate, Analytical
- **Pace Style**: Slow & Deliberate, Moderate, Fast & Dynamic

#### Personality Traits (0-100 Sliders)
- **Aggressiveness**: Gentle ↔ Forceful
- **Formality**: Casual ↔ Formal
- **Empathy**: Logical ↔ Emotional
- **Humor**: Serious ↔ Witty

#### Debate Style
- **Argument Approach**: Balanced, Aggressive, Socratic, Evidence-Based, Rhetorical

### 3. **Search and Filter System**
- Real-time search by name, category, or tags
- Multi-select tag filtering
- Animated tag chips with staggered entrance
- Active filter counter
- Clear all functionality

### 4. **Debate History** (DebateHistory Component)
- Local storage using AsyncStorage
- Display information:
  - Opponent avatar with position indicator
  - Debate topic (truncated)
  - Position badge (color-coded)
  - Voice tone setting
  - Exchange count
  - Relative timestamps
- Actions:
  - Continue debate
  - Delete debate with confirmation
- Empty state with friendly message

## File Structure

```
app/
├── debate-config.tsx       # Configuration screen for debate setup
└── tabs/
    └── debate.tsx          # Main debate module page

components/
├── DebateModelCard.tsx     # Animated debate opponent cards
└── DebateHistory.tsx       # Debate history with local storage
```

## Animations & Styling

### Animations Used
- **Moti Animations**:
  - Entrance animations (fade + slide)
  - Staggered tag appearances
  - Rotation effects on avatars
  - Scale transitions
  
- **React Native Animated**:
  - Press animations (scale down/up)
  - Pulsing glow effects
  - Border color transitions
  - Opacity changes

### Color Scheme
- **Primary**: #4ecdc4 (Teal/Cyan) - Main accent color
- **Background**: #0a0a0a (Deep black)
- **Cards**: rgba(20, 25, 35, 0.9) (Dark translucent)
- **Difficulty Colors**:
  - Beginner: #4ade80 (Green)
  - Intermediate: #facc15 (Yellow)
  - Advanced: #f87171 (Red)
- **Position Colors**:
  - For: #4ade80 (Green)
  - Against: #f87171 (Red)
  - Neutral: #facc15 (Yellow)

### Effects
- Shadow and glow effects using shadowColor
- Translucent backgrounds with backdrop
- Animated borders
- Gradient-like effects with overlays

## User Flow

1. **Browse Opponents**
   - User sees 3 debate model cards
   - Can search/filter by tags
   - Views difficulty levels

2. **Configure Debate**
   - Tap on a model card
   - Navigate to configuration screen
   - Enter debate topic
   - Select position (For/Against/Neutral)
   - Customize voice & tone
   - Adjust personality sliders
   - Choose argument style
   - Press "Start Debate"

3. **Manage History**
   - View all configured debates
   - See key parameters at a glance
   - Continue or delete debates
   - Debates persist across sessions

## Technical Details

### Storage Format
```json
{
  "id": "1234567890",
  "modelName": "The Prosecutor",
  "modelAvatar": "⚔️",
  "topic": "Should plea bargaining be abolished?",
  "position": "For",
  "aggressiveness": 75,
  "formality": 60,
  "empathy": 30,
  "humor": 20,
  "voiceTone": "Professional",
  "paceStyle": "Fast & Dynamic",
  "argumentStyle": "Evidence-Based",
  "startedAt": "2025-12-26T...",
  "messageCount": 0
}
```

### Dependencies
- `@react-native-async-storage/async-storage` - Local storage
- `moti` - Declarative animations
- `expo-router` - Navigation
- React Native Animated - Core animations

## Future Enhancements (Not Yet Implemented)
- Real debate chat interface
- Backend AI integration
- Speech-to-text for voice debates
- Argument analysis and scoring
- Debate recordings
- Share debate configurations
- Preset difficulty templates
- Real-time tone adjustments

## Notes
- All content in English as requested
- No predefined presets - full customization
- Smooth 60fps animations
- Responsive touch feedback
- Optimized for mobile devices
- Color-coded visual feedback for all parameters
