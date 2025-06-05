import React from 'react';
import {View, StyleSheet} from 'react-native';

const Spacer = () => {
  return <View style={styles.spacer} />;
};

const styles = StyleSheet.create({
  spacer: {
    height: 100,
    borderRadius: 10,
    padding: 18,
    width: '100%',
  },
});

export default Spacer;
