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
  PinchGestureHandler,
  State,
} from 'react-native-gesture-handler';
import HapticFeedback from 'react-native-haptic-feedback';
import {getTextColorForBackground} from '../../../types/allCardConstraint';
import useStore from '../../../store/store';

// Import arrow and zoom images
const upArrowImage = require('../../../assets/icons/up-arrow.png');
const downArrowImage = require('../../../assets/icons/down-arrow.png');
const zoomInImage = require('../../../assets/icons/zoom-in.png');
const zoomOutImage = require('../../../assets/icons/zoom-out.png');

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
  timeSlot?: string; // Added for per-slot attendance tracking
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

  // State for notification animation
  const notificationOpacity = useRef(new Animated.Value(0)).current;
  const notificationAnimationRef = useRef<Animated.CompositeAnimation | null>(null);

  // State for simple notification system
  const [notificationData, setNotificationData] = useState<{
    message: string;
    type: 'no-events' | 'all-completed';
    visible: boolean;
  } | null>(null);
  const [previousTabKey, setPreviousTabKey] = useState(selectedTabKey);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [hasShownPopupForCurrentTab, setHasShownPopupForCurrentTab] = useState(false);
  const [lastPopupTime, setLastPopupTime] = useState(0);
  const [lastNotificationMessage, setLastNotificationMessage] = useState<string>('');
  const simpleTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // State to force re-render when attendance changes
  const [attendanceUpdateTrigger, setAttendanceUpdateTrigger] = useState(0);

  // State for floating time marker
  const [isGestureActive, setIsGestureActive] = useState(false);
  const [markerY, setMarkerY] = useState(0);
  const [markerTime, setMarkerTime] = useState('12:00 AM');
  const [lastHapticHour, setLastHapticHour] = useState(-1);
  const lastScrollTime = useRef(0); // Add throttling for scroll updates

  // State for pinch-to-zoom functionality
  const [zoomScale, setZoomScale] = useState(1);
  const zoomGestureRef = useRef<PinchGestureHandler>(null);
  const baseHourHeight = 80; // Base height for each hour slot
  const gestureScale = useRef(new Animated.Value(1)).current;
  const lastZoomScale = useRef(1); // Track the scale before gesture starts

  // Focal point zoom variables for Google Calendar-like behavior
  const zoomFocalPoint = useRef<{y: number, scrollY: number} | null>(null);
  const initialScrollOffset = useRef(0);
  const isZooming = useRef(false); // Flag to prevent scroll conflicts during zoom
  const lastUpdateTime = useRef(0); // Throttle fast zoom updates

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
    const hourHeight = baseHourHeight * zoomScale;
    const position = (hour + minutes / 60) * hourHeight; // Use dynamic hour height

    Animated.timing(currentTimeLineY, {
      toValue: position,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [currentTime, currentTimeLineY, zoomScale]);

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
        const hourHeight = baseHourHeight * zoomScale;
        const currentTimePosition = (hour + minutes / 60) * hourHeight;
        // Show exactly 1 hour before current time (consistent with other day behavior)
        scrollPosition = Math.max(0, currentTimePosition - hourHeight);
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
          const hourHeight = baseHourHeight * zoomScale;
          const subjectPosition = (hours + minutes / 60) * hourHeight;
          // Scroll to show 1 hour before the first subject (or to top if subject is too early)
          scrollPosition = Math.max(0, subjectPosition - hourHeight);
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
  }, [selectedDay, hasAutoScrolled, subjects, zoomScale]);

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
      const hourHeight = baseHourHeight * zoomScale;
      const currentTimePosition = (hour + minutes / 60) * hourHeight;

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
  }, [scrollY, selectedDay, hasAutoScrolled, selectedTabKey, zoomScale]);

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
    const hourHeight = baseHourHeight * zoomScale;
    const currentTimePosition = (hour + minutes / 60) * hourHeight;
    const scrollPosition = Math.max(0, currentTimePosition - hourHeight);

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

    // Update initial scroll offset for zoom focal point calculations only if not currently zooming
    if (!isZooming.current) {
      initialScrollOffset.current = offsetY;
    }
  };

  // Get subjects for selected day
  const todaySubjects = subjects.filter(
    subject => subject.dayOfWeek === selectedDay,
  );

  // Initialize previous tab key to avoid initial popup
  useEffect(() => {
    setPreviousTabKey(selectedTabKey);
    // Mark as initialized after a short delay to avoid initial popup
    setTimeout(() => {
      setHasInitialized(true);
    }, 500);
  }, []); // Only run once on mount

  // Check schedule status and show popup when tab changes
  useEffect(() => {
    // Only show popup when tab actually changes and component has initialized
    if (hasInitialized && previousTabKey !== selectedTabKey) {
      setPreviousTabKey(selectedTabKey);
      setHasShownPopupForCurrentTab(false); // Reset popup flag for new tab

      // Short delay to allow UI to settle and then show new popup
      setTimeout(() => {
        checkAndShowNotification();
      }, 100);
    }
  }, [selectedTabKey, hasInitialized, subjects, registers]);

  // Also trigger popup when day changes (for non-today tabs)
  useEffect(() => {
    // Show popup for day changes only if it's not the initial load
    if (hasInitialized && previousTabKey === selectedTabKey && previousTabKey !== null) {
      setHasShownPopupForCurrentTab(false); // Reset popup flag for new day

      // Short delay to allow UI to settle and then show new popup
      setTimeout(() => {
        debouncedCheckAndShowNotification();
      }, 100);
    }
  }, [selectedDay, hasInitialized, subjects, registers]);

  // Check when attendance changes but don't automatically show popup
  useEffect(() => {
    // Only check attendance changes for today's tab and only if popup hasn't been shown
    if (hasInitialized && selectedTabKey === 'today' && !hasShownPopupForCurrentTab) {
      setTimeout(() => {
        debouncedCheckAndShowNotification();
      }, 200);
    }
  }, [attendanceUpdateTrigger, hasInitialized]);  // Cleanup notification timeout and animation on unmount
  useEffect(() => {
    return () => {
      // Cancel any ongoing animation
      if (notificationAnimationRef.current) {
        notificationAnimationRef.current.stop();
        notificationAnimationRef.current = null;
      }
      if (simpleTimeoutRef.current) {
        clearTimeout(simpleTimeoutRef.current);
      }
      // Reset notification animation to prevent glitches
      notificationOpacity.setValue(0);
    };
  }, []);

  // Simple notification functions
  const showNotification = (message: string, type: 'no-events' | 'all-completed') => {
    console.log('Showing notification:', message, type);

    // Cancel any ongoing animation to prevent overlapping
    if (notificationAnimationRef.current) {
      notificationAnimationRef.current.stop();
      notificationAnimationRef.current = null;
    }

    // Clear any existing timeout
    if (simpleTimeoutRef.current) {
      clearTimeout(simpleTimeoutRef.current);
    }

    // Reset animation value and set new notification
    notificationOpacity.setValue(0);
    setNotificationData({ message, type, visible: true });

    // Smooth fade in and out animation with shorter duration to prevent overlap
    const animation = Animated.sequence([
      Animated.timing(notificationOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay(800), // Reduced from 1200ms to 800ms to prevent overlap
      Animated.timing(notificationOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]);

    notificationAnimationRef.current = animation;
    animation.start((finished) => {
      if (finished) {
        setNotificationData(null);
        notificationAnimationRef.current = null;
      }
    });
  };

  // Debounced version to prevent rapid notifications
  const debouncedCheckAndShowNotification = () => {
    // Simple 100ms delay
    setTimeout(() => {
      checkAndShowNotification();
    }, 100);
  };

  const checkAndShowNotification = () => {
    // Don't show notifications while dropdowns are open or modals are active
    if (showAttendanceModal || showClearConfirmation) {
      return;
    }

    // Get fresh subjects for selected day to avoid stale closure
    const currentDaySubjects = subjects.filter(
      subject => subject.dayOfWeek === selectedDay,
    );

    const today = new Date();
    const todayDateString = today.toDateString();
    const selectedDate = new Date();
    selectedDate.setDate(today.getDate() + (selectedDay - today.getDay()));

    const isToday = selectedTabKey === 'today';
    const isTomorrow = selectedTabKey === 'tomorrow';

    // No subjects for this day
    if (currentDaySubjects.length === 0) {
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const selectedDayName = dayNames[selectedDay];

      let message = '';
      if (isToday) {
        message = 'No events today';
      } else if (isTomorrow) {
        message = 'No events tomorrow';
      } else {
        message = `No events on ${selectedDayName}`;
      }

      console.log('Showing notification:', message); // Debug log
      showNotification(message, 'no-events');
      return;
    }

    // Check if all today's classes are completed (only for today)
    if (isToday && currentDaySubjects.length > 0) {
      const allClassesCompleted = currentDaySubjects.every(subject => {
        // Extract register and card info from subject ID
        const idParts = subject.id.split('-');
        if (idParts.length < 2) return false;

        const registerId = parseInt(idParts[0], 10);
        const cardId = parseInt(idParts[1], 10);

        // Skip if invalid IDs
        if (isNaN(registerId) || isNaN(cardId)) return false;

        // Get the card from the register
        const register = registers[registerId];
        if (!register) return false;

        const card = register.cards.find(c => c.id === cardId);
        if (!card) return false;

        // Check if this card has been marked today
        const hasMarkingToday = card.markedAt.some(marking => {
          try {
            const markingDate = new Date(marking.date);
            return markingDate.toDateString() === todayDateString;
          } catch (e) {
            return false;
          }
        });

        return hasMarkingToday;
      });

      if (allClassesCompleted && currentDaySubjects.length > 0) {
        const message = 'All classes completed';
        console.log('Showing completion notification:', message); // Debug log
        showNotification(message, 'all-completed');
        return;
      }
    }
  };

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

    // Calculate exact positions using zoom scale
    const hourHeight = baseHourHeight * zoomScale;
    const startPosition = (startHour + startMinutes / 60) * hourHeight;
    const endPosition = (endHour + endMinutes / 60) * hourHeight;

    // Calculate duration for responsive height adjustment
    const durationMinutes = (endHour * 60 + endMinutes) - (startHour * 60 + startMinutes);    // Add small vertical spacing to prevent overlapping of adjacent subjects
    const verticalSpacing = 1; // Small gap between vertically adjacent subjects

    // Google Calendar-inspired dynamic minimum height
    // Ensures text is always readable regardless of zoom level
    let minHeight: number;
    if (durationMinutes <= 5) {
      // Very small intervals: ensure minimum height for text visibility
      minHeight = Math.max(20, hourHeight * 0.15); // Increased to ensure text is always visible
    } else if (durationMinutes <= 15) {
      // Small intervals: ensure adequate space for text and indicators
      minHeight = Math.max(28, hourHeight * 0.2); // Increased for better text visibility
    } else if (durationMinutes <= 30) {
      // Medium intervals: standard minimum
      minHeight = Math.max(30, hourHeight * 0.25); // Can fit 2 lines comfortably
    } else {
      // Regular intervals: allow natural sizing but with reasonable minimum
      minHeight = 32;
    }

    const adjustedHeight = Math.max(endPosition - startPosition - verticalSpacing, minHeight);

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
      const dayKey = idParts[2]; // day part
      const slotIndex = idParts[3]; // slot part

      // Create time slot identifier from the subject's start and end time
      const timeSlot = `${dayKey}-${slotIndex}-${subject.startTime}-${subject.endTime}`;

      // Add the parsed IDs and time slot to the subject for attendance tracking
      const subjectWithIds = {
        ...subject,
        registerId,
        cardId,
        timeSlot
      };

      setSelectedSubjectForAttendance(subjectWithIds);
      setShowAttendanceModal(true);
    }
  };

  // Handle attendance actions
  const handleMarkPresent = () => {
    if (selectedSubjectForAttendance?.registerId !== undefined && selectedSubjectForAttendance?.cardId !== undefined) {
      markPresent(selectedSubjectForAttendance.registerId, selectedSubjectForAttendance.cardId, selectedSubjectForAttendance.timeSlot);
      setShowAttendanceModal(false);
      setSelectedSubjectForAttendance(null);
      // Force re-render to show attendance indicator
      setAttendanceUpdateTrigger(prev => prev + 1);
    }
  };

  const handleMarkAbsent = () => {
    if (selectedSubjectForAttendance?.registerId !== undefined && selectedSubjectForAttendance?.cardId !== undefined) {
      markAbsent(selectedSubjectForAttendance.registerId, selectedSubjectForAttendance.cardId, selectedSubjectForAttendance.timeSlot);
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
      const timeSlot = selectedSubjectForAttendance.timeSlot;

      // Get today's date
      const today = new Date();
      const todayDateString = today.toDateString();

      // Find the register and card
      const register = registers[registerId];
      if (register?.cards) {
        const card = register.cards.find(c => c.id === cardId);
        if (card) {
          // Find all today's markings first
          const allTodayMarkings = card.markedAt.filter(marking => {
            const markingDate = new Date(marking.date);
            return markingDate.toDateString() === todayDateString;
          });

          // Check if there are any markings with timeSlot for this card today
          const hasTimeSlotMarkings = allTodayMarkings.some(marking => marking.timeSlot);

          let todayMarkings;

          if (hasTimeSlotMarkings) {
            // If there are time slot markings, filter by specific time slot
            todayMarkings = allTodayMarkings.filter(marking => marking.timeSlot === timeSlot);
          } else {
            // If no time slot markings exist, clear all today's markings (backward compatibility)
            todayMarkings = allTodayMarkings;
          }

          console.log(`Found ${todayMarkings.length} markings to clear for ${selectedSubjectForAttendance.name} at time slot ${timeSlot}`);

          if (todayMarkings.length > 0) {
            // Remove all today's markings for this time slot in reverse order to avoid ID shifting issues
            // Sort by ID in descending order to remove highest IDs first
            const markingsToRemove = [...todayMarkings].sort((a, b) => b.id - a.id);

            markingsToRemove.forEach((marking, index) => {
              console.log(`Removing marking ${index + 1}/${markingsToRemove.length}: ID ${marking.id}, isPresent: ${marking.isPresent}, timeSlot: ${marking.timeSlot}`);
              try {
                removeMarking(registerId, cardId, marking.id);
              } catch (error) {
                console.error(`Error removing marking ${marking.id}:`, error);
              }
            });

            setShowClearConfirmation(false);
            setShowAttendanceModal(false);
            showToastNotification('Attendance cleared', 'absent');
            setSelectedSubjectForAttendance(null);
            // Force re-render to hide attendance indicators
            setAttendanceUpdateTrigger(prev => prev + 1);
          } else {
            console.log('No markings found to clear for this time slot');
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
    const message = "Cannot mark future Events";

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

    // Parse subject ID to get registerId, cardId, and time slot info
    const idParts = subject.id.split('-');
    const registerId = parseInt(idParts[0], 10);
    const cardId = parseInt(idParts[1], 10);
    const dayKey = idParts[2]; // day part
    const slotIndex = idParts[3]; // slot part

    // Create time slot identifier that matches what we store
    const subjectTimeSlot = `${dayKey}-${slotIndex}-${subject.startTime}-${subject.endTime}`;

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

    console.log(`Checking attendance for ${subject.name} (${subjectTimeSlot})`);
    console.log(`Total markings for card:`, card.markedAt.length);

    // Find all today's markings first
    const allTodayMarkings = card.markedAt.filter(marking => {
      const markingDate = new Date(marking.date);
      return markingDate.toDateString() === todayDateString;
    });

    console.log(`Today's markings:`, allTodayMarkings.length);

    // Check if there are any markings with timeSlot for this card today
    const hasTimeSlotMarkings = allTodayMarkings.some(marking => marking.timeSlot);

    let todayMarkings;

    if (hasTimeSlotMarkings) {
      // If there are time slot markings, filter by specific time slot
      todayMarkings = allTodayMarkings.filter(marking => marking.timeSlot === subjectTimeSlot);
      console.log(`Time slot specific markings for ${subjectTimeSlot}:`, todayMarkings.length);
    } else {
      // If no time slot markings exist, show all today's markings (backward compatibility)
      todayMarkings = allTodayMarkings;
      console.log(`Using all today's markings (no timeSlot field):`, todayMarkings.length);
    }

    if (todayMarkings.length === 0) {
      console.log(`No markings found for today (${todayDateString}) and time slot (${subjectTimeSlot})`);
      return null;
    }

    // Count present and absent markings for this specific time slot
    const presentCount = todayMarkings.filter(marking => marking.isPresent).length;
    const absentCount = todayMarkings.filter(marking => !marking.isPresent).length;

    console.log(`Found markings for ${subject.name} at ${subjectTimeSlot}: ${presentCount} present, ${absentCount} absent`);
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
    // Calculate time based on Y position and current zoom scale
    const hourHeight = baseHourHeight * zoomScale;
    const totalMinutes = (yPosition / hourHeight) * 60;

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
    const totalGridHeight = 24 * baseHourHeight * zoomScale;
    const clampedY = Math.max(0, Math.min(totalGridHeight - 2, relativeY));

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

  // Handle pinch gesture for zoom functionality
  const onPinchGestureEvent = (event: any) => {
    const { scale, focalY } = event.nativeEvent;

    // Reduce throttling for better gesture responsiveness
    const now = Date.now();
    if (now - lastUpdateTime.current < 8) { // More responsive - 120fps
      return;
    }
    lastUpdateTime.current = now;

    // Apply zoom immediately during gesture for smooth feedback
    const scaleFactor = 1 + (scale - 1) * 0.9; // More sensitive for better responsiveness
    const newScale = Math.min(Math.max(lastZoomScale.current * scaleFactor, 0.5), 3);

    // Calculate focal point zoom to keep the pinch center stationary
    if (zoomFocalPoint.current && scrollViewRef.current) {
      const { y: focalPointY, scrollY: initialScrollY } = zoomFocalPoint.current;

      // Calculate the content position that should remain stationary
      const contentPosition = initialScrollY + focalPointY;

      // Calculate scale ratio from the original scale (not current scale)
      const scaleFromOriginal = newScale / lastZoomScale.current;

      // Calculate where this content position should be after scaling
      const newContentPosition = contentPosition * scaleFromOriginal;

      // Calculate required scroll to keep focal point stationary
      const requiredScroll = newContentPosition - focalPointY;

      // Apply both updates immediately and synchronously to prevent double animation
      setZoomScale(newScale);
      scrollViewRef.current.scrollTo({
        y: Math.max(0, requiredScroll),
        animated: false
      });
    } else {
      setZoomScale(newScale);
    }
  };

  const onPinchGestureStateChange = (event: any) => {
    const { state, scale, focalY } = event.nativeEvent;

    if (state === State.BEGAN) {
      // Set zooming flag to prevent scroll conflicts
      isZooming.current = true;

      // Reset throttling for new gesture
      lastUpdateTime.current = 0;

      // Store the current scale and focal point when gesture begins
      lastZoomScale.current = zoomScale;

      // Capture the focal point and current scroll position
      zoomFocalPoint.current = {
        y: focalY,
        scrollY: initialScrollOffset.current
      };
    } else if (state === State.END || state === State.CANCELLED || state === State.FAILED) {
      // Calculate final scale and update lastZoomScale for next gesture
      const scaleFactor = 1 + (scale - 1) * 0.9;
      const finalScale = Math.min(Math.max(lastZoomScale.current * scaleFactor, 0.5), 3);
      lastZoomScale.current = finalScale;
      setZoomScale(finalScale);

      // Clear focal point reference and zooming flag
      zoomFocalPoint.current = null;
      isZooming.current = false;

      // Add haptic feedback when zoom gesture ends
      HapticFeedback.trigger('impactLight', hapticOptions);
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

    // Calculate card style and dimensions
    const cardStyle = getSubjectStyle(subject, groupIndex, positionInGroup, totalInGroup);
    const cardHeight = cardStyle.height;
    const cardWidth = cardStyle.width;

    // Calculate duration in minutes for responsive sizing
    const startTime = subject.startTime.split(':');
    const endTime = subject.endTime.split(':');
    const startMinutes = parseInt(startTime[0]) * 60 + parseInt(startTime[1]);
    const endMinutes = parseInt(endTime[0]) * 60 + parseInt(endTime[1]);
    const durationMinutes = endMinutes - startMinutes;

    // Responsive sizing based on card height and duration
    const isVerySmallInterval = durationMinutes <= 5;
    const isSmallInterval = durationMinutes <= 15;
    const isTinyCard = cardHeight < 25;
    const isVeryTinyCard = cardHeight < 15;
    const isNarrowCard = cardWidth < 160;
    const isVeryNarrow = cardWidth < 130;

    // Dynamic padding based on card size - more generous for readability
    const getDynamicPadding = () => {
      if (isVeryTinyCard) return 1; // Minimal padding for very small cards
      if (isTinyCard) return 2;
      if (isSmallInterval) return 4; // More padding for 5-15 minute intervals
      if (isNarrowCard) return 5;
      return 6; // Standard padding
    };

    // Smart font sizing - prioritize readability and full text display
    const getDynamicFontSizes = () => {
      // Check if we have attendance indicators
      const attendanceStatus = getTodayAttendanceStatus(subject);
      const hasAttendanceIndicators = attendanceStatus && (attendanceStatus.present > 0 || attendanceStatus.absent > 0) && !isVeryTinyCard;

      if (isVeryTinyCard) {
        return {
          nameSize: 11, // Minimum readable size
          classroomSize: 9,
          showClassroom: false, // Hide secondary info in very tiny cards
          maxLines: 1,
        };
      }
      if (isTinyCard) {
        return {
          nameSize: 12, // Larger for better readability
          classroomSize: 10,
          showClassroom: false, // Hide classroom to prioritize event name
          maxLines: 1,
        };
      }
      if (isSmallInterval) {
        return {
          nameSize: 13, // Larger font for 5-15 minute intervals
          classroomSize: 11,
          // Show classroom if there's space, but be slightly more conservative with indicators
          showClassroom: cardWidth > 100 && cardHeight > 35 && (!hasAttendanceIndicators || cardHeight > 40),
          maxLines: cardHeight > 30 ? (hasAttendanceIndicators && cardHeight < 50 ? 1 : 2) : 1,
        };
      }
      if (isVeryNarrow) {
        return {
          nameSize: 12,
          classroomSize: 10,
          showClassroom: !hasAttendanceIndicators || cardHeight > 35,
          maxLines: hasAttendanceIndicators && cardHeight < 35 ? 1 : 2,
        };
      }
      if (isNarrowCard) {
        return {
          nameSize: 13,
          classroomSize: 11,
          showClassroom: true,
          maxLines: 2,
        };
      }
      return {
        nameSize: 14,
        classroomSize: 11,
        showClassroom: true,
        maxLines: 3,
      };
    };

    const dynamicPadding = getDynamicPadding();
    const fontSizes = getDynamicFontSizes();

    // Smart text formatting - let React Native handle overflow naturally
    const formatSubjectName = (name: string, width: number, height: number, maxLines: number) => {
      const words = name.split(' ');

      // Only truncate for extremely tiny cards where even 1 line won't fit properly
      if (isVeryTinyCard) {
        if (words.length > 1) {
          // Create abbreviation: "Computer Science" -> "CS"
          const abbreviation = words
            .filter(word => word.length > 0)
            .map(word => word.charAt(0).toUpperCase())
            .join('');
          if (abbreviation.length <= 3) {
            return abbreviation;
          }
          // If abbreviation is too long, use first word
          return words[0].substring(0, 5);
        }
        // Single word: truncate smartly
        return name.length > 6 ? name.substring(0, 5) : name;
      }

      // For all other cases, return the full name and let React Native handle truncation
      // This ensures we show as much as possible within the available space
      return name;
    };

    const formattedName = formatSubjectName(subject.name, cardWidth, cardHeight, fontSizes.maxLines);
    const shouldUseWordWrapping = cardWidth >= 130 && subject.name.includes(' ') && !isTinyCard;

    return (
      <TouchableOpacity
        key={subject.id}
        style={[
          styles.subjectCard,
          cardStyle,
          {
            backgroundColor: subject.color,
            padding: dynamicPadding,
            // Override radius for very tiny cards
            borderRadius: isVeryTinyCard ? 4 : isTinyCard ? 6 : 8,
          },
          isSelected && styles.subjectCardSelected,
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

            // Hide attendance indicators for very tiny cards to save space
            if (isVeryTinyCard || !attendanceStatus || (attendanceStatus.present === 0 && attendanceStatus.absent === 0)) return null;

            const indicators = [];

            // Add present indicator if there are present markings
            if (attendanceStatus.present > 0) {
              indicators.push(
                <View
                  key="present"
                  style={[
                    styles.attendancePresent,
                    {
                      // Even smaller indicators that fit better
                      width: isTinyCard ? 6 : 8,
                      height: isTinyCard ? 6 : 8,
                      borderRadius: isTinyCard ? 3 : 4,
                      borderWidth: 1,
                      borderColor: 'rgba(255, 255, 255, 0.8)',
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginRight: 2, // Small gap between indicators
                      // Allow indicators to be clickable
                      pointerEvents: 'auto',
                    },
                  ]}
                >
                  {attendanceStatus.present > 1 && !isTinyCard && (
                    <Text style={[
                      styles.attendanceCount,
                      {
                        fontSize: 6,
                        lineHeight: 6,
                        textAlign: 'center',
                        textAlignVertical: 'center',
                        includeFontPadding: false,
                      }
                    ]}>
                      {attendanceStatus.present}
                    </Text>
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
                    styles.attendanceAbsent,
                    {
                      // Even smaller indicators that fit better
                      width: isTinyCard ? 6 : 8,
                      height: isTinyCard ? 6 : 8,
                      borderRadius: isTinyCard ? 3 : 4,
                      borderWidth: 1,
                      borderColor: 'rgba(255, 255, 255, 0.8)',
                      justifyContent: 'center',
                      alignItems: 'center',
                      // Allow indicators to be clickable
                      pointerEvents: 'auto',
                    },
                  ]}
                >
                  {attendanceStatus.absent > 1 && !isTinyCard && (
                    <Text style={[
                      styles.attendanceCount,
                      {
                        fontSize: 6,
                        lineHeight: 6,
                        textAlign: 'center',
                        textAlignVertical: 'center',
                        includeFontPadding: false,
                      }
                    ]}>
                      {attendanceStatus.absent}
                    </Text>
                  )}
                </View>
              );
            }

            return (
              <View style={styles.attendanceIndicatorContainer}>
                {indicators}
              </View>
            );
          })()}

          {/* Check if we have attendance indicators to adjust text layout */}
          {(() => {
            const attendanceStatus = getTodayAttendanceStatus(subject);
            const hasAttendanceIndicators = attendanceStatus && (attendanceStatus.present > 0 || attendanceStatus.absent > 0) && !isVeryTinyCard;

            // Calculate how much space attendance indicators take up (updated for smaller indicators)
            const indicatorWidth = hasAttendanceIndicators ? (
              (attendanceStatus.present > 0 ? (isTinyCard ? 6 : 8) : 0) +
              (attendanceStatus.absent > 0 ? (isTinyCard ? 6 : 8) : 0) +
              (attendanceStatus.present > 0 && attendanceStatus.absent > 0 ? 2 : 0) + // margin between
              4 // base padding from right edge
            ) : 0;

            return (
              <View style={{
                flex: 1,
                position: 'relative',
              }}>
                {/* Text content area - positioned to avoid indicators */}
                <View style={{
                  flex: 1,
                  // Reserve space at bottom-right for smaller indicators
                  paddingBottom: hasAttendanceIndicators ? (isTinyCard ? 10 : 12) : 0,
                  // For very narrow cards, also add right padding
                  paddingRight: hasAttendanceIndicators && (isVeryTinyCard || cardWidth < 100) ?
                    Math.min(indicatorWidth, 16) : 0,
                  // Ensure minimum height for text visibility
                  minHeight: fontSizes.nameSize + 4,
                }}>
                <Text
                  style={[
                    styles.subjectName,
                    {
                      color: textColor,
                      fontSize: fontSizes.nameSize,
                      // Dynamic line height based on font size
                      lineHeight: fontSizes.nameSize + 2,
                      marginBottom: isVeryTinyCard ? 0 : isTinyCard ? 1 : 2,
                      fontWeight: '600',
                      // Ensure text is always visible, even in small spaces
                      minHeight: fontSizes.nameSize + 2, // Guarantee minimum space for text
                    },
                  ]}
                  numberOfLines={fontSizes.maxLines}
                  ellipsizeMode="tail"
                  >
                  {formattedName}
                </Text>

                {/* Google Calendar approach: Show classroom only when there's space and it's enabled */}
                {subject.classroom && fontSizes.showClassroom && !hasAttendanceIndicators && (
                  <Text
                    style={[
                      styles.subjectClassroom,
                      {
                        color: textColor,
                        fontSize: fontSizes.classroomSize,
                        opacity: 0.8,
                        marginBottom: 0,
                      },
                    ]}
                    numberOfLines={1}
                    ellipsizeMode="tail">
                    {subject.classroom}
                  </Text>
                )}

                {/* Show classroom for cards with indicators only if there's enough space */}
                {subject.classroom && fontSizes.showClassroom && hasAttendanceIndicators && cardHeight > 45 && (
                  <Text
                    style={[
                      styles.subjectClassroom,
                      {
                        color: textColor,
                        fontSize: fontSizes.classroomSize,
                        opacity: 0.8,
                        marginBottom: 16, // Extra margin to avoid indicators
                      },
                    ]}
                    numberOfLines={1}
                    ellipsizeMode="tail">
                    {subject.classroom}
                  </Text>
                )}
                </View>
              </View>
            );
          })()}
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

      {/* Zoom reset button - only show when zoom is not 1x */}
      {zoomScale !== 1 && (
        <TouchableOpacity
          style={styles.zoomResetButton}
          onPress={() => {
            setZoomScale(1);
            lastZoomScale.current = 1;
          }}
          activeOpacity={0.8}>
          <Image
            source={zoomScale > 1 ? zoomOutImage : zoomInImage}
            style={styles.zoomResetIcon}
          />
        </TouchableOpacity>
      )}

      <PinchGestureHandler
        ref={zoomGestureRef}
        onGestureEvent={onPinchGestureEvent}
        onHandlerStateChange={onPinchGestureStateChange}
        simultaneousHandlers={[]}
        enabled={true}
        shouldCancelWhenOutside={false}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContentContainer}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          scrollEnabled={!isZooming.current}>
          <View style={[styles.timeGrid, { height: 24 * baseHourHeight * zoomScale }]}>
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
                <View key={hour} style={[styles.timeSlot, { height: baseHourHeight * zoomScale }]}>
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
              <View key={hour} style={[styles.hourDivider, { height: baseHourHeight * zoomScale }]} />
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
      </PinchGestureHandler>

      {/* Simple Schedule Status Notification */}
      {notificationData && notificationData.visible && (
        <Animated.View
          style={[
            styles.scheduleNotificationContainer,
            {
              bottom: 130, // Position at bottom, above floating action button
              opacity: notificationOpacity,
            }
          ]}
        >
          <View style={[
            styles.scheduleNotification,
            notificationData.type === 'no-events' ? styles.noEventsNotification : styles.completedNotification
          ]}>
            <Text style={styles.scheduleNotificationIcon}>
              {notificationData.type === 'no-events' ? '📅' : '✅'}
            </Text>
            <Text style={styles.scheduleNotificationText}>
              {notificationData.message}
            </Text>
          </View>
        </Animated.View>
      )}

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

      {/* ...existing modals and components... */}
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
    // Height is now set dynamically based on zoom scale
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
    // Height is now set dynamically based on zoom scale
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
    // Height is now set dynamically based on zoom scale
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
  attendanceIndicatorContainer: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 10,
    // Ensure indicators don't take up layout space
    pointerEvents: 'none',
  },
  attendancePresent: {
    backgroundColor: '#22C55E', // Green for present
  },
  attendanceAbsent: {
    backgroundColor: '#EF4444', // Red for absent
  },
  attendanceCount: {
    fontSize: 6,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    textAlignVertical: 'center',
    lineHeight: 6,
    includeFontPadding: false,
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
  // Schedule notification styles
  scheduleNotificationContainer: {
    position: 'absolute',
    left: 20,
    right: 20,
    zIndex: 2000,
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  scheduleNotification: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 12,
    maxWidth: 220,
    marginHorizontal: 20, // Add horizontal margins for proper edge spacing
  },
  noEventsNotification: {
    backgroundColor: '#374151', // Neutral dark gray for no events
    borderWidth: 1,
    borderColor: '#6B7280',
  },
  completedNotification: {
    backgroundColor: '#047857', // Green background for all completed
    borderWidth: 1,
    borderColor: '#10B981',
  },
  scheduleNotificationIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  scheduleNotificationText: {
    color: '#F9FAFB',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    flex: 1,
  },
  // Zoom reset button styles (styled like scrollToNowButton)
  zoomResetButton: {
    position: 'absolute',
    top: 80, // Position at center top
    left: '50%',
    marginLeft: -21, // Half of width (42/2) to center it
    backgroundColor: '#6366f1',
    borderRadius: 25,
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
    zIndex: 1000,
    minWidth: 42,
    minHeight: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoomResetIcon: {
    width: 15,
    height: 15,
    tintColor: '#F0F0F0', // Make the icon off-white for visibility
  },
});

export default TimeTable;
