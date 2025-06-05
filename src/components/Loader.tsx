import React from 'react';
import {View, ActivityIndicator, StyleSheet, ColorValue} from 'react-native';

interface LoaderProps {
  size?: number | 'small' | 'large';
  color?: ColorValue;
}

const Loader: React.FC<LoaderProps> = ({size = 'large', color = '#007bff'}) => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={color} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
});

export default Loader;
