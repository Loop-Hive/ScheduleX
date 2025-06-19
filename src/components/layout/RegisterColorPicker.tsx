import React from 'react';
import {View, TouchableOpacity, StyleSheet, Text, Modal} from 'react-native';
import {
  Tagcolors,
  getPreviewColorForBackground,
} from '../../types/allCardConstraint';

interface RegisterColorPickerProps {
  visible: boolean;
  onClose: () => void;
  currentColor: string;
  onColorSelect: (color: string) => void;
  registerName: string;
}

const RegisterColorPicker: React.FC<RegisterColorPickerProps> = ({
  visible,
  onClose,
  currentColor,
  onColorSelect,
  registerName,
}) => {
  const handleColorSelect = (color: string) => {
    onColorSelect(color);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Choose color for "{registerName}"</Text>
          <Text style={styles.subtitle}>
            Select a color theme for this register
          </Text>

          <View style={styles.colorGrid}>
            {Tagcolors.map(color => {
              const previewColor = getPreviewColorForBackground(color);
              const isSelected = currentColor === color;

              return (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorCircle,
                    {backgroundColor: previewColor},
                    isSelected && styles.selectedColorCircle,
                  ]}
                  onPress={() => handleColorSelect(color)}
                  activeOpacity={0.8}>
                  {isSelected && (
                    <View style={styles.checkmarkContainer}>
                      <Text style={styles.checkmark}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1F1F22',
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 20,
    maxWidth: 350,
    width: '100%',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 24,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 24,
  },
  colorCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    margin: 8,
    borderWidth: 2,
    borderColor: '#3F3F46',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  selectedColorCircle: {
    borderColor: '#8B5CF6',
    borderWidth: 3,
    transform: [{scale: 1.1}],
  },
  checkmarkContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#3F3F46',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default RegisterColorPicker;
