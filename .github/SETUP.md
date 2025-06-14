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

## Firebase Setup Guide

### Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/).
2. Click **"Add project"**, enter a project name, and follow the setup steps.
3. Once created, go to **Project Settings** and note down:
   - Project Number
   - Project ID
   - Storage Bucket

### Step 2: Register Your App

1. In **Firebase Console**, go to **Project Settings > General**.
2. Under **Your apps**, click **Add App** and select **Android**.
3. Enter your **package name** (e.g., `com.yourappname`).
4. Follow the steps and download the `google-services.json` file.

### Step 3: Configure API Keys and OAuth Clients

1. In **Firebase Console**, go to **Project Settings > Service Accounts**.
2. Set up authentication via **OAuth 2.0**.
3. Obtain API keys and OAuth client IDs.
4. Replace placeholders in `google-services.json` with actual values.

### Step 4: Add `google-services.json` to Your Project

1. Place `google-services.json` inside your React Native project's `android/app/` directory.
2. Open `android/build.gradle` and add:
   ```gradle
   dependencies {
       classpath("com.google.gms:google-services:4.3.10") // Make sure it's the latest version
   }
   ```

## Troubleshooting

If you encounter any issues during setup:

1. Make sure all prerequisites are properly installed
2. Clear npm cache: `npm cache clean --force`
3. Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
4. For Android issues, clean the build: `cd android && ./gradlew clean`
5. For iOS issues, clean the build folder in Xcode

## Environment Variables

Make sure to configure any required environment variables as specified in the project documentation.

## Need Help?

If you're still facing issues, please:

1. Check existing [GitHub Issues](https://github.com/anisharma07/React-native-attendance-app/issues)
2. Create a new issue with detailed information about your problem
3. Contact the maintainer at [anis42390@gmail.com]
