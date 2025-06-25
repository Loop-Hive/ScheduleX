import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
  TextInput,
  ActivityIndicator,
  Platform,
  ToastAndroid,
  Alert,
} from 'react-native';
import pickCSVFile from '../utils/csv-picker';
import useStore from '../store/store';
import {CardInterface} from '../types/cards';
import {Tagcolors} from '../types/allCardConstraint';

interface FloatingActionModalProps {
  visible: boolean;
  onClose: () => void;
  onAddSubject: () => void;
  onAddTask: () => void;
  onGenerateAI: () => void;
  onImportSubjects: () => void;
}

const {width, height} = Dimensions.get('window');

const FloatingActionModal: React.FC<FloatingActionModalProps> = ({
  visible,
  onClose,
  onAddSubject,
  onAddTask,
  onGenerateAI,
  onImportSubjects,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const [registerNameModalVisible, setRegisterNameModalVisible] = useState(false);
  const [csvData, setCsvData] = useState<any>(null);
  const [registerName, setRegisterName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [importModalVisible, setImportModalVisible] = useState(false);
  const addRegister = useStore(state => state.addRegister);
  const setRegisters = useStore(state => state.setRegisters);
  const registers = useStore(state => state.registers);

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

  // Helper to generate a new unique register ID
  const getNewRegisterId = () => {
    const ids = Object.keys(registers).map(Number);
    return ids.length ? Math.max(...ids) + 1 : 1;
  };

  // Parse CSV to cards (handles both vertical and horizontal timetable formats)
  const parseCSVToCards = (csvRows: any[]): CardInterface[] => {
    const dayKeys = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    let debugRows: string[] = [];
    const cardsMap: Record<string, CardInterface> = {};

    // Detect horizontal format: first row contains all day names
    const firstRow = csvRows[0]?.map((v: string) => (v || '').trim().toLowerCase());
    let isHorizontal = false;
    if (firstRow && firstRow.length > 2) {
      let dayCols = 0;
      for (let i = 1; i < firstRow.length; i++) {
        if (dayNames.includes(firstRow[i].replace(/[^a-z]/g, ''))) dayCols++;
      }
      if (dayCols >= 2) isHorizontal = true;
    }

    if (isHorizontal) {
      // first column: subject, next columns: days
      // e.g. [Subject, Monday, Tuesday, ...]
      for (let rowIdx = 1; rowIdx < csvRows.length; rowIdx++) {
        const row = csvRows[rowIdx];
        if (!Array.isArray(row) || row.length < 2) {
          continue;
        }
        const subject = (row[0] || '').trim();
        if (!subject) {
          continue;
        }
        if (!cardsMap[subject]) {
          cardsMap[subject] = {
            id: Object.keys(cardsMap).length,
            title: subject,
            present: 0,
            total: 0,
            target_percentage: 75,
            tagColor: Tagcolors[Object.keys(cardsMap).length % Tagcolors.length],
            days: {sun: [], mon: [], tue: [], wed: [], thu: [], fri: [], sat: []},
            markedAt: [],
            hasLimit: false,
            limit: 0,
            limitType: 'with-absent',
            defaultClassroom: '',
          };
        }
        for (let colIdx = 1; colIdx < row.length && colIdx <= 7; colIdx++) {
          const slotCell = (row[colIdx] || '').trim();
          if (!slotCell) continue;
          // Split on | for multiple slots
          const slotStrings = slotCell.split('|').map((s: string) => s.trim()).filter(Boolean);
          for (const slot of slotStrings) {
            let start = '', end = '', room = '';
            const slotParts = slot.split('-');
            if (slotParts.length >= 2) {
              start = slotParts[0].trim();
              end = slotParts[1].trim();
              if (slotParts.length > 2) room = slotParts.slice(2).join('-').trim();
            } else {
              start = slot.trim();
            }
            const dayKey = dayKeys[colIdx - 1];
            if (start && end) {
              (cardsMap[subject].days as any)[dayKey].push({start, end, roomName: room || null});
            }
          }
        }
      }
    } else {
      // Fallback to vertical format (original logic)
      let currentDay: string | null = null;
      for (let idx = 0; idx < csvRows.length; idx++) {
        const row = csvRows[idx];
        if (!Array.isArray(row) || row.length < 1) {
          continue;
        }
        // Trim all values
        const trimmed = row.map((v: string) => (v || '').trim());
        const joined = trimmed.join(',').toLowerCase();
        // Skip register name/title lines
        if (trimmed.length === 1 && trimmed[0] && !trimmed[0].toLowerCase().includes('day:')) {
          continue;
        }
        // Check for day header
        for (let i = 0; i < dayNames.length; i++) {
          if (joined.includes('day:') && joined.includes(dayNames[i])) {
            currentDay = dayKeys[i];
            continue;
          }
        }
        // Skip table headers and empty lines
        if (
          trimmed.length < 3 ||
          trimmed[0].toLowerCase().includes('subject') ||
          trimmed[0].toLowerCase().includes('day:') ||
          !currentDay
        ) {
          continue;
        }
        // Parse subject row (accept at least 3 columns)
        const subject = trimmed[0];
        const slotCell = trimmed.slice(1, 4).join(','); // join start, end, room
        // Split on | for multiple slots
        const slotStrings = slotCell.split('|').map((s: string) => s.trim()).filter(Boolean);
        let defaultClassroom = '';
        for (const slot of slotStrings) {
          const slotParts = slot.split(',').map(s => s.trim());
          const start = slotParts[0] || '';
          const end = slotParts[1] || '';
          const room = slotParts[2] || '';
          if (!subject || !start || !end || !currentDay) {
            continue;
          }
          if (!cardsMap[subject]) {
            cardsMap[subject] = {
              id: Object.keys(cardsMap).length,
              title: subject,
              present: 0,
              total: 0,
              target_percentage: 75,
              tagColor: Tagcolors[Object.keys(cardsMap).length % Tagcolors.length],
              days: {sun: [], mon: [], tue: [], wed: [], thu: [], fri: [], sat: []},
              markedAt: [],
              hasLimit: false,
              limit: 0,
              limitType: 'with-absent',
              defaultClassroom: '',
            };
          }
          // Only set roomName if explicitly provided, otherwise null
          (cardsMap[subject].days as any)[currentDay].push({start, end, roomName: room || null});
          // If room is provided, set as defaultClassroom if not already set
          if (room && !cardsMap[subject].defaultClassroom) {
            cardsMap[subject].defaultClassroom = room;
          }
        }
      }
    }
    return Object.values(cardsMap);
  };

  // Handler for Import Schedule action
  const handleImportSchedule = () => {
    setImportModalVisible(true);
  };

  // Handler for picking CSV file
  const handlePickCSVFile = async () => {
    setIsLoading(true);
    try {
      const data = await pickCSVFile();
      setIsLoading(false);
      setImportModalVisible(false);
      if (!data || !Array.isArray(data) || data.length === 0) {
        return;
      }
      // Parse and validate CSV immediately
      const cards = parseCSVToCards(data);
      if (!cards.length) {
        return;
      }
      setCsvData(data); // Save the raw data for later use
      setTimeout(() => {
        setRegisterNameModalVisible(true);
      }, 200);
    } catch (e) {
      setIsLoading(false);
      setImportModalVisible(false);
    }
  };

  // Handler for confirming register name and creating schedule
  const handleCreateRegisterFromCSV = async () => {
    if (!registerName.trim() || !csvData) {
      return;
    }
    setIsLoading(true);
    setRegisterNameModalVisible(false);
    setTimeout(() => {
      const newId = getNewRegisterId();
      const cards = parseCSVToCards(csvData);
      if (!cards.length) {
        setIsLoading(false);
        return;
      }
      addRegister(newId, registerName.trim());
      setRegisters(newId, cards);
      useStore.getState().setActiveRegister(newId); // Set the current/active register to the new one
      // Show notification
      if (Platform.OS === 'android' && ToastAndroid) {
        ToastAndroid.show(`Welcome to ${registerName.trim()}`, ToastAndroid.SHORT);
      } else {
        Alert.alert('Welcome', `Welcome to ${registerName.trim()}`);
      }
      setRegisterName('');
      setCsvData(null);
      setIsLoading(false);
      onClose(); // Only close on success
    }, 800);
  };

  // Reset modal state on close
  useEffect(() => {
    if (!visible) {
      setRegisterNameModalVisible(false);
      setIsLoading(false);
      setRegisterName('');
      setCsvData(null);
    }
  }, [visible]);

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
      title: 'Add Task',
      icon: '✅',
      color: '#10B981',
      onPress: onAddTask,
    },
    {
      id: 3,
      title: 'Generate using AI',
      icon: '🤖',
      color: '#8B5CF6',
      onPress: onGenerateAI,
    },
    {
      id: 4,
      title: 'Import Schedule',
      icon: '📥',
      color: '#F59E0B',
      onPress: handleImportSchedule,
    },
  ];

  const handleActionPress = (action: () => void) => {
    onClose();
    setTimeout(() => {
      action();
    }, 150);
  };

  return (
    <>
      {/* Main Modal */}
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

      {/* Import CSV Modal */}
      <Modal
        transparent
        visible={importModalVisible}
        animationType="fade"
        onRequestClose={() => setImportModalVisible(false)}>
        <TouchableWithoutFeedback onPress={() => setImportModalVisible(false)}>
          <View style={styles.overlay}>
            <TouchableWithoutFeedback>
              <View style={[styles.modalContent, {padding: 24, alignItems: 'center'}]}>
                <Text style={{color: '#F3F4F6', fontSize: 18, marginBottom: 16}}>Import Schedule</Text>
                <Text style={{color: '#9CA3AF', fontSize: 14, marginBottom: 24, textAlign: 'center'}}>Choose a CSV file to import your schedule</Text>
                <TouchableOpacity
                  style={{backgroundColor: '#6366F1', borderRadius: 8, paddingVertical: 12, width: 220, alignItems: 'center', marginBottom: 12}}
                  onPress={handlePickCSVFile}
                  disabled={isLoading}
                >
                  <Text style={{color: '#fff', fontWeight: 'bold', fontSize: 16}}>Pick a CSV File</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{width: 220, alignItems: 'center', paddingVertical: 10}}
                  onPress={() => setImportModalVisible(false)}
                  disabled={isLoading}
                  activeOpacity={0.7}
                >
                  <Text style={{color: '#9CA3AF', fontSize: 16}}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Register Name Modal - now outside parent modal */}
      <Modal
        transparent
        visible={registerNameModalVisible}
        animationType="fade"
        onRequestClose={() => setRegisterNameModalVisible(false)}>
        <TouchableWithoutFeedback onPress={() => setRegisterNameModalVisible(false)}>
          <View style={styles.overlay}>
            <TouchableWithoutFeedback>
              <View style={[styles.modalContent, {padding: 24, alignItems: 'center', width: 300}]}>
                <Text style={{color: '#F3F4F6', fontSize: 18, marginBottom: 16}}>Name your new Register</Text>
                <View style={{width: 220, marginBottom: 16, alignItems: 'center'}}>
                  <Text style={{color: '#9CA3AF', marginBottom: 6, fontSize: 14, textAlign: 'center', width: '100%'}}>Register Name</Text>
                  <View style={{backgroundColor: '#18181B', borderRadius: 8, borderWidth: 1, borderColor: '#3F3F46', paddingHorizontal: 10, paddingVertical: 2, width: '100%'}}>
                    <TextInput
                      value={registerName}
                      onChangeText={setRegisterName}
                      placeholder="Enter name"
                      placeholderTextColor="#6B7280"
                      style={{color: '#F3F4F6', fontSize: 16, height: 38, paddingVertical: 0, paddingHorizontal: 0}}
                      autoFocus
                      maxLength={32}
                      returnKeyType="done"
                    />
                  </View>
                </View>
                <TouchableOpacity
                  style={{backgroundColor: '#6366F1', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 32, width: 220, alignItems: 'center'}}
                  onPress={handleCreateRegisterFromCSV}
                  disabled={!registerName.trim() || isLoading}
                >
                  <Text style={{color: '#fff', fontWeight: 'bold', fontSize: 16}}>Create</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Loading Modal - now outside parent modal */}
      <Modal
        transparent
        visible={isLoading}
        animationType="fade"
        onRequestClose={() => {}}>
        <View style={styles.overlay}>
          <View style={[styles.modalContent, {padding: 32, alignItems: 'center'}]}>
            <ActivityIndicator size="large" color="#6366F1" />
            <Text style={{color: '#F3F4F6', fontSize: 16, marginTop: 16}}>Creating and loading register...</Text>
          </View>
        </View>
      </Modal>
    </>
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
