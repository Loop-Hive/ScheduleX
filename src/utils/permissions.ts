// import { Platform, Alert } from 'react-native';
// import { check, request, PERMISSIONS, RESULTS, openSettings } from 'react-native-permissions';

// export interface PermissionResult {
//   granted: boolean;
//   canRequestAgain: boolean;
// }

// export class PermissionsHelper {
  
//   /**
//    * Check if we need to request storage permissions based on Android version
//    * Android 11+ (API 30+) uses scoped storage, so we don't need WRITE_EXTERNAL_STORAGE
//    * for app-specific directories
//    */
//   static needsStoragePermission(): boolean {
//     return Platform.OS === 'android';
//   }

//   /**
//    * Request storage permissions for Android
//    */
//   static async requestStoragePermission(): Promise<PermissionResult> {
//     if (Platform.OS === 'android') {
//       const permission = PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE;
//       try {
//         const result = await request(permission);
//         if (result === RESULTS.GRANTED) {
//           return { granted: true, canRequestAgain: false };
//         } else if (result === RESULTS.BLOCKED) {
//           return { granted: false, canRequestAgain: false };
//         } else {
//           return { granted: false, canRequestAgain: true };
//         }
//       } catch (error) {
//         console.warn('Permission request error:', error);
//         return { granted: false, canRequestAgain: true };
//       }
//     } else if (Platform.OS === 'ios') {
//       const permission = PERMISSIONS.IOS.PHOTO_LIBRARY;
//       try {
//         const result = await request(permission);
//         if (result === RESULTS.GRANTED) {
//           return { granted: true, canRequestAgain: false };
//         } else if (result === RESULTS.BLOCKED) {
//           return { granted: false, canRequestAgain: false };
//         } else {
//           return { granted: false, canRequestAgain: true };
//         }
//       } catch (error) {
//         console.warn('Permission request error:', error);
//         return { granted: false, canRequestAgain: true };
//       }
//     }
//     return { granted: true, canRequestAgain: false };
//   }

//   /**
//    * Check if storage permissions are currently granted
//    */
//   static async checkStoragePermission(): Promise<boolean> {
//     if (Platform.OS === 'android') {
//       const permission = PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE;
//       try {
//         const result = await check(permission);
//         return result === RESULTS.GRANTED;
//       } catch (error) {
//         console.warn('Permission check error:', error);
//         return false;
//       }
//     } else if (Platform.OS === 'ios') {
//       const permission = PERMISSIONS.IOS.PHOTO_LIBRARY;
//       try {
//         const result = await check(permission);
//         return result === RESULTS.GRANTED;
//       } catch (error) {
//         console.warn('Permission check error:', error);
//         return false;
//       }
//     }
//     return true;
//   }

//   /**
//    * Show permission explanation dialog
//    */
//   static showPermissionExplanation(onRetry: () => void, onCancel: () => void) {
//     Alert.alert(
//       'Storage Permission Required',
//       'This app needs storage permission to save CSV files to your device. You can still use the share feature without this permission.',
//       [
//         {
//           text: 'Cancel',
//           style: 'cancel',
//           onPress: onCancel,
//         },
//         {
//           text: 'Grant Permission',
//           onPress: onRetry,
//         },
//       ]
//     );
//   }

//   /**
//    * Show permission denied dialog
//    */
//   static showPermissionDenied(onUseAppStorage: () => void) {
//     Alert.alert(
//       'Permission Denied',
//       'Storage permission was denied. You can either:\n\n1. Enable it in Settings\n2. Use app storage (files will be saved in app folder)',
//       [
//         {
//           text: 'Use App Storage',
//           onPress: onUseAppStorage,
//         },
//         {
//           text: 'Open Settings',
//           onPress: () => openSettings(),
//         },
//       ]
//     );
//   }
// }

import { Platform, Alert } from "react-native";
import {
  check,
  request,
  PERMISSIONS,
  RESULTS,
  openSettings,
} from "react-native-permissions";

export interface PermissionResult {
  granted: boolean;
  canRequestAgain: boolean;
}

export class PermissionsHelper {
  /**
   * Check if we need to request storage permissions based on Android version
   */
  static needsStoragePermission(): boolean {
    return Platform.OS === "android";
  }

  /**
   * Request storage permissions for Android & iOS
   */
  static async requestStoragePermission(): Promise<PermissionResult> {
    if (Platform.OS === "android") {
      // For Android 11+, rely on Document Picker instead of MANAGE_EXTERNAL_STORAGE
      const permission =
        Platform.Version >= 30
          ? PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE
          : PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE;

      try {
        const result = await request(permission);
        if (result === RESULTS.GRANTED) {
          return { granted: true, canRequestAgain: false };
        } else if (result === RESULTS.BLOCKED) {
          return { granted: false, canRequestAgain: false };
        } else {
          return { granted: false, canRequestAgain: true };
        }
      } catch (error) {
        console.warn("Permission request error:", error);
        return { granted: false, canRequestAgain: true };
      }
    } else if (Platform.OS === "ios") {
      const permission = PERMISSIONS.IOS.PHOTO_LIBRARY_ADD_ONLY;
      try {
        const result = await request(permission);
        if (result === RESULTS.GRANTED) {
          return { granted: true, canRequestAgain: false };
        } else if (result === RESULTS.BLOCKED) {
          return { granted: false, canRequestAgain: false };
        } else {
          return { granted: false, canRequestAgain: true };
        }
      } catch (error) {
        console.warn("Permission request error:", error);
        return { granted: false, canRequestAgain: true };
      }
    }
    return { granted: true, canRequestAgain: false };
  }

  /**
   * Check if storage permissions are currently granted
   */
  static async checkStoragePermission(): Promise<boolean> {
    if (Platform.OS === "android") {
      const permission =
        Platform.Version >= 30
          ? PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE
          : PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE;

      try {
        const result = await check(permission);
        return result === RESULTS.GRANTED;
      } catch (error) {
        console.warn("Permission check error:", error);
        return false;
      }
    } else if (Platform.OS === "ios") {
      const permission = PERMISSIONS.IOS.PHOTO_LIBRARY_ADD_ONLY;
      try {
        const result = await check(permission);
        return result === RESULTS.GRANTED;
      } catch (error) {
        console.warn("Permission check error:", error);
        return false;
      }
    }
    return true;
  }

  /**
   * Show permission explanation dialog
   */
  static showPermissionExplanation(onRetry: () => void, onCancel: () => void) {
    Alert.alert(
      "Storage Permission Required",
      "This app needs storage permission to save CSV files to your device. You can still use the share feature without this permission.",
      [
        {
          text: "Cancel",
          style: "cancel",
          onPress: onCancel,
        },
        {
          text: "Grant Permission",
          onPress: onRetry,
        },
      ]
    );
  }

  /**
   * Show permission denied dialog
   */
  static showPermissionDenied(onUseAppStorage: () => void) {
    Alert.alert(
      "Permission Denied",
      "Storage permission was denied. You can either:\n\n1. Enable it in Settings\n2. Use app storage (files will be saved in app folder)",
      [
        {
          text: "Use App Storage",
          onPress: onUseAppStorage,
        },
        {
          text: "Open Settings",
          onPress: () => openSettings(),
        },
      ]
    );
  }
}
