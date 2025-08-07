# Issue #6 – Implement Notification and Alert System

## 📋 Overview

This issue addresses the implementation of an in-app notification and alert system to improve user feedback and interaction throughout the application. It aims to notify users about various actions like successful operations, failed attempts, reminders, or updates in a visually and contextually appropriate manner.

The system includes:
Standard alert dialogs for immediate feedback (e.g., errors, confirmations).
Local notifications for scheduled or background reminders.
Ensuring the notification system respects platform-specific permission requirements.


 Tasks Completed
✅ Implemented alert dialogs using Alert.alert() for user action feedback.
✅ Integrated local notifications using react-native-push-notification.
✅ Configured notification channels for Android.
✅ Handled user permissions for notifications.
✅ Verified alerts and notifications work correctly across Android and iOS.
✅ Ensured alerts follow the app's visual theme.


⚙️ Dependencies
Ensure the following packages are installed:

react-native-push-notification
For iOS support: @react-native-community/push-notification-ios (if required)

