import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
  Image,
} from 'react-native';
import {
  GestureHandlerRootView,
  PanGestureHandler,
  State,
} from 'react-native-gesture-handler';
import HapticFeedback from 'react-native-haptic-feedback';
import {getTextColorForBackground} from '../../../types/allCardConstraint';

// Import arrow images
const upArrowImage = require('../../../assets/icons/up-arrow.png');
const downArrowImage = require('../../../assets/icons/down-arrow.png');

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
  const [scrollY, setScrollY] = useState(0); // Track current scroll position
  const [showScrollToNow, setShowScrollToNow] = useState(false); // Show "scroll to now" button
  const [currentTimeDirection, setCurrentTimeDirection] = useState<'up' | 'down'>('down'); // Where current time is relative to viewport

  // State for floating time marker
  const [isGestureActive, setIsGestureActive] = useState(false);
  const [markerY, setMarkerY] = useState(0);
  const [markerTime, setMarkerTime] = useState('12:00 AM');
  const [lastHapticHour, setLastHapticHour] = useState(-1);
  const lastScrollTime = useRef(0); // Add throttling for scroll updates

  const scrollViewRef = useRef<ScrollView>(null);
  const currentTimeLineY = useRef(new Animated.Value(0)).current;
  const isScrollingToCurrentTime = useRef(false); // Track if currently scrolling to prevent double animations
  const isUserGesturing = useRef(false); // Track if user is actively gesturing
  const markerOpacity = useRef(new Animated.Value(0)).current;

  // Haptic feedback options
  const hapticOptions = {
    enableVibrateFallback: true,
    ignoreAndroidSystemSettings: false,
  };

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
    // Don't update current time line position while user is gesturing
    if (isUserGesturing.current) {
      return;
    }

    const hour = currentTime.getHours();
    const minutes = currentTime.getMinutes();
    const position = (hour + minutes / 60) * 80; // 80 is hour height

    Animated.timing(currentTimeLineY, {
      toValue: position,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [currentTime, currentTimeLineY]);

  // Auto-scroll logic for day changes
  useEffect(() => {
    if (!hasAutoScrolled) {
      const isToday = selectedDay === new Date().getDay();
      let scrollPosition = 0;

      if (isToday) {
        // For Today tab: scroll to show current time with exactly 1 hour of space above it
        // This matches Google Calendar's positioning and creates consistency with other day tabs
        const currentTime = new Date();
        const hour = currentTime.getHours();
        const minutes = currentTime.getMinutes();
        const currentTimePosition = (hour + minutes / 60) * 80;
        // Show exactly 1 hour before current time (consistent with other day behavior)
        scrollPosition = Math.max(0, currentTimePosition - 80);
      } else {
        // For other days: scroll to first subject of the day
        const daySubjects = subjects.filter(
          subject => subject.dayOfWeek === selectedDay,
        );

        if (daySubjects.length > 0) {
          // Find the earliest subject for this day by comparing start times
          const earliestSubject = daySubjects.reduce((earliest, current) => {
            const earliestTime = earliest.startTime.split(':').map(Number);
            const currentTime = current.startTime.split(':').map(Number);
            const earliestMinutes = earliestTime[0] * 60 + earliestTime[1];
            const currentMinutes = currentTime[0] * 60 + currentTime[1];

            return currentMinutes < earliestMinutes ? current : earliest;
          });

          // Calculate scroll position to show the earliest subject
          const [hours, minutes] = earliestSubject.startTime.split(':').map(Number);
          const subjectPosition = (hours + minutes / 60) * 80;
          // Scroll to show 1 hour before the first subject (or to top if subject is too early)
          scrollPosition = Math.max(0, subjectPosition - 80);
        }
        // If no subjects for this day, scrollPosition remains 0 (top of schedule)
      }

      // Apply scroll with a small delay to ensure the component is fully rendered
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({
          y: scrollPosition,
          animated: true,
        });
        setHasAutoScrolled(true);
      }, 100);
    }
  }, [selectedDay, hasAutoScrolled, subjects]);

  // Reset auto-scroll flag and arrow state when day changes
  useEffect(() => {
    setHasAutoScrolled(false);
    setShowScrollToNow(false); // Reset arrow state immediately when switching days
    setCurrentTimeDirection('down'); // Reset arrow direction to default
  }, [selectedDay]);

  // Calculate current time position and detect if user scrolled away (only for Today tab)
  useEffect(() => {
    const isToday = selectedDay === new Date().getDay();
    if (!isToday) {
      setShowScrollToNow(false);
      return;
    }

    // Only show after initial auto-scroll has happened
    if (!hasAutoScrolled) {
      setShowScrollToNow(false);
      return;
    }

    // Don't show button while user is actively gesturing
    if (isUserGesturing.current) {
      return;
    }

    // Add a small delay to ensure scroll position has stabilized after auto-scroll
    const timeoutId = setTimeout(() => {
      // Don't show button if currently performing a scroll-to-current-time action
      if (isScrollingToCurrentTime.current) {
        return;
      }

      const now = new Date();
      const hour = now.getHours();
      const minutes = now.getMinutes();
      const currentTimePosition = (hour + minutes / 60) * 80;

      // Calculate visible viewport (accounting for day tabs, header, and bottom tab bar)
      const viewportTop = scrollY;
      const viewportHeight = screenHeight - 150; // More accurate accounting for UI elements
      const viewportBottom = scrollY + viewportHeight;

      // Add some margin to avoid showing button when current time is barely out of view
      const margin = 20; // 20px margin for better UX
      const isCurrentTimeOutOfView =
        currentTimePosition < (viewportTop - margin) ||
        currentTimePosition > (viewportBottom + margin);

      if (isCurrentTimeOutOfView) {
        setShowScrollToNow(true);
        // Determine arrow direction based on where current time is relative to viewport
        if (currentTimePosition < viewportTop) {
          setCurrentTimeDirection('up'); // Current time is above viewport
        } else {
          setCurrentTimeDirection('down'); // Current time is below viewport
        }
      } else {
        setShowScrollToNow(false);
      }
    }, hasAutoScrolled ? 0 : 200); // No delay for normal scroll, 200ms delay after auto-scroll

    return () => clearTimeout(timeoutId);
  }, [scrollY, selectedDay, hasAutoScrolled]);

  // Function to scroll back to current time
  const scrollToCurrentTime = () => {
    // Prevent double animations
    if (isScrollingToCurrentTime.current) {
      return;
    }

    isScrollingToCurrentTime.current = true;
    const currentTime = new Date();
    const hour = currentTime.getHours();
    const minutes = currentTime.getMinutes();
    const currentTimePosition = (hour + minutes / 60) * 80;
    const scrollPosition = Math.max(0, currentTimePosition - 80);

    // Hide the button immediately to prevent multiple clicks
    setShowScrollToNow(false);

    scrollViewRef.current?.scrollTo({
      y: scrollPosition,
      animated: true,
    });

    // Reset the flag after animation completes
    setTimeout(() => {
      isScrollingToCurrentTime.current = false;
    }, 500); // 500ms should be enough for the scroll animation
  };

  // Handle scroll events
  const handleScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    setScrollY(offsetY);
  };

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

  // Format time for display
  const formatTimeFromPosition = (yPosition: number) => {
    // Calculate time based on Y position
    const totalMinutes = (yPosition / 80) * 60;

    // No snapping - exact minute precision
    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.round(totalMinutes % 60);

    // Ensure hours are within 0-23 range
    const clampedHours = Math.max(0, Math.min(23, hours));
    const clampedMinutes = Math.max(0, Math.min(59, minutes));

    // Format for display
    const displayHour = clampedHours === 0 ? 12 : clampedHours > 12 ? clampedHours - 12 : clampedHours;
    const ampm = clampedHours < 12 ? 'AM' : 'PM';
    const minuteStr = clampedMinutes.toString().padStart(2, '0');

    return `${displayHour}:${minuteStr} ${ampm}`;
  };  // Handle pan gesture on time bar
  const onPanGestureEvent = (event: any) => {
    const { translationY, absoluteY } = event.nativeEvent;

    // Calculate position relative to the time grid
    const timeGridTop = 150; // Approximate offset from top (day tabs + headers)
    const relativeY = absoluteY - timeGridTop + scrollY;

    // Ensure the marker stays within the time grid bounds
    const clampedY = Math.max(0, Math.min(24 * 80 - 2, relativeY));

    // Update marker position directly without additional animations
    setMarkerY(clampedY);
    setMarkerTime(formatTimeFromPosition(clampedY));

    // Simplified scroll logic - use translationY for smoother experience
    const currentScreenY = absoluteY - 150; // Position relative to time grid start
    const viewportHeight = screenHeight - 226;

    // Define comfort zones for scrolling
    const topTriggerZone = viewportHeight * 0.2; // Top 20% of screen
    const bottomTriggerZone = viewportHeight * 0.8; // Bottom 20% of screen

    let shouldScroll = false;
    let newScrollY = scrollY;

    if (currentScreenY < topTriggerZone && scrollY > 0) {
      // Near top of screen, scroll up
      const scrollAmount = (topTriggerZone - currentScreenY) * 0.5;
      newScrollY = Math.max(0, scrollY - scrollAmount);
      shouldScroll = true;
    } else if (currentScreenY > bottomTriggerZone) {
      // Near bottom of screen, scroll down
      const maxScrollY = 24 * 80 - viewportHeight;
      const scrollAmount = (currentScreenY - bottomTriggerZone) * 0.5;
      newScrollY = Math.min(maxScrollY, scrollY + scrollAmount);
      shouldScroll = true;
    }

    // Apply smooth scrolling with throttling
    if (shouldScroll && Math.abs(newScrollY - scrollY) > 2) {
      const now = Date.now();
      if (now - lastScrollTime.current > 16) { // Throttle to ~60fps
        scrollViewRef.current?.scrollTo({
          y: newScrollY,
          animated: false,
        });
        lastScrollTime.current = now;
      }
    }

    // Haptic feedback every hour (based on exact position)
    const totalMinutes = (clampedY / 80) * 60;
    const currentHour = Math.floor(totalMinutes / 60);
    const currentMinute = Math.round(totalMinutes % 60);

    if (currentHour !== lastHapticHour && currentMinute === 0) {
      HapticFeedback.trigger('impactLight', hapticOptions);
      setLastHapticHour(currentHour);
    }
  };

  const onPanGestureStateChange = (event: any) => {
    const { state, absoluteY } = event.nativeEvent;

    if (state === State.BEGAN) {
      // Light haptic feedback when gesture starts
      HapticFeedback.trigger('impactLight', hapticOptions);

      // Mark that user is actively gesturing
      isUserGesturing.current = true;

      // Calculate initial position with exact precision
      const timeGridTop = 150;
      const relativeY = absoluteY - timeGridTop + scrollY;
      const clampedY = Math.max(0, Math.min(24 * 80 - 2, relativeY));

      setMarkerY(clampedY);
      setMarkerTime(formatTimeFromPosition(clampedY));
      setIsGestureActive(true);
      setLastHapticHour(-1); // Reset haptic tracking

      // Simple fade in animation only (no scaling)
      Animated.timing(markerOpacity, {
        toValue: 1,
        duration: 100,
        useNativeDriver: false,
      }).start();
    } else if (state === State.END || state === State.CANCELLED || state === State.FAILED) {
      setIsGestureActive(false);

      // Mark that user is no longer gesturing
      isUserGesturing.current = false;

      // Simple fade out animation
      Animated.timing(markerOpacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: false,
      }).start();
    } else if (state === State.ACTIVE) {
      onPanGestureEvent(event);
    }
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
        onScroll={handleScroll}
        scrollEventThrottle={16}
        scrollEnabled={!isGestureActive} // Disable native scrolling during gesture interaction
      >
        <View style={styles.timeGrid}>
          {/* Transparent touchable background to ensure scrolling works everywhere */}
          <TouchableOpacity
            style={styles.backgroundTouchable}
            activeOpacity={1}
            onPress={handleTimeTableClick}
          />

          {/* Time labels with gesture handler */}
          <PanGestureHandler
            onGestureEvent={onPanGestureEvent}
            onHandlerStateChange={onPanGestureStateChange}
            activeOffsetY={[-3, 3]}
            failOffsetX={[-15, 15]}
            shouldCancelWhenOutside={false}
            enableTrackpadTwoFingerGesture={false}
            minPointers={1}
            maxPointers={1}
          >
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
          </PanGestureHandler>

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

          {/* Floating time marker for gesture interaction */}
          {isGestureActive && (
            <Animated.View
              style={[
                styles.floatingTimeMarker,
                {
                  top: markerY,
                  opacity: markerOpacity,
                },
              ]}
              pointerEvents="none"
            >
              <View style={styles.floatingTimeMarkerLine} />
              <View style={styles.floatingTimeMarkerLabel}>
                <Text style={styles.floatingTimeMarkerText}>{markerTime}</Text>
              </View>
              <View style={styles.floatingTimeMarkerDot} />
            </Animated.View>
          )}
        </View>
      </ScrollView>

      {/* Scroll to Now button - only show for Today tab when user has scrolled away from current time */}
      {showScrollToNow && selectedDay === new Date().getDay() && (
        <TouchableOpacity
          style={[
            styles.scrollToNowButton,
            currentTimeDirection === 'up' && styles.scrollToNowButtonUp,
            currentTimeDirection === 'down' && styles.scrollToNowButtonDown,
          ]}
          onPress={scrollToCurrentTime}
          activeOpacity={0.8}>
          <Image
            source={currentTimeDirection === 'up' ? upArrowImage : downArrowImage}
            style={styles.scrollToNowButtonImage}
          />
        </TouchableOpacity>
      )}
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
  scrollToNowButton: {
    position: 'absolute',
    bottom: 90, // Position above the bottom navigation (76 + 14 for spacing)
    right: 20, // Position at right with some margin
    backgroundColor: '#6366f1',
    borderRadius: 25, // Slightly larger button for better visibility
    paddingVertical: 12,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1000, // Higher z-index to ensure it's always on top
    minWidth: 50, // Ensure minimum size
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollToNowButtonUp: {
    transform: [{translateY: 0}],
  },
  scrollToNowButtonDown: {
    transform: [{translateY: 0}],
  },
  scrollToNowButtonImage: {
    width: 24,
    height: 24,
    tintColor: '#FFFFFF', // Make the arrow white for visibility
  },
  scrollToNowButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  floatingTimeMarker: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 35,
  },
  floatingTimeMarkerLine: {
    position: 'absolute',
    left: 80,
    right: 0,
    height: 3,
    backgroundColor: '#9CA3AF', // Darker greyish color
    borderRadius: 2,
    shadowColor: '#9CA3AF',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.6,
    shadowRadius: 4,
    elevation: 8,
  },
  floatingTimeMarkerLabel: {
    position: 'absolute',
    left: 4,
    width: 72,
    backgroundColor: '#F8F9FA', // Off-white to match the line
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 10,
    borderWidth: 2,
    borderColor: '#2B2D31', // Off-black border
  },
  floatingTimeMarkerText: {
    color: '#2B2D31', // Off-black text for better contrast on off-white background
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },
  floatingTimeMarkerDot: {
    position: 'absolute',
    left: 74,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#2B2D31', // Off-black background
    borderWidth: 3,
    borderColor: '#F8F9FA', // Off-white border
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 10,
  },
});

export default TimeTable;
