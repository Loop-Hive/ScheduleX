import React from 'react';
import {View, ActivityIndicator, StyleSheet, ColorValue} from 'react-native';

interface DataLoaderProps {
  size?: number | 'small' | 'large';
  color?: ColorValue;
}

const DataLoader: React.FC<DataLoaderProps> = ({
  size = 'large',
  color = '#007bff',
}) => {
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

export default DataLoader;
