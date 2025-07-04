import React, {useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
} from 'react-native';

interface FloatingActionModalProps {
  visible: boolean;
  onClose: () => void;
  onAddSubject: () => void;
  // onAddTask: () => void;
  onGenerateAI: () => void;
  onImportSubjects: () => void;
}

const {width, height} = Dimensions.get('window');

const FloatingActionModal: React.FC<FloatingActionModalProps> = ({
  visible,
  onClose,
  onAddSubject,
  // onAddTask,
  onGenerateAI,
  onImportSubjects,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.3,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, fadeAnim, scaleAnim]);

  const modalActions = [
    {
      id: 1,
      title: 'Add Subject',
      icon: '📚',
      color: '#6366F1',
      onPress: onAddSubject,
    },
    {
      id: 2,
      title: 'Generate using AI',
      icon: '🤖',
      color: '#8B5CF6',
      onPress: onGenerateAI,
    },
    {
      id: 3,
      title: 'Import Subjects',
      icon: '📥',
      color: '#F59E0B',
      onPress: onImportSubjects,
    },
  ];

  const handleActionPress = (action: () => void) => {
    onClose();
    setTimeout(() => {
      action();
    }, 150);
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <Animated.View
            style={[
              styles.modalContainer,
              {
                opacity: fadeAnim,
                transform: [{scale: scaleAnim}],
              },
            ]}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Quick Actions</Text>
                  <TouchableOpacity
                    onPress={onClose}
                    style={styles.closeButton}>
                    <Text style={styles.closeIcon}>✕</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.actionsContainer}>
                  {modalActions.map((action, index) => (
                    <Animated.View
                      key={action.id}
                      style={[
                        styles.actionItemContainer,
                        {
                          opacity: fadeAnim,
                          transform: [
                            {
                              translateY: fadeAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [20 * (index + 1), 0],
                              }),
                            },
                          ],
                        },
                      ]}>
                      <TouchableOpacity
                        style={[
                          styles.actionItem,
                          {borderLeftColor: action.color},
                        ]}
                        onPress={() => handleActionPress(action.onPress)}
                        activeOpacity={0.7}>
                        <View style={styles.actionContent}>
                          <View
                            style={[
                              styles.actionIcon,
                              {backgroundColor: `${action.color}20`},
                            ]}>
                            <Text style={styles.actionEmoji}>
                              {action.icon}
                            </Text>
                          </View>
                          <Text style={styles.actionTitle}>{action.title}</Text>
                        </View>
                        <Text style={styles.actionArrow}>›</Text>
                      </TouchableOpacity>
                    </Animated.View>
                  ))}
                </View>

                <View style={styles.modalFooter}>
                  <Text style={styles.footerText}>
                    Choose an action to continue
                  </Text>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </Animated.View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: width * 0.85,
    maxWidth: 400,
  },
  modalContent: {
    backgroundColor: '#27272A',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#3F3F46',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#3F3F46',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#F3F4F6',
  },
  closeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#3F3F46',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIcon: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: 'bold',
  },
  actionsContainer: {
    padding: 8,
  },
  actionItemContainer: {
    marginVertical: 4,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#18181B',
    borderLeftWidth: 4,
    borderColor: '#3F3F46',
  },
  actionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  actionEmoji: {
    fontSize: 18,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#F3F4F6',
  },
  actionArrow: {
    fontSize: 20,
    color: '#9CA3AF',
    fontWeight: '300',
  },
  modalFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#3F3F46',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#6B7280',
  },
});

export default FloatingActionModal;
