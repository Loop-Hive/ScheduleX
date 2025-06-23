# Setup Guide

This guide will help you set up the Attendance & Time Table App on your local development environment.

## Prerequisites

Ensure you have the following installed:

- **Node.js** (Latest LTS recommended) - [Download](https://nodejs.org/)
- **React Native CLI** or **Expo CLI**
- **Android Studio** (For Android emulator) / **Xcode** (For iOS development)

## Installation Steps

### Step 1: Fork the Repository

1. Visit the [project repository](https://github.com/anisharma07/Attendance-AI)
2. Click the **"Fork"** button at the top-right corner to create a personal copy of the repository in your GitHub account.
3. Once forked, go to your forked repo and click the "Code" button.
4. Copy the repository link (choose either HTTPS or SSH) to clone it locally.

### Step 2: Clone Your Fork

1. Open your terminal and run the following command:

```bash
git clone https://github.com/YOUR_USERNAME/Attendance-AI.git
```
Make sure to replace the above URL with the repository link you copied.

### Step 3: Open Your Project
```bash
code Attendance-AI
```

### Step 4: Install Dependencies

```sh
cd Attendance-AI && yarn install && cd android && touch keystore.properties && cp keystore-template.properties keystore.properties
```

### Step 5: Run the App

- **Start Metro Bundler:**

```sh
yarn start
```

- **For Android:**

```sh
yarn react-native run-android
```

- **For iOS (Mac users only):**

```sh
yarn react-native run-ios
```

- **If using Expo:**

```sh
yarn expo start
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
