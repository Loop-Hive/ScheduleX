import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

type Props = {
  onPress?: () => void;
};

const FloatingAddButton: React.FC<Props> = ({onPress}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.addButtonShadow}
        onPress={onPress}
        activeOpacity={0.8}>
        <LinearGradient
          colors={['#8B5CF6', '#A855F7', '#C084FC']}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={styles.addButton}>
          <Text style={styles.addButtonText}>+</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 35, // Position above the bottom navigation bar
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1000,
  },
  addButtonShadow: {
    shadowColor: '#8B5CF6',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
  },
  addButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
});

export default FloatingAddButton;
