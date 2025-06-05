import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
} from 'react-native';
import {
  GestureHandlerRootView,
  PanGestureHandler,
} from 'react-native-gesture-handler';

const {width} = Dimensions.get('window');

const Calendar: React.FC = () => {
  const getDaysForDisplay = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    const prevMonthLastDay = new Date(year, month, 0).getDate();

    const days = [];

    // Add previous month's days
    for (let i = firstDayOfMonth.getDay() - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonthLastDay - i),
        currentMonth: false,
      });
    }

    // Add current month's days
    for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
      days.push({date: new Date(year, month, day), currentMonth: true});
    }

    // Add next month's days
    const nextMonthDaysCount = 42 - days.length; // Ensures a full 6x7 grid (42 cells)
    for (let i = 1; i <= nextMonthDaysCount; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        currentMonth: false,
      });
    }

    return days;
  };
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [days, setDays] = useState(getDaysForDisplay(currentMonth));
  const translateX = new Animated.Value(0);

  const handleGesture = Animated.event(
    [{nativeEvent: {translationX: translateX}}],
    {useNativeDriver: true},
  );

  const handleGestureEnd = ({nativeEvent}: any) => {
    const threshold = width / 3;

    if (nativeEvent.translationX > threshold) {
      changeMonth('prev');
    } else if (nativeEvent.translationX < -threshold) {
      changeMonth('next');
    } else {
      // Reset animation if swipe threshold not met
      Animated.spring(translateX, {
        toValue: 0,
        useNativeDriver: true,
      }).start();
    }
  };

  const changeMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + (direction === 'next' ? 1 : -1),
      1,
    );

    Animated.timing(translateX, {
      toValue: direction === 'next' ? -width : width,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setCurrentMonth(newMonth);
      setDays(getDaysForDisplay(newMonth));
      translateX.setValue(direction === 'next' ? width : -width);

      Animated.timing(translateX, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    });
  };

  const renderDay = (
    day: {date: Date; currentMonth: boolean},
    index: number,
  ) => {
    const isToday = () => {
      const today = new Date();
      return (
        day.date.getDate() === today.getDate() &&
        day.date.getMonth() === today.getMonth() &&
        day.date.getFullYear() === today.getFullYear()
      );
    };

    return (
      <View style={styles.dayCell} key={index}>
        <TouchableOpacity
          style={[styles.cellButton, isToday() && styles.todayCell]}>
          <Text
            style={[
              styles.dayText,
              !day.currentMonth && styles.otherMonthText,
            ]}>
            {day.date.getDate()}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <Text style={styles.header}>
        {currentMonth.toLocaleString('default', {month: 'long'})}{' '}
        {currentMonth.getFullYear()}
      </Text>

      <PanGestureHandler
        onGestureEvent={handleGesture}
        onEnded={handleGestureEnd}>
        <Animated.View
          style={{
            flexDirection: 'row',
            transform: [{translateX}],
          }}>
          <View style={styles.grid}>
            {days.map((day, index) => renderDay(day, index))}
          </View>
        </Animated.View>
      </PanGestureHandler>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 10,
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 10,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: width / 7,
    height: width / 7,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cellButton: {
    width: '80%',
    height: '80%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  dayText: {
    color: 'white',
  },
  otherMonthText: {
    color: '#888',
  },
  todayCell: {
    backgroundColor: '#007BFF',
    borderRadius: 10,
  },
});

export default Calendar;
