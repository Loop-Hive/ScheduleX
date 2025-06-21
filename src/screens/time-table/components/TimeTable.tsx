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
  Modal,
} from 'react-native';
import {
  GestureHandlerRootView,
  PanGestureHandler,
  State,
} from 'react-native-gesture-handler';
import HapticFeedback from 'react-native-haptic-feedback';
import {getTextColorForBackground} from '../../../types/allCardConstraint';
import useStore from '../../../store/store';

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
  cardId?: number; // Added for attendance tracking
  registerId?: number; // Added for attendance tracking
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
  const {markPresent, markAbsent, registers, removeMarking} = useStore(); // Access attendance functions and register data

  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(new Date().getDay()); // Initialize with today
  const [selectedTabKey, setSelectedTabKey] = useState('today'); // Track which specific tab is selected
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(
    null,
  ); // Track clicked subject
  const [hasAutoScrolled, setHasAutoScrolled] = useState(false); // Track if we've already auto-scrolled
  const [scrollY, setScrollY] = useState(0); // Track current scroll position
  const [showScrollToNow, setShowScrollToNow] = useState(false); // Show "scroll to now" button
  const [currentTimeDirection, setCurrentTimeDirection] = useState<'up' | 'down'>('down'); // Where current time is relative to viewport

  // State for attendance modal
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [selectedSubjectForAttendance, setSelectedSubjectForAttendance] = useState<Subject | null>(null);

  // State for disabled attendance message
  const [showDisabledMessage, setShowDisabledMessage] = useState(false);

  // State for clear confirmation dialog
  const [showClearConfirmation, setShowClearConfirmation] = useState(false);

  // State for toast notification
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'present' | 'absent'>('present');
  const toastOpacity = useRef(new Animated.Value(0)).current;

  // State to force re-render when attendance changes
  const [attendanceUpdateTrigger, setAttendanceUpdateTrigger] = useState(0);

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

  // Get ordered days with Today and Tomorrow first, then complete week Monday-Sunday
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
      tabKey: 'today',
    });

    // Add Tomorrow tab
    orderedDays.push({
      name: 'Tomorrow',
      fullName: allDays[tomorrow].fullName,
      index: tomorrow,
      isSpecial: true,
      tabKey: 'tomorrow',
    });

    // Add complete week Monday through Sunday (independent of today/tomorrow)
    // Start with Monday (index 1) and go through Sunday (index 0)
    const weekOrder = [1, 2, 3, 4, 5, 6, 0]; // Monday to Sunday

    for (const dayIndex of weekOrder) {
      orderedDays.push({
        name: allDays[dayIndex].name,
        fullName: allDays[dayIndex].fullName,
        index: dayIndex,
        isSpecial: false,
        tabKey: `week-${dayIndex}`,
      });
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
      const isToday = selectedTabKey === 'today';
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
  }, [selectedDay, selectedTabKey]);

  // Calculate current time position and detect if user scrolled away (only for Today tab)
  useEffect(() => {
    const isToday = selectedTabKey === 'today';
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
  }, [scrollY, selectedDay, hasAutoScrolled, selectedTabKey]);

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

  // Group overlapping subjects together for side-by-side placement (Google Calendar style)
  const getSubjectGroups = (): Subject[][] => {
    const groups: Subject[][] = [];
    const processed = new Set<string>();

    // Sort subjects by start time to improve visual arrangement
    const sortedSubjects = [...todaySubjects].sort((a, b) => {
      const timeA = parseInt(a.startTime.split(':')[0]) * 60 + parseInt(a.startTime.split(':')[1]);
      const timeB = parseInt(b.startTime.split(':')[0]) * 60 + parseInt(b.startTime.split(':')[1]);
      return timeA - timeB;
    });

    sortedSubjects.forEach(subject => {
      if (processed.has(subject.id)) return;

      const group = [subject];
      processed.add(subject.id);

      // Find all subjects that overlap with any subject in current group
      let foundNewOverlap = true;
      while (foundNewOverlap) {
        foundNewOverlap = false;
        sortedSubjects.forEach(otherSubject => {
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

      // Sort group by start time for consistent positioning
      group.sort((a, b) => {
        const timeA = parseInt(a.startTime.split(':')[0]) * 60 + parseInt(a.startTime.split(':')[1]);
        const timeB = parseInt(b.startTime.split(':')[0]) * 60 + parseInt(b.startTime.split(':')[1]);
        return timeA - timeB;
      });

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

    // Add small vertical spacing to prevent overlapping of adjacent subjects
    const verticalSpacing = 1; // Small gap between vertically adjacent subjects
    const adjustedHeight = Math.max(endPosition - startPosition - verticalSpacing, 20); // Minimum height of 20

    // Google Calendar-inspired width calculation - NO STACKING, side-by-side placement
    // Key principles:
    // 1. Events are placed side by side, NOT stacked on top of each other
    // 2. Width is proportional: totalAvailableWidth / numberOfOverlappingEvents
    // 3. Minimum width is enforced for readability
    // 4. Events maintain their full height to show duration clearly
    const availableWidth = screenWidth - 80; // Total available width excluding time labels
    const minCardWidth = 80; // Minimum width for readability in overlapping scenarios
    const horizontalSpacing = 1; // Small gap between side-by-side events

    let cardWidth: number;
    let leftOffset: number;

    if (totalInGroup === 1) {
      // Single event: use full available width for maximum visibility
      cardWidth = availableWidth - 4; // Small margin to prevent edge touching
      leftOffset = 0;
    } else {
      // Multiple overlapping events: divide space equally, side by side
      const spacePerEvent = (availableWidth - (totalInGroup - 1) * horizontalSpacing) / totalInGroup;
      cardWidth = Math.max(minCardWidth, spacePerEvent);
      leftOffset = positionInGroup * (cardWidth + horizontalSpacing);

      // If calculated width is too small, use minimum and allow slight overlap
      if (cardWidth < minCardWidth) {
        cardWidth = minCardWidth;
        // Recalculate positions with overlap
        const totalNeededWidth = totalInGroup * minCardWidth;
        const overflowWidth = totalNeededWidth - availableWidth;
        const overlapPerGap = totalInGroup > 1 ? overflowWidth / (totalInGroup - 1) : 0;
        leftOffset = positionInGroup * (minCardWidth - overlapPerGap);
      }
    }

    // Ensure events don't overflow container
    const maxLeft = availableWidth - cardWidth;
    leftOffset = Math.min(leftOffset, Math.max(0, maxLeft));

    return {
      position: 'absolute' as const,
      top: startPosition,
      left: 80 + leftOffset + 2, // 2px margin from time labels
      width: Math.floor(cardWidth), // Ensure integer width
      height: adjustedHeight,
      zIndex: 20, // Same z-index for all events (no layering)
    };
  };

  // Handle subject card click to show attendance modal
  const handleSubjectClick = (subjectId: string) => {
    const subject = todaySubjects.find(s => s.id === subjectId);
    if (subject) {
      // Parse cardId and registerId from subject.id format: "${registerIdx}-${card.id}-${dayKey}-${slotIndex}"
      const idParts = subject.id.split('-');
      const registerId = parseInt(idParts[0], 10);
      const cardId = parseInt(idParts[1], 10);

      // Add the parsed IDs to the subject for attendance tracking
      const subjectWithIds = {
        ...subject,
        registerId,
        cardId
      };

      setSelectedSubjectForAttendance(subjectWithIds);
      setShowAttendanceModal(true);
    }
  };

  // Handle attendance actions
  const handleMarkPresent = () => {
    if (selectedSubjectForAttendance?.registerId !== undefined && selectedSubjectForAttendance?.cardId !== undefined) {
      markPresent(selectedSubjectForAttendance.registerId, selectedSubjectForAttendance.cardId);
      setShowAttendanceModal(false);
      setSelectedSubjectForAttendance(null);
      // Force re-render to show attendance indicator
      setAttendanceUpdateTrigger(prev => prev + 1);
    }
  };

  const handleMarkAbsent = () => {
    if (selectedSubjectForAttendance?.registerId !== undefined && selectedSubjectForAttendance?.cardId !== undefined) {
      markAbsent(selectedSubjectForAttendance.registerId, selectedSubjectForAttendance.cardId);
      setShowAttendanceModal(false);
      setSelectedSubjectForAttendance(null);
      // Force re-render to show attendance indicator
      setAttendanceUpdateTrigger(prev => prev + 1);
    }
  };

  // Handle clear attendance for today only
  const handleClearAttendance = () => {
    setShowClearConfirmation(true);
  };

  // Confirm and execute clear attendance
  const confirmClearAttendance = () => {
    if (selectedSubjectForAttendance?.registerId !== undefined && selectedSubjectForAttendance?.cardId !== undefined) {
      const registerId = selectedSubjectForAttendance.registerId;
      const cardId = selectedSubjectForAttendance.cardId;

      // Get today's date
      const today = new Date();
      const todayDateString = today.toDateString();

      // Find the register and card
      const register = registers[registerId];
      if (register?.cards) {
        const card = register.cards.find(c => c.id === cardId);
        if (card) {
          // Find all today's markings
          const todayMarkings = card.markedAt.filter(marking => {
            const markingDate = new Date(marking.date);
            return markingDate.toDateString() === todayDateString;
          });

          console.log(`Found ${todayMarkings.length} markings to clear for ${selectedSubjectForAttendance.name}`);

          if (todayMarkings.length > 0) {
            // Remove all today's markings in reverse order to avoid ID shifting issues
            // Sort by ID in descending order to remove highest IDs first
            const markingsToRemove = [...todayMarkings].sort((a, b) => b.id - a.id);

            markingsToRemove.forEach((marking, index) => {
              console.log(`Removing marking ${index + 1}/${markingsToRemove.length}: ID ${marking.id}, isPresent: ${marking.isPresent}`);
              try {
                removeMarking(registerId, cardId, marking.id);
              } catch (error) {
                console.error(`Error removing marking ${marking.id}:`, error);
              }
            });

            setShowClearConfirmation(false);
            setShowAttendanceModal(false);
            showToastNotification(`All attendance cleared for ${selectedSubjectForAttendance.name} today`, 'absent');
            setSelectedSubjectForAttendance(null);
            // Force re-render to hide attendance indicators
            setAttendanceUpdateTrigger(prev => prev + 1);
          } else {
            console.log('No markings found to clear');
            setShowClearConfirmation(false);
          }
        }
      }
    }
  };

  // Check if there's attendance marked for today that can be cleared
  const canClearTodayAttendance = (): boolean => {
    if (!selectedSubjectForAttendance || selectedTabKey !== 'today') return false;

    const attendanceStatus = getTodayAttendanceStatus(selectedSubjectForAttendance);
    return attendanceStatus !== null && (attendanceStatus.present > 0 || attendanceStatus.absent > 0);
  };

  // Check if attendance marking is allowed (only for today)
  const isAttendanceAllowed = () => {
    return selectedTabKey === 'today';
  };

  // Handle disabled attendance button clicks
  const handleDisabledAttendance = () => {
    const message = "Attendance cannot be marked for future classes.";

    setToastMessage(message);
    setToastType('absent'); // Use red color for warning
    setShowDisabledMessage(true);

    // Show the disabled message toast
    Animated.sequence([
      Animated.timing(toastOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay(2500), // Show for 2.5 seconds
      Animated.timing(toastOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowDisabledMessage(false);
    });
  };

  // Show toast notification
  const showToastNotification = (message: string, type: 'present' | 'absent') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);

    // Animate in
    Animated.sequence([
      Animated.timing(toastOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay(2000), // Show for 2 seconds
      Animated.timing(toastOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowToast(false);
    });
  };

  // Convert 24-hour time to 12-hour AM/PM format
  const formatTimeToAMPM = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  // Check today's attendance status for a subject - returns counts of present/absent
  const getTodayAttendanceStatus = (subject: Subject): { present: number; absent: number } | null => {
    // Only show indicators for today's tab
    if (selectedTabKey !== 'today') return null;

    // Parse subject ID to get registerId and cardId
    const idParts = subject.id.split('-');
    const registerId = parseInt(idParts[0], 10);
    const cardId = parseInt(idParts[1], 10);

    // Get today's date - need to check if any marking is from today
    const today = new Date();
    const todayDateString = today.toDateString(); // "Fri Jun 21 2025" format to match stored dates

    // Find the register and card
    const register = registers[registerId];
    if (!register?.cards) {
      console.log(`No register found for registerId: ${registerId}`);
      return null;
    }

    const card = register.cards.find(c => c.id === cardId);
    if (!card) {
      console.log(`No card found for cardId: ${cardId} in register: ${registerId}`);
      return null;
    }

    // Find all today's attendance markings
    const todayMarkings = card.markedAt.filter(marking => {
      const markingDate = new Date(marking.date);
      return markingDate.toDateString() === todayDateString;
    });

    if (todayMarkings.length === 0) {
      console.log(`No markings found for today (${todayDateString})`);
      return null;
    }

    // Count present and absent markings
    const presentCount = todayMarkings.filter(marking => marking.isPresent).length;
    const absentCount = todayMarkings.filter(marking => !marking.isPresent).length;

    console.log(`Found markings for ${subject.name}: ${presentCount} present, ${absentCount} absent`);
    console.log('attendanceUpdateTrigger:', attendanceUpdateTrigger); // Ensure re-render trigger

    return { present: presentCount, absent: absentCount };
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

    // Calculate if this is a narrow card to adjust text rendering
    const cardStyle = getSubjectStyle(subject, groupIndex, positionInGroup, totalInGroup);
    const isNarrowCard = cardStyle.width < 160;
    const isVeryNarrow = cardStyle.width < 130;

    // Helper function to format subject name for better word wrapping
    const formatSubjectName = (name: string, width: number) => {
      const words = name.split(' ');

      if (words.length === 1) {
        // Single word - use as is
        return name;
      }

      // For narrow cards, try to break into lines
      if (width < 130) {
        // Very narrow: show first word only with ellipsis if multiple words
        return words.length > 1 ? `${words[0]}...` : words[0];
      } else if (width < 160) {
        // Narrow: try to fit 2-3 words per line
        if (words.length === 2) {
          return name; // Let React Native handle the wrapping
        } else if (words.length >= 3) {
          // Put first 1-2 words on first line, rest on second
          const firstLine = words.slice(0, 2).join(' ');
          const secondLine = words.slice(2).join(' ');
          return `${firstLine}\n${secondLine}`;
        }
      }

      // For wider cards, allow natural word wrapping
      return name;
    };

    const formattedName = formatSubjectName(subject.name, cardStyle.width);
    const shouldUseWordWrapping = cardStyle.width >= 130 && subject.name.includes(' ');

    return (
      <TouchableOpacity
        key={subject.id}
        style={[
          styles.subjectCard,
          cardStyle,
          {backgroundColor: subject.color},
          isSelected && styles.subjectCardSelected,
          isNarrowCard && styles.subjectCardNarrow,
          // Add subtle border for overlapping events to distinguish them
          totalInGroup > 1 && {
            borderWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.3)',
          },
        ]}
        onPress={e => {
          e.stopPropagation();
          handleSubjectClick(subject.id);
        }}
        activeOpacity={0.8}>
        <View style={styles.subjectContent}>
          {/* Attendance indicators - show present and absent counts */}
          {(() => {
            const attendanceStatus = getTodayAttendanceStatus(subject);
            console.log(`Rendering indicators for ${subject.name}:`, attendanceStatus);
            if (!attendanceStatus || (attendanceStatus.present === 0 && attendanceStatus.absent === 0)) return null;

            const indicators = [];

            // Add present indicator if there are present markings
            if (attendanceStatus.present > 0) {
              indicators.push(
                <View
                  key="present"
                  style={[
                    styles.attendanceIndicator,
                    styles.attendancePresent,
                    indicators.length > 0 && { top: 6 + (indicators.length * 16) } // Stack vertically if multiple
                  ]}
                >
                  {attendanceStatus.present > 1 && (
                    <Text style={styles.attendanceCount}>{attendanceStatus.present}</Text>
                  )}
                </View>
              );
            }

            // Add absent indicator if there are absent markings
            if (attendanceStatus.absent > 0) {
              indicators.push(
                <View
                  key="absent"
                  style={[
                    styles.attendanceIndicator,
                    styles.attendanceAbsent,
                    indicators.length > 0 && { top: 6 + (indicators.length * 16) } // Stack vertically if multiple
                  ]}
                >
                  {attendanceStatus.absent > 1 && (
                    <Text style={styles.attendanceCount}>{attendanceStatus.absent}</Text>
                  )}
                </View>
              );
            }

            return indicators;
          })()}

          <Text
            style={[
              styles.subjectName,
              {color: textColor},
              isNarrowCard && styles.subjectNameNarrow,
              isVeryNarrow && styles.subjectNameVeryNarrow,
            ]}
            numberOfLines={isVeryNarrow ? 1 : shouldUseWordWrapping ? 3 : 2}
            adjustsFontSizeToFit={isVeryNarrow && !shouldUseWordWrapping}
            minimumFontScale={isVeryNarrow ? 0.8 : 1.0}>
            {formattedName}
          </Text>
          {subject.classroom && !isVeryNarrow && (
            <Text
              style={[
                styles.subjectClassroom,
                {color: textColor},
                isNarrowCard && styles.subjectClassroomNarrow,
              ]}
              numberOfLines={1}>
              {subject.classroom}
            </Text>
          )}
          {subject.classroom && isVeryNarrow && (
            <Text
              style={[
                styles.subjectClassroomVeryNarrow,
                {color: textColor},
              ]}
              numberOfLines={1}>
              {subject.classroom}
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
          contentContainerStyle={styles.dayTabsScrollView}
          bounces={false}
          decelerationRate="fast">
          {daysOfWeek.map(day => (
            <TouchableOpacity
              key={day.tabKey}
              style={[
                styles.dayTab,
                day.isSpecial && styles.specialDayTab,
                selectedTabKey === day.tabKey && styles.dayTabActive,
                selectedTabKey === day.tabKey && day.isSpecial && styles.specialDayTabActive,
              ]}
              onPress={() => {
                setSelectedDay(day.index);
                setSelectedTabKey(day.tabKey);
              }}>
              <Text
                style={[
                  styles.dayTabText,
                  day.isSpecial && styles.specialDayTabText,
                  selectedTabKey === day.tabKey && styles.dayTabTextActive,
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
        onScroll={handleScroll}
        scrollEventThrottle={16}
        scrollEnabled={!isGestureActive}>
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
          {selectedTabKey === 'today' && (
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
      {showScrollToNow && selectedTabKey === 'today' && (
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

      {/* Attendance Modal */}
      <Modal
        visible={showAttendanceModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          setShowAttendanceModal(false);
          setSelectedSubjectForAttendance(null);
        }}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Quick Attendance</Text>
              <Text style={styles.modalSubjectName}>
                {selectedSubjectForAttendance?.name}
              </Text>
              <Text style={styles.modalSubjectTime}>
                {selectedSubjectForAttendance &&
                  `${formatTimeToAMPM(selectedSubjectForAttendance.startTime)} - ${formatTimeToAMPM(selectedSubjectForAttendance.endTime)}`
                }
              </Text>
            </View>

            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.presentButton,
                  !isAttendanceAllowed() && styles.modalButtonDisabled
                ]}
                onPress={isAttendanceAllowed() ? handleMarkPresent : handleDisabledAttendance}
                activeOpacity={0.8}>
                <Text style={[
                  styles.modalButtonText,
                  !isAttendanceAllowed() && styles.modalButtonTextDisabled
                ]}>
                  ✓ Present
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.absentButton,
                  !isAttendanceAllowed() && styles.modalButtonDisabled
                ]}
                onPress={isAttendanceAllowed() ? handleMarkAbsent : handleDisabledAttendance}
                activeOpacity={0.8}>
                <Text style={[
                  styles.modalButtonText,
                  !isAttendanceAllowed() && styles.modalButtonTextDisabled
                ]}>
                  ✗ Absent
                </Text>
              </TouchableOpacity>
            </View>

            {/* Clear Attendance Button - only show for today if attendance is already marked */}
            {canClearTodayAttendance() && (
              <TouchableOpacity
                style={styles.modalClearButton}
                onPress={handleClearAttendance}
                activeOpacity={0.8}>
                <Text style={styles.modalClearButtonText}>🗑️ Clear Attendance</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => {
                setShowAttendanceModal(false);
                setSelectedSubjectForAttendance(null);
              }}
              activeOpacity={0.8}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Clear Attendance Confirmation Dialog */}
      <Modal
        visible={showClearConfirmation}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowClearConfirmation(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.confirmationModalContent}>
            <View style={styles.confirmationHeader}>
              <Text style={styles.confirmationTitle}>Clear Attendance</Text>
              <Text style={styles.confirmationMessage}>
                Are you sure you want to clear all attendance for{' '}
                <Text style={styles.confirmationSubjectName}>
                  {selectedSubjectForAttendance?.name}
                </Text>{' '}
                today? This action cannot be undone.
              </Text>
            </View>

            <View style={styles.confirmationButtonContainer}>
              <TouchableOpacity
                style={styles.confirmationCancelButton}
                onPress={() => setShowClearConfirmation(false)}
                activeOpacity={0.8}>
                <Text style={styles.confirmationCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.confirmationConfirmButton}
                onPress={confirmClearAttendance}
                activeOpacity={0.8}>
                <Text style={styles.confirmationConfirmText}>Clear All</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Toast Notification */}
      {(showToast || showDisabledMessage) && (
        <Animated.View
          style={[
            styles.toastContainer,
            { opacity: toastOpacity },
            toastType === 'present' ? styles.toastPresent : styles.toastAbsent
          ]}
          pointerEvents="none">
          <View style={styles.toastContent}>
            <Text style={styles.toastIcon}>
              {showDisabledMessage ? '⚠️' : (toastType === 'present' ? '✓' : '✗')}
            </Text>
            <Text style={styles.toastText}>{toastMessage}</Text>
          </View>
        </Animated.View>
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
  subjectCardNarrow: {
    padding: 6, // Reduced padding for narrow cards
    borderRadius: 6,
  },
  subjectContent: {
    flex: 1,
  },
  subjectName: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  subjectNameNarrow: {
    fontSize: 12,
    marginBottom: 1,
    lineHeight: 14,
  },
  subjectNameVeryNarrow: {
    fontSize: 11,
    marginBottom: 0,
    lineHeight: 13,
  },
  subjectClassroom: {
    fontSize: 11,
    marginBottom: 4,
  },
  subjectClassroomNarrow: {
    fontSize: 10,
    marginBottom: 2,
  },
  subjectClassroomVeryNarrow: {
    fontSize: 9,
    marginBottom: 0,
    opacity: 0.8,
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
    paddingRight: 20, // Add extra padding at the end to ensure all tabs are accessible
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
    marginHorizontal: 4, // Use consistent margin like regular tabs
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
    minWidth: 42, // Ensure minimum size
    minHeight: 42,
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
    width: 15,
    height: 15,
    tintColor: '#F0F0F0', // Make the arrow off-white for visibility
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
    right: 4, // Move to right side instead of left
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
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#27272A',
    borderRadius: 16,
    padding: 24,
    width: screenWidth * 0.85,
    maxWidth: 320,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 16,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#F4F4F5',
    marginBottom: 8,
  },
  modalSubjectName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#E4E4E7',
    textAlign: 'center',
    marginBottom: 4,
  },
  modalSubjectTime: {
    fontSize: 14,
    color: '#A1A1AA',
    textAlign: 'center',
  },
  modalWarningText: {
    fontSize: 12,
    color: '#F59E0B',
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '500',
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  presentButton: {
    backgroundColor: '#22C55E',
  },
  absentButton: {
    backgroundColor: '#EF4444',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  modalButtonDisabled: {
    backgroundColor: '#4B5563', // Grayed out background
    opacity: 0.6,
  },
  modalButtonTextDisabled: {
    color: '#9CA3AF', // Grayed out text
  },
  modalClearButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F59E0B',
    borderRadius: 8,
    marginBottom: 12,
  },
  modalClearButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  modalCancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelText: {
    fontSize: 16,
    color: '#A1A1AA',
    fontWeight: '500',
  },
  // Toast styles
  toastContainer: {
    position: 'absolute',
    top: 100,
    left: 20,
    right: 20,
    zIndex: 1000,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 16,
  },
  toastPresent: {
    backgroundColor: '#22C55E',
  },
  toastAbsent: {
    backgroundColor: '#EF4444',
  },
  toastContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  toastIcon: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginRight: 12,
  },
  toastText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    flex: 1,
  },
  // Attendance indicator styles
  attendanceIndicator: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 12,
    height: 12,
    borderRadius: 6,
    zIndex: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  attendancePresent: {
    backgroundColor: '#22C55E', // Green for present
  },
  attendanceAbsent: {
    backgroundColor: '#EF4444', // Red for absent
  },
  attendanceCount: {
    fontSize: 8,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 10,
  },
  // Confirmation dialog styles
  confirmationModalContent: {
    backgroundColor: '#27272A',
    borderRadius: 16,
    padding: 24,
    width: screenWidth * 0.85,
    maxWidth: 350,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 16,
  },
  confirmationHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  confirmationTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#F4F4F5',
    marginBottom: 12,
  },
  confirmationMessage: {
    fontSize: 16,
    color: '#E4E4E7',
    textAlign: 'center',
    lineHeight: 22,
  },
  confirmationSubjectName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6366F1',
  },
  confirmationButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  confirmationCancelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4B5563',
  },
  confirmationCancelText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#F4F4F5',
  },
  confirmationConfirmButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EF4444',
  },
  confirmationConfirmText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default TimeTable;
