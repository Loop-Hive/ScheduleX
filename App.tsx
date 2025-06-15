import React, {useEffect} from 'react';
// import 'react-native-reanimated';

import {SafeAreaView, StatusBar, StyleSheet, View} from 'react-native';
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
    <GestureHandlerRootView style={styles.gesture}>
      <View style={styles.container}>
        <StatusBar barStyle={'light-content'} backgroundColor="#18181B" />
        <SafeAreaView style={styles.safeArea}>
          <MainApp />
          <Toast />
        </SafeAreaView>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#18181B',
  },
  safeArea: {
    flex: 1,
  },
  gesture: {
    flex: 1,
  },
});
export default App;
