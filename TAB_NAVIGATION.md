# Custom Tab Navigation with SVG Icons

This project now includes a modern, swipeable tab navigation system with SVG icons and a floating action button.

## Features Implemented

### 🎨 Custom Tab Bar with SVG Icons

- **Home Tab**: HomeIcon - Shows the main dashboard with attendance cards
- **Schedule Tab**: ScheduleIcon - Displays the timetable/schedule view
- **Subjects Tab**: SubjectIcon - Lists all subjects with attendance details
- **Tasks Tab**: TaskIcon - Task management interface (demo implementation)

### 🔄 Swipe Navigation

- Swipe left/right between tabs for smooth navigation
- Visual tab indicator shows current active tab
- Tab colors: Normal `#9CA3AF`, Active `#6366F1`

### ➕ Floating Action Button

- Purple floating button with plus icon
- Rotates 45 degrees when pressed (becomes cross)
- Opens a modal with quick actions:
  - **Add Subject** - Navigate to Add screen
  - **Add Task** - Task creation (placeholder)
  - **Generate using AI** - AI screen access
  - **Import Subjects** - Subject import (placeholder)

## File Structure

```
src/
├── components/
│   ├── CustomSwipeTabBar.tsx      # Main tab bar component
│   └── FloatingActionModal.tsx    # Action modal component
├── screens/
│   ├── HomeScreen.tsx             # Updated home screen
│   ├── SubjectsScreen.tsx         # New subjects listing
│   ├── TasksScreen.tsx            # New tasks interface
│   └── TimeTableScreen.tsx        # Schedule/timetable
├── assets/icons/navigation/new/
│   ├── home.tsx                   # Home SVG icon
│   ├── schedule.tsx               # Schedule SVG icon
│   ├── subject-icon.tsx           # Subject SVG icon
│   ├── task-icon.tsx              # Task SVG icon
│   ├── plus-icon.tsx              # Plus/Add SVG icon
│   └── index.ts                   # Icon exports
└── Tabs/
    └── Tabs.tsx                   # Updated tab navigator
```

## How to Use

### Navigation

1. **Tap tabs** at the bottom to switch between screens
2. **Swipe left/right** on the tab bar for gesture navigation
3. **Press the purple + button** to access quick actions

### Customization

Each SVG icon component accepts props:

```tsx
<HomeIcon
  width={24} // Custom width
  height={24} // Custom height
  color="#6366F1" // Custom color
/>
```

### Adding New Tabs

1. Add screen component to `src/screens/`
2. Import in `Tabs.tsx`
3. Add to `TabParamList` type
4. Add `Tab.Screen` in navigator
5. Update `tabRoutes` in `CustomSwipeTabBar.tsx`

## Component Details

### CustomSwipeTabBar

- Handles tab rendering and navigation
- Implements swipe gestures with PanResponder
- Manages floating action button state
- Smooth animations for tab indicator and button rotation

### FloatingActionModal

- Modal with 4 quick action buttons
- Animated entrance/exit with scale and fade
- Each action has icon, color, and callback
- Closes automatically when action is selected

### Icon Components

- React Native SVG components
- Fully customizable (size, color)
- TypeScript interfaces for props
- Optimized for performance

## Colors Used

- **Background**: `#18181B` (Dark)
- **Tab Bar**: `#27272A` (Dark Gray)
- **Normal Tab**: `#9CA3AF` (Gray)
- **Active Tab**: `#6366F1` (Indigo)
- **Floating Button**: `#6366F1` (Indigo)
- **Modal**: `#27272A` with `#3F3F46` borders

The implementation provides a modern, smooth, and intuitive navigation experience that matches current design trends while maintaining excellent performance.
