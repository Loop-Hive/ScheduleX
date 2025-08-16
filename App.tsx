import React, {useEffect} from 'react';
import {
  StatusBar,
  StyleSheet,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import {SafeAreaProvider, SafeAreaView} from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import MainApp from './src/main';
import SplashScreen from 'react-native-splash-screen';
import 'react-native-gesture-handler';
import {enableScreens} from 'react-native-screens';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
enableScreens();

function App(): React.JSX.Element {
  useEffect(() => {
    SplashScreen.hide();
    requestStoragePermission();
  }, []);

  const requestStoragePermission = async () => {
    try {
      if (Platform.OS === 'android') {
        if (Platform.Version >= 33) {
          // Android 13+ (Images, Video, Audio separately)
          const result = await PermissionsAndroid.requestMultiple([
            PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
            PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
            PermissionsAndroid.PERMISSIONS.READ_MEDIA_AUDIO,
          ]);
          console.log('Android 13+ permission result:', result);
        } else {
          // Android 12 and below
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
            {
              title: 'Storage Permission Required',
              message:
                'ScheduleX needs access to your storage to function properly.',
              buttonPositive: 'OK',
            },
          );
          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            console.log('Storage permission granted');
          } else {
            console.log('Storage permission denied');
          }
        }
      }
    } catch (err) {
      console.warn(err);
    }
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <GestureHandlerRootView style={styles.gesture}>
          <StatusBar
            barStyle={'light-content'}
            backgroundColor="#18181B"
            translucent={false}
            hidden={false}
          />
          <MainApp />
          <Toast />
        </GestureHandlerRootView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#18181B',
  },
  gesture: {
    flex: 1,
    backgroundColor: '#18181B',
  },
});

export default App;
