import React from 'react';
import {View, StyleSheet} from 'react-native';
import {Animated} from 'react-native';
const SmoothDrawer = () => {
  return (
    <View style={styles.container}>
      <Animated.View style={styles.animatedBox} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  box: {
    width: 100,
    height: 100,
    backgroundColor: 'blue',
  },
  animatedBox: {
    width: 100,
    height: 100,
    backgroundColor: 'violet',
  },
});

export default SmoothDrawer;
