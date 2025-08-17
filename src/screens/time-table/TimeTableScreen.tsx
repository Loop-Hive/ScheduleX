// src/screens/time-table/TimeTableScreen.tsx

import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  Alert,
  Text,
  TouchableOpacity,
  Image,
} from 'react-native';
import TimeTable from './components/TimeTable';
import useStore from '../../store/store';
import {CardInterface, Days, Slots} from '../../types/cards';
import {getPreviewColorForBackground} from '../../types/allCardConstraint';

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
  const {registers, viewingRegisters, markPresent, setSelectedRegisters} = useStore();
  const [subjects, setSubjects] = useState<Subject[]>([]);

  // Convert store data to TimeTable format
  useEffect(() => {
    const convertedSubjects: Subject[] = [];

    // Only process selected registers
    viewingRegisters.forEach(registerIdx => {
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
  }, [registers, viewingRegisters]);

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
      <View style={styles.headerContainer}>
        <View style={styles.titleSection}>
          <View style={styles.titleRow}>
            <Image
              source={require('../../assets/icons/navigation/time-table.png')}
              style={styles.timeTableIcon}
            />
            <Text style={styles.scheduleTitle}>Schedule</Text>
          </View>
          <Text style={styles.dateSubtitle}>{getCurrentDate()}</Text>
        </View>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => navigation.navigate('EditSchedule')}>
          <Image
            source={require('../../assets/icons/card-menu/edit.png')}
            style={styles.editIcon}
          />
        </TouchableOpacity>
      </View>
      <TimeTable
        subjects={subjects}
        selectedRegisters={viewingRegisters}
        registerNames={viewingRegisters.reduce(
          (acc, registerId) => {
            acc[registerId] = registers[registerId]?.name || 'Unknown Register';
            return acc;
          },
          {} as {[key: number]: string},
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#18181B',
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
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
  editButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#2D2D2D',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginLeft: 'auto',
    marginRight: 16,
  },
  editIcon: {
    width: 20,
    height: 20,
    tintColor: '#8B5CF6',
  },
  dateSubtitle: {
    color: '#8B8B8B',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 36, // Align with Schedule text (icon width 28px + marginRight 8px)
  },
});
export default TimeTableScreen;