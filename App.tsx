import React, {useEffect} from 'react';
// import 'react-native-reanimated';

import {StatusBar, StyleSheet} from 'react-native';
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
  }, []);

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
