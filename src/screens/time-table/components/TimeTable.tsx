import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {getTextColorForBackground} from '../../../types/allCardConstraint';

const {width: screenWidth, height: screenHeight} = Dimensions.get('window');

interface Subject {
  id: string;
  name: string;
  description?: string;
  startTime: string; // "09:00"
  endTime: string; // "10:00"
  classroom?: string;
  color: string;
  present: number;
  total: number;
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, etc.
}

interface TimeTableProps {
  subjects: Subject[];
  selectedRegisters: number[];
  registerNames: {[key: number]: string};
}

const TimeTable: React.FC<TimeTableProps> = ({
  subjects,
  selectedRegisters: _selectedRegisters,
  registerNames: _registerNames,
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(new Date().getDay()); // Initialize with today
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(
    null,
  ); // Track clicked subject
  const [hasAutoScrolled, setHasAutoScrolled] = useState(false); // Track if we've already auto-scrolled
  const scrollViewRef = useRef<ScrollView>(null);
  const currentTimeLineY = useRef(new Animated.Value(0)).current;

  // Days of the week with full names
  const getAllDays = () => [
    {name: 'Sunday', fullName: 'Sunday', index: 0},
    {name: 'Monday', fullName: 'Monday', index: 1},
    {name: 'Tuesday', fullName: 'Tuesday', index: 2},
    {name: 'Wednesday', fullName: 'Wednesday', index: 3},
    {name: 'Thursday', fullName: 'Thursday', index: 4},
    {name: 'Friday', fullName: 'Friday', index: 5},
    {name: 'Saturday', fullName: 'Saturday', index: 6},
  ];

  // Get ordered days with Today and Tomorrow first
  const getOrderedDays = () => {
    const allDays = getAllDays();
    const today = new Date().getDay(); // 0 = Sunday, 1 = Monday, etc.
    const tomorrow = (today + 1) % 7;

    const orderedDays = [];

    // Add Today tab
    orderedDays.push({
      name: 'Today',
      fullName: allDays[today].fullName,
      index: today,
      isSpecial: true,
    });

    // Add Tomorrow tab
    orderedDays.push({
      name: 'Tomorrow',
      fullName: allDays[tomorrow].fullName,
      index: tomorrow,
      isSpecial: true,
    });

    // Add remaining days with full names
    for (let i = 0; i < 7; i++) {
      if (i !== today && i !== tomorrow) {
        orderedDays.push({
          name: allDays[i].name,
          fullName: allDays[i].fullName,
          index: i,
          isSpecial: false,
        });
      }
    }

    return orderedDays;
  };

  const daysOfWeek = getOrderedDays();

  // Generate hours (24-hour format)
  const hours = Array.from({length: 24}, (_, i) => {
    const hour = i;
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    const ampm = hour < 12 ? 'AM' : 'PM';
    return {
      hour,
      display: `${displayHour} ${ampm}`,
      time24: `${hour.toString().padStart(2, '0')}:00`,
    };
  });

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // Calculate current time line position
  useEffect(() => {
    const hour = currentTime.getHours();
    const minutes = currentTime.getMinutes();
    const position = (hour + minutes / 60) * 80; // 80 is hour height

    Animated.timing(currentTimeLineY, {
      toValue: position,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [currentTime, currentTimeLineY]);

  // Auto-scroll to current time only on initial mount and day changes
  useEffect(() => {
    if (selectedDay === new Date().getDay() && !hasAutoScrolled) {
      const hour = new Date().getHours();
      const scrollPosition = Math.max(0, (hour - 2) * 80); // Show 2 hours before current

      setTimeout(() => {
        scrollViewRef.current?.scrollTo({
          y: scrollPosition,
          animated: true,
        });
        setHasAutoScrolled(true);
      }, 100);
    }
  }, [selectedDay, hasAutoScrolled]);

  // Reset auto-scroll flag when day changes
  useEffect(() => {
    setHasAutoScrolled(false);
  }, [selectedDay]);

  // Get subjects for selected day
  const todaySubjects = subjects.filter(
    subject => subject.dayOfWeek === selectedDay,
  );

  // Check if two subjects overlap in time
  const subjectsOverlap = (subject1: Subject, subject2: Subject): boolean => {
    const start1 =
      parseInt(subject1.startTime.split(':')[0]) +
      parseInt(subject1.startTime.split(':')[1]) / 60;
    const end1 =
      parseInt(subject1.endTime.split(':')[0]) +
      parseInt(subject1.endTime.split(':')[1]) / 60;
    const start2 =
      parseInt(subject2.startTime.split(':')[0]) +
      parseInt(subject2.startTime.split(':')[1]) / 60;
    const end2 =
      parseInt(subject2.endTime.split(':')[0]) +
      parseInt(subject2.endTime.split(':')[1]) / 60;

    return start1 < end2 && start2 < end1;
  };

  // Group overlapping subjects together
  const getSubjectGroups = (): Subject[][] => {
    const groups: Subject[][] = [];
    const processed = new Set<string>();

    todaySubjects.forEach(subject => {
      if (processed.has(subject.id)) return;

      const group = [subject];
      processed.add(subject.id);

      // Find all subjects that overlap with any subject in current group
      let foundNewOverlap = true;
      while (foundNewOverlap) {
        foundNewOverlap = false;
        todaySubjects.forEach(otherSubject => {
          if (processed.has(otherSubject.id)) return;

          // Check if this subject overlaps with any subject in the current group
          const overlapsWithGroup = group.some(groupSubject =>
            subjectsOverlap(groupSubject, otherSubject),
          );

          if (overlapsWithGroup) {
            group.push(otherSubject);
            processed.add(otherSubject.id);
            foundNewOverlap = true;
          }
        });
      }

      groups.push(group);
    });

    return groups;
  };

  // Calculate subject position within time slot with overlap handling
  const getSubjectStyle = (
    subject: Subject,
    groupIndex: number,
    positionInGroup: number,
    totalInGroup: number,
  ) => {
    const startHour = parseInt(subject.startTime.split(':')[0], 10);
    const startMinutes = parseInt(subject.startTime.split(':')[1], 10);
    const endHour = parseInt(subject.endTime.split(':')[0], 10);
    const endMinutes = parseInt(subject.endTime.split(':')[1], 10);

    // Calculate exact positions to align with time grid lines
    const startPosition = (startHour + startMinutes / 60) * 80;
    const endPosition = (endHour + endMinutes / 60) * 80;
    const height = endPosition - startPosition;

    // Calculate width and position based on group overlaps
    const cardWidth =
      totalInGroup > 1
        ? (screenWidth - 80) / totalInGroup - 4
        : screenWidth - 84;
    const leftOffset =
      totalInGroup > 1
        ? positionInGroup * ((screenWidth - 80) / totalInGroup)
        : 0;

    return {
      position: 'absolute' as const,
      top: startPosition, // Remove offset for exact alignment
      left: 80 + leftOffset + 2, // Minimal left margin
      width: cardWidth,
      height: height, // Exact height without reduction
      zIndex: 20,
    };
  };

  // Handle subject card click to show/hide time details
  const handleSubjectClick = (subjectId: string) => {
    setSelectedSubjectId(prev => (prev === subjectId ? null : subjectId));
  };

  // Handle clicking anywhere else to hide time details
  const handleTimeTableClick = () => {
    setSelectedSubjectId(null);
  };

  // Get the selected subject for time display
  const getSelectedSubject = () => {
    return todaySubjects.find(subject => subject.id === selectedSubjectId);
  };

  const renderSubjectCard = (
    subject: Subject,
    groupIndex: number,
    positionInGroup: number,
    totalInGroup: number,
  ) => {
    const textColor = getTextColorForBackground(subject.color);
    const isSelected = selectedSubjectId === subject.id;

    return (
      <TouchableOpacity
        key={subject.id}
        style={[
          styles.subjectCard,
          getSubjectStyle(subject, groupIndex, positionInGroup, totalInGroup),
          {backgroundColor: subject.color},
          isSelected && styles.subjectCardSelected,
        ]}
        onPress={e => {
          e.stopPropagation();
          handleSubjectClick(subject.id);
        }}
        activeOpacity={0.8}>
        <View style={styles.subjectContent}>
          <Text
            style={[styles.subjectName, {color: textColor}]}
            numberOfLines={2}>
            {subject.name}
          </Text>
          {subject.classroom && (
            <Text
              style={[styles.subjectClassroom, {color: textColor}]}
              numberOfLines={1}>
              📍 {subject.classroom}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  // Render time indicator for selected subject
  const renderTimeIndicator = () => {
    const selectedSubject = getSelectedSubject();
    if (!selectedSubject) return null;

    const startHour = parseInt(selectedSubject.startTime.split(':')[0], 10);
    const startMinutes = parseInt(selectedSubject.startTime.split(':')[1], 10);
    const endHour = parseInt(selectedSubject.endTime.split(':')[0], 10);
    const endMinutes = parseInt(selectedSubject.endTime.split(':')[1], 10);

    const startPosition = (startHour + startMinutes / 60) * 80;
    const endPosition = (endHour + endMinutes / 60) * 80;

    // Format time for display
    const formatTime = (hour: number, minute: number) => {
      const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      const ampm = hour < 12 ? 'AM' : 'PM';
      const minuteStr = minute.toString().padStart(2, '0');
      return `${displayHour}:${minuteStr} ${ampm}`;
    };

    const startTimeFormatted = formatTime(startHour, startMinutes);
    const endTimeFormatted = formatTime(endHour, endMinutes);

    return (
      <>
        {/* Start time line */}
        <View style={[styles.timeIndicatorLine, {top: startPosition}]} />

        {/* End time line */}
        <View style={[styles.timeIndicatorLine, {top: endPosition}]} />

        {/* Start time label in left column */}
        <View style={[styles.timeIndicatorLabel, {top: startPosition}]}>
          <Text style={styles.timeIndicatorText}>{startTimeFormatted}</Text>
        </View>

        {/* End time label in left column */}
        <View style={[styles.timeIndicatorLabel, {top: endPosition}]}>
          <Text style={styles.timeIndicatorText}>{endTimeFormatted}</Text>
        </View>
      </>
    );
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      {/* Day Navigation Tabs */}
      <View style={styles.dayTabsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.dayTabsScrollView}>
          {daysOfWeek.map(day => (
            <TouchableOpacity
              key={day.index}
              style={[
                styles.dayTab,
                day.isSpecial && styles.specialDayTab,
                selectedDay === day.index && styles.dayTabActive,
                selectedDay === day.index && day.isSpecial && styles.specialDayTabActive,
              ]}
              onPress={() => setSelectedDay(day.index)}>
              <Text
                style={[
                  styles.dayTabText,
                  day.isSpecial && styles.specialDayTabText,
                  selectedDay === day.index && styles.dayTabTextActive,
                ]}>
                {day.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContentContainer}
        // showsVerticalScrollIndicator={false}
        // bounces={false}
      >
        <View style={styles.timeGrid}>
          {/* Transparent touchable background to ensure scrolling works everywhere */}
          <TouchableOpacity
            style={styles.backgroundTouchable}
            activeOpacity={1}
            onPress={handleTimeTableClick}
          />

          {/* Time labels */}
          <View style={styles.timeLabelsContainer}>
            {hours.map(({hour, display}, index) => (
              <View key={hour} style={styles.timeSlot}>
                {/* Only show time label for every hour, positioned at the top border */}
                <Text
                  style={[
                    styles.timeLabel,
                    {marginTop: index === 0 ? 6 : -6},
                  ]}>
                  {display}
                </Text>
              </View>
            ))}
          </View>

          {/* Hour dividers */}
          <View style={styles.hourDividers}>
            {hours.map(({hour}) => (
              <View key={hour} style={styles.hourDivider} />
            ))}
          </View>

          {/* Current time indicator - only show for today */}
          {selectedDay === new Date().getDay() && (
            <Animated.View
              style={[
                styles.currentTimeLine,
                {
                  top: currentTimeLineY,
                },
              ]}>
              <View style={styles.currentTimeCircle} />
              <View style={styles.currentTimeLineBar} />
            </Animated.View>
          )}

          {/* Subject cards */}
          <View style={styles.subjectsContainer}>
            {getSubjectGroups().map((subjectGroup, groupIndex) =>
              subjectGroup.map((subject, positionInGroup) =>
                renderSubjectCard(
                  subject,
                  groupIndex,
                  positionInGroup,
                  subjectGroup.length,
                ),
              ),
            )}
          </View>

          {/* Time indicator for selected subject */}
          {renderTimeIndicator()}
        </View>
      </ScrollView>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#18181B',
  },
  scrollView: {
    flex: 1,
    marginBottom: 76,
    // marginTop: 8,
    // paddingTop: 8,
  },
  scrollContentContainer: {
    flexGrow: 1,
  },
  timeGrid: {
    height: 24 * 80, // 24 hours * 80px per hour
    position: 'relative',
  },
  backgroundTouchable: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  timeLabelsContainer: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 80,
    height: '100%',
    backgroundColor: '#18181B',
    borderRightWidth: 1,
    borderRightColor: '#334155',
  },
  timeSlot: {
    height: 80,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 0,
  },
  timeLabel: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 12,
    textAlign: 'center',
  },
  hourDividers: {
    position: 'absolute',
    left: 80,
    top: 0,
    right: 0,
    height: '100%',
    // borderTopWidth: 1,
    // borderTopColor: '#334155',
  },
  hourDivider: {
    height: 80,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  currentTimeLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 25,
  },
  currentTimeCircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#6366f1',
    marginLeft: 74,
  },
  currentTimeLineBar: {
    flex: 1,
    height: 2,
    backgroundColor: '#6366f1',
  },
  subjectsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '100%',
  },
  subjectCard: {
    borderRadius: 8,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  subjectContent: {
    flex: 1,
  },
  subjectName: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  subjectClassroom: {
    fontSize: 11,
    marginBottom: 4,
  },
  dayTabsContainer: {
    backgroundColor: '#18181B',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  dayTabsScrollView: {
    paddingHorizontal: 4,
  },
  dayTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#475569',
    backgroundColor: 'transparent',
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  specialDayTab: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 24,
    borderWidth: 3,
    borderColor: '#6366f1',
    backgroundColor: 'transparent',
    minWidth: 100,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayTabActive: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
    transform: [{scale: 1.05}],
  },
  specialDayTabActive: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
    borderWidth: 3,
    transform: [{scale: 1.02}],
  },
  dayTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94A3B8',
    textAlign: 'center',
  },
  specialDayTabText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#6366f1',
  },
  dayTabTextActive: {
    color: '#FFFFFF',
  },
  subjectCardSelected: {
    borderWidth: 2,
    borderColor: '#FFFFFF',
    transform: [{scale: 1.02}],
  },
  timeIndicatorLine: {
    position: 'absolute',
    left: 80,
    right: 0,
    height: 2,
    backgroundColor: '#FFD700',
    zIndex: 22,
  },
  timeIndicatorLabel: {
    position: 'absolute',
    left: 4,
    width: 72,
    backgroundColor: '#1F2937',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: '#FFD700',
    zIndex: 30,
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
  timeIndicatorText: {
    color: '#FFD700',
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default TimeTable;
