import React, {useState, useEffect} from 'react';
import {View, StyleSheet, Alert, Text, TouchableOpacity, Image} from 'react-native';
import TimeTable from '../components/TimeTable';
import useStore from '../store/store';
import {CardInterface, Days, Slots} from '../types/cards';
import { getPreviewColorForBackground } from '../types/allCardConstraint';

const daysKeyMap: Record<string, keyof Days> = {
  Sunday: 'sun',
  Monday: 'mon',
  Tuesday: 'tue',
  Wednesday: 'wed',
  Thursday: 'thu',
  Friday: 'fri',
  Saturday: 'sat',
};

interface Subject {
  id: string;
  name: string;
  description?: string;
  startTime: string;
  endTime: string;
  classroom?: string;
  color: string;
  present: number;
  total: number;
  dayOfWeek: number;
}

interface TimeTableScreenProps {
  navigation: any;
  handleMenuOpen: (r: number, c: number) => void;
}

const TimeTableScreen: React.FC<TimeTableScreenProps> = ({
  navigation,
  handleMenuOpen: _handleMenuOpen,
}) => {
  const {registers, activeRegister, markPresent} = useStore();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedRegisters, setSelectedRegisters] = useState<number[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Initialize selectedRegisters with activeRegister by default
  useEffect(() => {
    if (Object.keys(registers).length > 0 && selectedRegisters.length === 0) {
      setSelectedRegisters([activeRegister]);
    }
  }, [registers, activeRegister, selectedRegisters]);

  // Convert store data to TimeTable format
  useEffect(() => {
    const convertedSubjects: Subject[] = [];

    // Only process selected registers
    selectedRegisters.forEach(registerIdx => {
      const register = registers[registerIdx];

      if (register?.cards) {
        register.cards.forEach((card: CardInterface) => {
          // Convert each day's time slots to subjects
          Object.entries(card.days).forEach(([dayKey, slots]) => {
            if (slots && slots.length > 0) {
              slots.forEach((slot: Slots, slotIndex: number) => {
                const dayOfWeek = Object.keys(daysKeyMap).find(
                  key => daysKeyMap[key] === dayKey,
                );

                if (dayOfWeek) {
                  const dayIndex = [
                    'Sunday',
                    'Monday',
                    'Tuesday',
                    'Wednesday',
                    'Thursday',
                    'Friday',
                    'Saturday',
                  ].indexOf(dayOfWeek);

                  convertedSubjects.push({
                    id: `${registerIdx}-${card.id}-${dayKey}-${slotIndex}`,
                    name: card.title,
                    description: `Target: ${card.target_percentage}%${
                      card.hasLimit
                        ? `, Limit: ${card.limit} (${card.limitType})`
                        : ''
                    }`,
                    startTime: slot.start,
                    endTime: slot.end,
                    classroom: slot.roomName || undefined,
                    color: register.color || card.tagColor,
                    present: card.present,
                    total: card.total,
                    dayOfWeek: dayIndex,
                  });
                }
              });
            }
          });
        });
      }
    });

    setSubjects(convertedSubjects);
  }, [registers, selectedRegisters]);

  // Helper functions for register selection
  const getAllRegisterIds = () => Object.keys(registers).map(key => parseInt(key, 10));

  const isAllSelected = () => {
    const allIds = getAllRegisterIds();
    return allIds.length > 0 && allIds.every(id => selectedRegisters.includes(id));
  };

  const toggleAllRegisters = () => {
    if (isAllSelected()) {
      setSelectedRegisters([]);
    } else {
      setSelectedRegisters(getAllRegisterIds());
    }
  };

  const toggleRegister = (registerId: number) => {
    setSelectedRegisters(prev => {
      if (prev.includes(registerId)) {
        return prev.filter(id => id !== registerId);
      } else {
        return [...prev, registerId];
      }
    });
  };

  const getDropdownDisplayText = () => {
    if (selectedRegisters.length === 0) {
      return 'No registers selected';
    }
    if (isAllSelected()) {
      return 'All Registers';
    }
    if (selectedRegisters.length === 1) {
      return registers[selectedRegisters[0]]?.name || 'Unknown Register';
    }
    return `${selectedRegisters.length} registers selected`;
  };

  // Get current date for header display
  const getCurrentDate = () => {
    const today = new Date();
    return today.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <View style={styles.container}>
      {isDropdownOpen && (
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setIsDropdownOpen(false)}
        />
      )}
      <View style={styles.headerContainer}>
        <View style={styles.titleSection}>
          <View style={styles.titleRow}>
            <Image
              source={require('../assets/icons/navigation/time-table.png')}
              style={styles.timeTableIcon}
            />
            <Text style={styles.scheduleTitle}>Schedule</Text>
          </View>
          <Text style={styles.dateSubtitle}>{getCurrentDate()}</Text>
        </View>
        <View style={styles.dropdownContainer}>
          <TouchableOpacity
            style={styles.dropdownButton}
            onPress={() => setIsDropdownOpen(!isDropdownOpen)}>
            <Text style={styles.dropdownButtonText} numberOfLines={1} ellipsizeMode="tail">
              {getDropdownDisplayText()}
            </Text>
            <Text style={styles.dropdownArrow}>
              {isDropdownOpen ? '▲' : '▼'}
            </Text>
          </TouchableOpacity>
          {isDropdownOpen && (
            <View style={styles.dropdownMenu}>
              <TouchableOpacity
                style={[
                  styles.dropdownItem,
                  isAllSelected() && styles.dropdownItemSelected,
                ]}
                onPress={toggleAllRegisters}>
                <View style={styles.dropdownItemContent}>
                  <Text style={[
                    styles.dropdownItemText,
                    isAllSelected() && styles.dropdownItemTextSelected,
                  ]} numberOfLines={1} ellipsizeMode="tail">
                    All Registers
                  </Text>
                </View>
              </TouchableOpacity>
              {getAllRegisterIds().map(registerId => (
                <TouchableOpacity
                  key={registerId}
                  style={[
                    styles.dropdownItem,
                    selectedRegisters.includes(registerId) && styles.dropdownItemSelected,
                  ]}
                  onPress={() => toggleRegister(registerId)}>
                  <View style={styles.dropdownItemContent}>
                    <View style={styles.registerItem}>
                      <View
                        style={[
                          styles.colorIndicator,
                          {backgroundColor: getPreviewColorForBackground(registers[registerId]?.color || '#FFFFFF')},
                        ]}
                      />
                      <Text style={[
                        styles.dropdownItemText,
                        selectedRegisters.includes(registerId) && styles.dropdownItemTextSelected,
                      ]} numberOfLines={1}>
                        {registers[registerId]?.name || 'Unknown Register'}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>
      <TimeTable
        subjects={subjects}
        selectedRegisters={selectedRegisters}
        registerNames={selectedRegisters.reduce((acc, registerId) => {
          acc[registerId] = registers[registerId]?.name || 'Unknown Register';
          return acc;
        }, {} as { [key: number]: string })}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#18181B',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#1F1F23',
    borderBottomWidth: 1,
    borderBottomColor: '#2D2D2D',
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleSection: {
    flex: 1,
    marginRight: 12,
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  timeTableIcon: {
    width: 28,
    height: 28,
    marginRight: 8,
    tintColor: '#FFFFFF',
  },
  scheduleTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  dateSubtitle: {
    color: '#8B8B8B',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 36, // Align with Schedule text (icon width 28px + marginRight 8px)
  },
  dropdownContainer: {
    position: 'relative',
    zIndex: 1000,
    minWidth: 120,
    maxWidth: 160,
  },
  dropdownButton: {
    backgroundColor: '#2D2D2D',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#404040',
  },
  dropdownButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
    marginRight: 8,
  },
  dropdownArrow: {
    color: '#8B5CF6',
    fontSize: 12,
    fontWeight: 'bold',
  },
  dropdownMenu: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#2D2D2D',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#404040',
    marginTop: 4,
    maxHeight: 200,
    zIndex: 1001,
    overflow: 'hidden',
  },
  dropdownItem: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#404040',
  },
  dropdownItemSelected: {
    backgroundColor: '#8B5CF620',
  },
  dropdownItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    overflow: 'hidden',
  },
  registerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    overflow: 'hidden',
  },
  colorIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#3F3F46',
  },
  dropdownItemText: {
    color: '#FFFFFF',
    fontSize: 14,
    flex: 1,
  },
  dropdownItemTextSelected: {
    color: '#8B5CF6',
    fontWeight: '600',
    flex: 1,
  },
});

export default TimeTableScreen;
