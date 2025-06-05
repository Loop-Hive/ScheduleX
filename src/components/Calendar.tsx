import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Dimensions,
  Image,
  // PanResponder,
} from 'react-native';
import {Markings} from '../types/cards';
import GestureRecognizer from 'react-native-swipe-gestures';

interface CalendarProps {
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  markedArr: Markings[];
  currentMonth: Date;
  setCurrentMonth: (date: Date) => void;
}

const Calendar: React.FC<CalendarProps> = ({
  selectedDate,
  setSelectedDate,
  markedArr,
  currentMonth,
  setCurrentMonth,
}) => {
  const daysOfWeek = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    const days = [];
    for (let i = 0; i < firstDayOfMonth.getDay(); i++) {
      days.push(null); // Empty slots for days of the previous month
    }
    for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
      days.push(new Date(year, month, day));
    }
    return days;
  };

  const handleMonthChange = (direction: 'prev' | 'next') => {
    const newMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + (direction === 'next' ? 1 : -1),
      1,
    );
    setCurrentMonth(newMonth);
  };

  const isToday = (date: Date | null) => {
    if (!date) {
      return false;
    }
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };
  const isColored = (item: Date | null) => {
    if (!item) {
      return false;
    }
    if (isToday(item)) {
      return true;
    }
    const day = item.getDate();
    const month = item.getMonth();
    const year = item.getFullYear();
    const marks = markedArr.filter(
      date =>
        new Date(date.date).toLocaleDateString() ===
        new Date(year, month, day).toLocaleDateString(),
    );
    if (marks.length === 0) {
      return false;
    }
    return true;
  };
  const isSunday = (date: Date | null) => {
    if (!date) {
      return false;
    }
    return date.getDay() === 0;
  };

  const isSelected = (date: Date | null) => {
    if (!date) {
      return false;
    }
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };
  const findColor = (item: Date | null) => {
    if (item == null) {
      return '#121212';
    }
    const day = item.getDate();
    const month = item.getMonth();
    const year = item.getFullYear();
    const marks = markedArr.filter(
      date =>
        new Date(date.date).toLocaleDateString() ===
        new Date(year, month, day).toLocaleDateString(),
    );
    if (marks.length === 0) {
      return '#121212';
    }
    const presents = marks.filter(date => date.isPresent).length;
    const absents = marks.length - presents;
    if (presents > absents) {
      return 'green';
    }
    if (absents > presents) {
      return 'red';
    }
    if (presents === absents) {
      return '#BE5200';
    }
  };
  // const [days, setDays] = useState(getDaysInMonth(currentMonth));

  // useEffect(() => {
  //   setDays(getDaysInMonth(currentMonth));
  // }, [currentMonth]);
  const days = getDaysInMonth(currentMonth);
  const config = {
    velocityThreshold: 0.3,
    directionalOffsetThreshold: 80,
  };

  return (
    <GestureRecognizer
      onSwipeLeft={() => handleMonthChange('next')}
      onSwipeRight={() => handleMonthChange('prev')}
      config={config}
      style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => handleMonthChange('prev')}>
          <Image
            source={require('../assets/icons/left-arrow.png')}
            style={styles.arrowButtons}
          />
        </TouchableOpacity>
        <Text style={styles.headerText}>
          {currentMonth.toLocaleString('default', {month: 'long'})}{' '}
          {currentMonth.getFullYear()}
        </Text>
        <TouchableOpacity onPress={() => handleMonthChange('next')}>
          <Image
            source={require('../assets/icons/right-arrow.png')}
            style={styles.arrowButtons}
          />
        </TouchableOpacity>
      </View>

      {/* Week Days */}
      <View style={styles.weekRow}>
        {daysOfWeek.map(day =>
          day === 'sun' ? (
            <Text key={day} style={styles.sunDay}>
              {day}
            </Text>
          ) : (
            <Text key={day} style={styles.weekDay}>
              {day}
            </Text>
          ),
        )}
      </View>

      {/* Days Grid */}
      <FlatList
        data={days}
        numColumns={7}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({item}) => {
          const bgColorToday = isToday(item) ? 'blue' : findColor(item);
          const dayTextColor =
            isSunday(item) && !isColored(item) ? 'red' : 'white';
          return (
            <View style={styles.dayCell}>
              <TouchableOpacity
                style={[
                  styles.cellButton,
                  isSelected(item) && styles.selectedCell,
                  {backgroundColor: bgColorToday},
                ]}
                onPress={() => item && setSelectedDate(item)}>
                <Text style={[styles.dayText, {color: dayTextColor}]}>
                  {item ? item.getDate() : ''}
                </Text>
              </TouchableOpacity>
            </View>
          );
        }}
      />
    </GestureRecognizer>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    backgroundColor: '#121212',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#3A3A3A',
    width: Dimensions.get('window').width - 20,
    margin: 'auto',
    alignItems: 'center',
    marginBottom: 20,
  },
  arrowButtons: {width: 20, height: 20},
  header: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#3A3A3A',
  },
  headerText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  navButton: {
    color: 'white',
    fontSize: 18,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 15,
    marginBottom: 5,
  },
  sunDay: {
    color: 'red',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    width: Dimensions.get('window').width / 8,
    textAlign: 'center',
  },
  weekDay: {
    color: 'white',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    width: Dimensions.get('window').width / 8,
    textAlign: 'center',
  },
  dayCell: {
    width: Dimensions.get('window').width / 8,
    height: Dimensions.get('window').width / 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cellButton: {
    width: '75%',
    height: '75%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  dayText: {
    color: 'white',
    fontSize: 16,
  },
  selectedCell: {
    borderWidth: 2,
    borderColor: '#fff',
  },
});

export default Calendar;
