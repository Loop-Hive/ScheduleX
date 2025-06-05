import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform,
  ToastAndroid,
  Image,
} from 'react-native';
import useStore from '../store/store';
import {CardInterface} from '../types/cards';
import Calendar from '../components/Calendar';
import {convertToUTM, formatToHHMM} from '../utils/functions';
import {TextInput} from 'react-native-gesture-handler';

const ViewCardDetails: React.FC = ({navigation, route}: any) => {
  const {card_register, card_id} = route.params;
  const {registers, removeMarking, markAbsentWithDate, markPresentWithDate} =
    useStore();
  const getCurrentTime = () => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [inputTime, setInputTime] = useState(getCurrentTime());
  const handleTimeChange = (value: string) => {
    setInputTime(value);
  };
  const isValidTime = (time: string) => {
    // check format HH:MM and not alphabets
    if (!/^\d{2}:\d{2}$/.test(time)) {
      return false;
    }

    // check if hours and minutes are in valid range
    const [hours, minutes] = time.split(':').map(Number);
    if (hours < 0 || hours > 23) {
      return false;
    }
    if (minutes < 0 || minutes > 59) {
      return false;
    }
    return true;
  };

  const handleMarkAbsent = () => {
    // check for inputTime
    if (!isValidTime(inputTime)) {
      if (Platform.OS === 'android') {
        ToastAndroid.show('Invalid Time', ToastAndroid.SHORT);
      }
      return;
    }
    //create new date using time from inputTime and date from selectedDate
    const newDate = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate(),
      Number(inputTime.split(':')[0]),
      Number(inputTime.split(':')[1]),
    );
    markAbsentWithDate(newDate, card_id, card_register);

    if (Platform.OS === 'android') {
      ToastAndroid.show('Marked Absent', ToastAndroid.SHORT);
    }
  };

  const handleMarkPresent = () => {
    // check for inputTime
    if (!isValidTime(inputTime)) {
      if (Platform.OS === 'android') {
        ToastAndroid.show('Invalid Time', ToastAndroid.SHORT);
      }
      return;
    }
    //create new date using time from inputTime and date from selectedDate
    const newDate = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate(),
      Number(inputTime.split(':')[0]),
      Number(inputTime.split(':')[1]),
    );
    markPresentWithDate(newDate, card_id, card_register);
    if (Platform.OS === 'android') {
      ToastAndroid.show('Marked Present', ToastAndroid.SHORT);
    }
  };

  const [currentMonth, setCurrentMonth] = useState(selectedDate);
  const handleRemoveMark = (
    markId: number,
    cardId: number,
    registerId: number,
  ) => {
    removeMarking(registerId, cardId, markId);
    if (Platform.OS === 'android') {
      ToastAndroid.show('Mark Removed', ToastAndroid.SHORT);
    }
  };
  const handleTodayClick = () => {
    setCurrentMonth(new Date());
  };
  const handleNavigateBack = () => {
    navigation.goBack();
  };

  const [card, setCard] = useState<CardInterface>({
    id: 1,
    title: '',
    present: 0,
    total: 0,
    target_percentage: 0,
    tagColor: '',
    days: {
      mon: [],
      tue: [],
      wed: [],
      thu: [],
      fri: [],
      sat: [],
      sun: [],
    },
    markedAt: [],
    hasLimit: false,
    limit: 0,
    limitType: 'with-absent',
  });
  useEffect(() => {
    const currCard = registers[card_register]?.cards?.find(
      curr => curr.id === card_id,
    );
    if (currCard) {
      setCard(currCard);
    }
  }, [registers, card_register, card_id]);

  return (
    <View style={styles.container}>
      {/* // header  */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleNavigateBack}>
          <Image
            source={require('../assets/images/back-btn.png')}
            style={styles.backBtnIcon}
          />
        </TouchableOpacity>
        <Text style={styles.cardTitleTxt}>
          {card.title.length > 15
            ? card.title.substring(0, 15) + '..'
            : card.title}
        </Text>
        <TouchableOpacity
          onPress={handleTodayClick}
          style={styles.todayContainer}>
          <Image
            source={require('../assets/images/today.png')}
            style={styles.todayIcon}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.cardWrapper}>
        <View style={styles.timeWrapper}>
          <Text style={styles.timeTxt}>Time:</Text>
          <TextInput
            style={styles.ampm}
            value={inputTime}
            onChangeText={value => handleTimeChange(value)}
          />
        </View>
        <TouchableOpacity
          style={styles.addTimeBtnPresent}
          onPress={() => handleMarkPresent()}>
          <Text style={styles.changeMarkingsTxt}>Add Present</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.addTimeBtn}
          onPress={() => handleMarkAbsent()}>
          <Text style={styles.changeMarkingsTxt}>Add Absent</Text>
        </TouchableOpacity>
      </View>
      <Calendar
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        markedArr={card.markedAt}
        currentMonth={currentMonth}
        setCurrentMonth={setCurrentMonth}
      />
      {card.markedAt.filter(
        date =>
          new Date(date.date).toLocaleDateString() ===
          new Date(selectedDate).toLocaleDateString(),
      ).length === 0 && (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {new Date(selectedDate).toLocaleDateString() ===
            new Date().toLocaleDateString()
              ? 'No Activity Today'
              : 'No Activity on selected day'}
          </Text>
        </View>
      )}
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}>
        {card.markedAt
          .filter(
            date =>
              new Date(date.date).toLocaleDateString() ===
              new Date(selectedDate).toLocaleDateString(),
          )
          .map((date, index) => (
            <View key={index} style={styles.markContainer}>
              {date.isPresent ? (
                <Text key={index} style={[styles.markings, styles.presentBg]}>
                  Present
                </Text>
              ) : (
                <Text key={index} style={[styles.markings, styles.absentBg]}>
                  Absent
                </Text>
              )}

              <Text style={styles.dateTxt}>
                {new Date(date.date).toDateString()}{' '}
                {convertToUTM(formatToHHMM(date.date))}
              </Text>
              <TouchableOpacity
                onPress={() =>
                  handleRemoveMark(date.id, card_id, card_register)
                }>
                <Text style={styles.removeMarker}>
                  {Dimensions.get('window').width < 340 ? 'x' : 'remove'}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#18181B',
  },
  dateTxt: {color: '#fff'},
  changeMarkingsTxt: {
    color: '#fff',
    textAlign: 'center',
  },
  presentBg: {backgroundColor: '#00670E'},
  absentBg: {backgroundColor: '#750000'},
  cardWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  timeTxt: {color: '#fff', fontSize: 18},
  timeWrapper: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  header: {
    borderRadius: 15,
    width: '90%',
    margin: 'auto',
    paddingTop: 20,
    paddingBottom: 35,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  todayContainer: {
    marginLeft: 'auto',
  },
  todayIcon: {
    width: 35,
    height: 35,
  },

  scrollView: {
    flex: 1,
  },
  cardTitleTxt: {color: '#fff', fontSize: 24},
  contentContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 20,
    padding: 20,
  },
  markContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  emptyContainer: {
    color: '#fff',
    marginTop: 100,
    gap: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#5A5A5A',
    fontSize: 18,
  },
  markings: {
    color: '#fff',
    padding: 5,
    textAlign: 'center',
    width: 70,
    borderRadius: 8,
    marginBottom: 8,
  },
  removeMarker: {
    color: '#fff',
    padding: 5,
    paddingHorizontal: 10,
    borderRadius: 50,
    marginBottom: 8,
    backgroundColor: '#750000',
  },
  ampm: {
    backgroundColor: '#1F1F22',
    color: '#fff',
    padding: 10,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#464646',
  },
  addTimeBtn: {
    backgroundColor: '#CE0000',
    borderRadius: 8,
    padding: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addTimeBtnPresent: {
    backgroundColor: '#00670E',
    borderRadius: 8,
    padding: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnIcon: {width: 40, height: 40},
});

export default ViewCardDetails;
