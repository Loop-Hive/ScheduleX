# ScheduleX: AI-Powered Attendance & Timetable Management App

A comprehensive **React Native** cross-platform application designed to revolutionize attendance tracking and schedule management. ScheduleX combines intelligent AI scheduling with intuitive attendance monitoring, task management, and seamless data synchronization to help students, professionals, and organizations stay organized and productive.

## 🚀 Features

### 📊 Smart Attendance Tracking
- **Real-time Attendance Management**: Mark and monitor attendance for multiple classes, subjects, or events
- **Target Percentage Tracking**: Set attendance goals and visualize progress with interactive circular charts
- **Attendance Analytics**: Comprehensive statistics and streak tracking with calendar visualization
- **Multiple Register Support**: Manage separate attendance registers for different courses or activities

### 🤖 AI-Powered Scheduling
- **Intelligent Timetable Generation**: Generate optimized schedules using Google's Gemini AI
- **CSV Import/Export**: Import existing schedules or export your data for backup and sharing
- **Schedule Optimization**: AI analyzes your preferences and constraints to create efficient timetables
- **Room & Location Management**: Assign and track classroom or location information

### 📋 Advanced Task Management
- **Task Chat Interface**: Intuitive chat-like interface for task management
- **Priority System**: High, medium, and low priority task categorization
- **Task Completion Tracking**: Mark tasks as complete with timestamps
- **Multi-select Operations**: Bulk operations for efficient task management
- **URL Preview Integration**: Automatic link previews in task descriptions

### 🔄 Data Synchronization & Sharing
- **Timetable Sharing**: Share your schedules with others for direct import
- **Cross-platform Sync**: Data persistence with AsyncStorage for offline access
- **Export Capabilities**: Multiple export formats for data portability
- **Backup & Restore**: Secure data backup and restoration features

### 📱 Enhanced User Experience
- **Material Design UI**: Modern, intuitive interface following Material Design principles
- **Haptic Feedback**: Tactile feedback for better user interaction
- **Gesture Controls**: Swipe gestures and pinch-to-zoom functionality
- **Dark/Light Theme**: Adaptive theming for optimal viewing
- **Responsive Design**: Optimized for various screen sizes and orientations

## 🛠️ Tech Stack

### Frontend
- **React Native 0.80.0** - Cross-platform mobile framework
- **TypeScript** - Type-safe development
- **React 19.1.0** - Latest React features and hooks
- **React Native SVG** - Scalable vector graphics support
- **React Native Animatable** - Smooth animations and transitions

### Navigation & UI
- **React Navigation 7.x** - Navigation framework with stack and tab navigators
- **Material Top Tabs** - Material Design tab navigation
- **React Native Gesture Handler** - Advanced gesture recognition
- **React Native Linear Gradient** - Beautiful gradient effects
- **React Native Safe Area Context** - Safe area handling

### State Management & Data
- **Zustand 5.0.2** - Lightweight state management
- **AsyncStorage** - Local data persistence
- **React Native DOTENV** - Environment variable management
- **PapaParse 5.5.2** - CSV parsing and processing

### AI & External Services
- **Google Generative AI 1.5.1** - Gemini AI integration for schedule generation
- **React Native URL Preview** - Automatic URL metadata extraction

### Media & File Handling
- **React Native Image Picker** - Camera and gallery integration
- **React Native Image Crop Picker** - Advanced image selection and cropping
- **React Native Document Picker** - File selection capabilities
- **React Native FS** - File system operations
- **React Native Share** - Native sharing functionality

### Development Tools
- **ESLint** - Code linting and formatting
- **Jest** - Unit testing framework
- **Babel** - JavaScript transpilation
- **Metro** - React Native bundler

### Mobile Platform Support
- **Android** - Full Android support with Gradle build system
- **iOS** - Native iOS support with Xcode project configuration

## 📁 Project Structure

```
ScheduleX/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── cards/          # Card components for attendance display
│   │   ├── Calendar.tsx    # Custom calendar component
│   │   └── TimePicker.tsx  # Time selection component
│   ├── screens/            # Application screens
│   │   ├── home/           # Main dashboard
│   │   ├── generate-ai/    # AI schedule generation
│   │   ├── tasks-chat/     # Task management interface
│   │   ├── time-table/     # Timetable management
│   │   └── streak-calendar/ # Attendance tracking
│   ├── layout/             # Layout components and navigation
│   │   ├── navigation/     # Navigation configuration
│   │   └── Header.tsx      # App header component
│   ├── store/              # State management (Zustand)
│   │   ├── store.ts        # Main application store
│   │   └── taskStore.ts    # Task-specific store
│   ├── utils/              # Utility functions
│   ├── types/              # TypeScript type definitions
│   ├── styles/             # Shared styling
│   └── assets/             # Images, icons, and media files
├── android/                # Android-specific configuration
├── ios/                    # iOS-specific configuration
└── __tests__/              # Test files
```

## 🔧 Installation & Setup

### Prerequisites
- **Node.js** (v16 or higher)
- **React Native CLI** or **Expo CLI**
- **Android Studio** (for Android development)
- **Xcode** (for iOS development, macOS only)
- **Ruby** (for iOS dependencies)

### Installation Steps

1. **Clone the repository**
```bash
git clone https://github.com/Loop-Hive/ScheduleX.git
cd ScheduleX
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
```

3. **Install iOS dependencies** (macOS only)
```bash
cd ios && pod install && cd ..
```

4. **Configure environment variables**
```bash
# Create .env file in root directory
cp .env.example .env
# Add your Google AI API key
GOOGLE_AI_API_KEY=your_api_key_here
```

5. **Android setup**
```bash
# Ensure Android SDK is configured
# Update android/local.properties with SDK path
```

## 🎯 Usage

### Development

**Start Metro bundler**
```bash
npm start
# or
yarn start
```

**Run on Android**
```bash
npm run android
# or
yarn android
```

**Run on iOS** (macOS only)
```bash
npm run ios
# or
yarn ios
```

### Building for Production

**Android APK**
```bash
cd android
./gradlew assembleRelease
```

**iOS Archive** (Xcode required)
```bash
# Open ios/ScheduleX.xcworkspace in Xcode
# Product > Archive for App Store distribution
```

### Mobile Development

The app supports both Android and iOS platforms with platform-specific optimizations:

- **Android**: Minimum SDK 21, targets SDK 34
- **iOS**: Minimum iOS 12.0, supports latest iOS versions
- **Responsive Design**: Adapts to various screen sizes and orientations

## 📱 Platform Support

- ✅ **Android** (API level 21+)
- ✅ **iOS** (12.0+)
- ✅ **Tablet Support** (Android & iPad)
- ✅ **Portrait & Landscape** orientations

## 🧪 Testing

Run the test suite:
```bash
npm test
# or
yarn test
```

Run tests with coverage:
```bash
npm run test -- --coverage
```

The project includes unit tests for core components and utility functions using Jest and React Test Renderer.

## 🔄 Deployment

### Android Play Store
1. Build signed APK using the release configuration
2. Upload to Google Play Console
3. Configure app metadata and screenshots

### iOS App Store
1. Archive the project in Xcode
2. Upload to App Store Connect
3. Submit for App Store review

### Direct Distribution
- **Android**: Generate APK for direct installation
- **iOS**: Use TestFlight for beta distribution

## 📊 Performance & Optimization

- **Lazy Loading**: Components and screens load on demand
- **Image Optimization**: Efficient image caching and compression
- **Memory Management**: Proper cleanup of resources and listeners
- **Gesture Optimization**: Hardware-accelerated gesture handling
- **Data Persistence**: Efficient local storage with AsyncStorage
- **Bundle Size**: Optimized dependencies and tree-shaking

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add some amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### Development Guidelines

- **Code Style**: Follow ESLint configuration
- **TypeScript**: Use proper type definitions
- **Testing**: Add tests for new features
- **Documentation**: Update README for significant changes
- **Commits**: Use conventional commit messages
- **Performance**: Consider performance impact of changes

### Setting Up Development Environment

1. Follow installation steps above
2. Install development tools: `npm install -g @react-native-community/cli`
3. Configure IDE with TypeScript and ESLint plugins
4. Test on both platforms before submitting PR

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Google Generative AI** - For intelligent schedule generation
- **React Native Community** - For excellent libraries and tools
- **Material Design** - For UI/UX inspiration
- **Open Source Contributors** - For dependency libraries

## 📞 Support & Contact

- **Issues**: [GitHub Issues](https://github.com/Loop-Hive/ScheduleX/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Loop-Hive/ScheduleX/discussions)
- **Documentation**: [Project Wiki](https://github.com/Loop-Hive/ScheduleX/wiki)

### Getting Help

1. Check existing issues and documentation
2. Create a detailed issue with reproduction steps
3. Include device information and logs
4. Use appropriate issue templates

---

**ScheduleX** - Revolutionizing attendance tracking and schedule management with the power of AI 🚀