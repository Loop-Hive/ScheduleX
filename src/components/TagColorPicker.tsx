import React from 'react';
import {View, TouchableOpacity, StyleSheet} from 'react-native';

interface TagProps {
  selectedColor: string;
  setSelectedColor: (color: string) => void;
}
const TagColorPicker: React.FC<TagProps> = ({
  selectedColor,
  setSelectedColor,
}) => {
  const colors = [
    '#F93827',
    '#FF5733',
    '#FF9D23',
    '#80C4E9',
    '#4CC9FE',
    '#08C2FF',
    '#3b82f6',
    '#16C47F',
    '#2ECC71',
    '#8FD14F',
    '#FFFFFF',
  ];
  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
  };

  return (
    <View style={styles.container}>
      <View style={styles.colorContainer}>
        {colors.map(color => (
          <TouchableOpacity
            key={color}
            style={[
              styles.colorCircle,
              {backgroundColor: color},
              selectedColor === color && styles.selectedColorCircle,
            ]}
            onPress={() => handleColorSelect(color)}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#fff',
  },
  colorContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  colorCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    margin: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedColorCircle: {
    borderColor: '#868686',
    borderWidth: 3,
  },
  selectedText: {
    marginTop: 20,
    fontSize: 16,
    fontWeight: '500',
  },
});

export default TagColorPicker;
