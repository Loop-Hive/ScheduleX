# Setup Guide

This guide will help you set up the Attendance & Time Table App on your local development environment.

## Prerequisites

Ensure you have the following installed:

- **Node.js** (Latest LTS recommended) - [Download](https://nodejs.org/)
- **React Native CLI** or **Expo CLI**
- **Android Studio** (For Android emulator) / **Xcode** (For iOS development)

## Installation Steps

### 1. Clone the Repository

```sh
git clone https://github.com/anisharma07/React-native-attendance-app.git
cd Attendance-AI
```

### 2. Install Dependencies

```sh
npm install
# or
yarn install
```

### 3. Run the App

- **Start Metro Bundler:**

```sh
npm start
```

- **For Android:**

```sh
npx react-native run-android
```

- **For iOS (Mac users only):**

```sh
npx react-native run-ios
```

- **If using Expo:**

```sh
npx expo start
```

## Environment Variables

Create a `.env` file in the root directory and add the following environment variable:

```env
GOOGLE_GEMINI_API_KEY=your_gemini_api_key_here
```

### Getting Your Google Gemini API Key:

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Create a new API key
4. Copy the generated API key
5. Replace `your_gemini_api_key_here` in your `.env` file

**Note:** Keep your API key secure and never commit it to version control. The `.env` file should be added to your `.gitignore`.
