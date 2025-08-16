import { Platform, PermissionsAndroid, Alert } from 'react-native';

export interface PermissionResult {
  granted: boolean;
  canRequestAgain: boolean;
}

export class PermissionsHelper {
  
  /**
   * Check if we need to request storage permissions based on Android version
   * Android 11+ (API 30+) uses scoped storage, so we don't need WRITE_EXTERNAL_STORAGE
   * for app-specific directories
   */
  static needsStoragePermission(): boolean {
    if (Platform.OS !== 'android') return false;
    
    // For Android 11+ (API 30+), we use app-scoped storage which doesn't require permissions
    const androidVersion = Platform.Version as number;
    return androidVersion < 30;
  }

  /**
   * Request storage permissions for Android
   */
  static async requestStoragePermission(forPublicStorage: boolean = false): Promise<PermissionResult> {
    if (Platform.OS !== 'android') {
      return { granted: true, canRequestAgain: false };
    }

    // Android 11+ doesn't need storage permissions for app-scoped directories
    if (!this.needsStoragePermission() && !forPublicStorage) {
      return { granted: true, canRequestAgain: false };
    }

    try {
      // For Android 10 and below, or if explicitly requesting public storage
      if (this.needsStoragePermission() || forPublicStorage) {
        const writeResult = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: 'Storage Permission',
            message: 'App needs storage permission to save CSV files',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        
        const readResult = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          {
            title: 'Storage Permission',
            message: 'App needs storage permission to access files',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );

        const allGranted = writeResult === PermissionsAndroid.RESULTS.GRANTED && 
                          readResult === PermissionsAndroid.RESULTS.GRANTED;
        
        const canRequestAgain = writeResult !== PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN &&
                               readResult !== PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN;

        return {
          granted: allGranted,
          canRequestAgain
        };
      }

      return { granted: true, canRequestAgain: false };

    } catch (error) {
      console.warn('Permission request error:', error);
      return { granted: false, canRequestAgain: true };
    }
  }

  /**
   * Check if storage permissions are currently granted
   */
  static async checkStoragePermission(): Promise<boolean> {
    if (Platform.OS !== 'android') return true;
    
    if (!this.needsStoragePermission()) return true;

    try {
      const writePermission = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
      );
      
      return writePermission;
    } catch (error) {
      console.warn('Permission check error:', error);
      return false;
    }
  }

  /**
   * Show permission explanation dialog
   */
  static showPermissionExplanation(onRetry: () => void, onCancel: () => void) {
    Alert.alert(
      'Storage Permission Required',
      'This app needs storage permission to save CSV files to your device. You can still use the share feature without this permission.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: onCancel,
        },
        {
          text: 'Grant Permission',
          onPress: onRetry,
        },
      ]
    );
  }

  /**
   * Show permission denied dialog
   */
  static showPermissionDenied(onOpenSettings: () => void, onUseAppStorage: () => void) {
    Alert.alert(
      'Permission Denied',
      'Storage permission was denied. You can either:\n\n1. Enable it in Settings\n2. Use app storage (files will be saved in app folder)',
      [
        {
          text: 'Use App Storage',
          onPress: onUseAppStorage,
        },
        {
          text: 'Open Settings',
          onPress: onOpenSettings,
        },
      ]
    );
  }
}
