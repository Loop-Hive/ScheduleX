import {useEffect, useState} from 'react';
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';
import useStore from '../store/store';
import {CardInterface, SelectedDayCard, Days} from '../types/cards';
import Card from '../components/Cards/Card';
import Spacer from '../components/Spacer';
import {convertToStartSeconds, convertToUTM} from '../utils/functions';
interface TimeProps {
  handleMenuOpen: (r: number, c: number) => void;
}
const daysOfWeek = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

const daysKeyMap: Record<DayOfWeek, keyof Days> = {
  Sunday: 'sun',
  Monday: 'mon',
  Tuesday: 'tue',
  Wednesday: 'wed',
  Thursday: 'thu',
  Friday: 'fri',
  Saturday: 'sat',
};

type DayOfWeek = (typeof daysOfWeek)[number];

const monthsOfYear = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];
interface TabButtonProps {
  selectedDay: string;
  setSelectedDay: (day: string) => void;
  activeDay: string;
}

const TabButtons: React.FC<TabButtonProps> = ({
  selectedDay,
  setSelectedDay,
  activeDay,
}) => {
  const [activeDayIndex, setActiveDayIndex] = useState(0);
  const [newDays, setNewDays] = useState(daysOfWeek);

  useEffect(() => {
    setActiveDayIndex(daysOfWeek.indexOf(activeDay));
  }, [activeDay]);
  useEffect(() => {
    const newDaysTemp = [];
    for (let i = activeDayIndex; i < daysOfWeek.length; i++) {
      newDaysTemp.push(daysOfWeek[i]);
    }
    for (let i = 0; i < activeDayIndex; i++) {
      newDaysTemp.push(daysOfWeek[i]);
    }
    setNewDays(newDaysTemp);
  }, [activeDayIndex]);

  return (
    <ScrollView
      horizontal
      contentContainerStyle={styles.tabContainer}
      showsHorizontalScrollIndicator={false}
      style={styles.scrollView}>
      {newDays.map(day => (
        <TouchableOpacity
          key={day}
          style={[
            styles.tabButton,
            selectedDay === day && styles.selectedTabButton,
            activeDay === day && styles.activeTabButton,
            day === 'Sunday' && styles.tabButtonSunday,
          ]}
          onPress={() => setSelectedDay(day)}>
          <Text
            style={[
              styles.tabButtonText,
              selectedDay === day && styles.selectedTabButtonText,
              day === 'Sunday' && styles.tabButtonSundayTxt,
            ]}>
            {day}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const TimeTableScreen: React.FC<TimeProps> = ({
  navigation,
  // route,
  handleMenuOpen,
}: any) => {
  const {registers, activeRegister} = useStore();
  const [displayCards, setDisplayCards] = useState<SelectedDayCard[]>([]);
  const formatDate = (date: Date) => {
    return daysOfWeek[date.getDay()];
  };
  const getNextDate = (day: string) => {
    const today = new Date(); // Get the current date
    const newDate = new Date(today); // Create a new Date object to avoid modifying the original
    const dayIndex = daysOfWeek.indexOf(day);
    newDate.setDate(today.getDate() + ((dayIndex - today.getDay() + 7) % 7));
    return newDate;
  };
  const formatTime = (date: string) => {
    // HH:MM-HH:MM ... break by '-'
    const [start, end] = date.split('-');
    const startUTM = convertToUTM(start);
    const endUTM = convertToUTM(end);
    return `${startUTM} - ${endUTM}`;
  };

  const [selectedDay, setSelectedDay] = useState(formatDate(new Date()));
  const activeDay = formatDate(new Date());
  const [completedClasses, setCompletedClasses] = useState<SelectedDayCard[]>(
    [],
  );
  const [upcomingClasses, setUpcomingClasses] = useState<SelectedDayCard[]>([]);
  const [ongoingClasses, setOngoingClasses] = useState<SelectedDayCard[]>([]);

  useEffect(() => {
    const selectedDayCards: SelectedDayCard[] = [];
    const key = daysKeyMap[selectedDay as DayOfWeek];
    const currKey = daysKeyMap[activeDay as DayOfWeek];
    const timeSlots: Record<string, CardInterface[]> = {};
    const setCurrentClasses = () => {
      const today = new Date();
      // current time in seconds
      const currentTime = today.getHours() * 3600 + today.getMinutes() * 60;
      const onGoingClasses: SelectedDayCard[] = [];
      const upComing: SelectedDayCard[] = [];
      const completeClasses: SelectedDayCard[] = [];
      const onGoingTimeSlot: Record<string, CardInterface[]> = {};
      const upcomingTimeSlot: Record<string, CardInterface[]> = {};
      const completedTimeSlot: Record<string, CardInterface[]> = {};

      registers[activeRegister]?.cards?.forEach(card => {
        card?.days[currKey]?.forEach(dayTime => {
          const timeSlot = `${dayTime.start}-${dayTime.end}`;
          if (
            currentTime >= convertToStartSeconds(dayTime.start) &&
            currentTime <= convertToStartSeconds(dayTime.end)
          ) {
            if (!onGoingTimeSlot[timeSlot]) {
              onGoingTimeSlot[timeSlot] = [];
            }
            onGoingTimeSlot[timeSlot].push(card);
          } else if (currentTime < convertToStartSeconds(dayTime.start)) {
            if (!upcomingTimeSlot[timeSlot]) {
              upcomingTimeSlot[timeSlot] = [];
            }
            upcomingTimeSlot[timeSlot].push(card);
          } else {
            if (!completedTimeSlot[timeSlot]) {
              completedTimeSlot[timeSlot] = [];
            }
            completedTimeSlot[timeSlot].push(card);
          }
        });
      });

      Object.keys(onGoingTimeSlot)
        .sort((a, b) => {
          const startSecondsa = convertToStartSeconds(a.split('-')[0]);
          const startSecondsb = convertToStartSeconds(b.split('-')[0]);
          return startSecondsa - startSecondsb;
        })
        .forEach(timeSlot => {
          onGoingClasses.push({
            time: timeSlot,
            card: onGoingTimeSlot[timeSlot],
          });
        });

      Object.keys(upcomingTimeSlot)
        .sort((a, b) => {
          const startSecondsa = convertToStartSeconds(a.split('-')[0]);
          const startSecondsb = convertToStartSeconds(b.split('-')[0]);
          return startSecondsa - startSecondsb;
        })
        .forEach(timeSlot => {
          upComing.push({
            time: timeSlot,
            card: upcomingTimeSlot[timeSlot],
          });
        });

      Object.keys(completedTimeSlot)
        .sort((a, b) => {
          const startSecondsa = convertToStartSeconds(a.split('-')[0]);
          const startSecondsb = convertToStartSeconds(b.split('-')[0]);
          return startSecondsa - startSecondsb;
        })
        .forEach(timeSlot => {
          completeClasses.push({
            time: timeSlot,
            card: completedTimeSlot[timeSlot],
          });
        });
      setOngoingClasses(onGoingClasses);
      setUpcomingClasses(upComing);
      setCompletedClasses(completeClasses);
    };

    registers[activeRegister]?.cards?.forEach(card => {
      card?.days[key]?.forEach(dayTime => {
        const timeSlot = `${dayTime.start}-${dayTime.end}`;
        if (!timeSlots[timeSlot]) {
          timeSlots[timeSlot] = [];
        }
        timeSlots[timeSlot].push(card);
      });
    });

    Object.keys(timeSlots)
      .sort((a, b) => {
        const startSecondsa = convertToStartSeconds(a.split('-')[0]);
        const startSecondsb = convertToStartSeconds(b.split('-')[0]);
        return startSecondsa - startSecondsb;
      })
      .forEach(timeSlot => {
        selectedDayCards.push({
          time: timeSlot,
          card: timeSlots[timeSlot],
        });
      });
    setDisplayCards(selectedDayCards);
    setCurrentClasses();
  }, [activeRegister, selectedDay, activeDay, registers]);
  const handleViewDetails = (r: number, c: number) => {
    navigation.navigate('CardDetails', {
      card_register: r,
      card_id: c,
    });
  };
  return (
    <View style={styles.container}>
      <View style={styles.contentContainer2}>
        <View style={styles.timeTableBox}>
          <Image
            source={require('../assets/icons/navigation/time-table.png')}
            style={styles.timeTableIcon}
          />

          <Text style={styles.timeTableText}>Time Table</Text>
        </View>
        <Text style={styles.selectedDayText}>
          {selectedDay === activeDay ? 'Today' : selectedDay.substring(0, 3)}
          {', ' +
            getNextDate(selectedDay).getDate() +
            ' ' +
            monthsOfYear[getNextDate(selectedDay).getMonth()].substring(0, 3)}
        </Text>
      </View>
      <TabButtons
        selectedDay={selectedDay}
        setSelectedDay={setSelectedDay}
        activeDay={activeDay}
      />
      {displayCards.length === 0 && (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            No Events {selectedDay === activeDay ? 'Today' : 'on this Day'}
          </Text>
        </View>
      )}
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={styles.scrollView2}
        contentContainerStyle={styles.contentContainer}>
        {selectedDay !== activeDay &&
          displayCards.length > 0 &&
          selectedDay !== activeDay && (
            <Text style={styles.eventTypeTxt}>Upcoming Classes</Text>
          )}

        {selectedDay !== activeDay ? (
          displayCards.map((cardSlot, index) => {
            return (
              <View key={index} style={styles.cardWrapperWfull}>
                <Text style={styles.cardSlotTime}>
                  {formatTime(cardSlot.time)}
                </Text>
                {cardSlot.card.map(card => (
                  <View key={card.id} style={styles.cardMarginCover}>
                    <Card
                      id={card.id}
                      title={card.title}
                      present={card.present}
                      total={card.total}
                      target_percentage={card.target_percentage}
                      tagColor={card.tagColor}
                      cardRegister={activeRegister}
                      handleMenuOpen={handleMenuOpen}
                      hasLimit={card.hasLimit}
                      limitFreq={card.limit}
                      limitType={card.limitType}
                      handleViewDetails={handleViewDetails}
                      delay={0}
                    />
                  </View>
                ))}
              </View>
            );
          })
        ) : (
          <View style={styles.cardWrapperWfull}>
            {ongoingClasses.length > 0 && (
              <View style={styles.cardWrapperWfull}>
                <Text style={styles.eventTypeTxt}>Ongoing Classes</Text>
                {ongoingClasses.map((cardSlot, index) => {
                  return (
                    <View key={index} style={styles.cardWrapperWfull}>
                      <Text style={styles.cardSlotTime}>
                        {formatTime(cardSlot.time)}
                      </Text>
                      {cardSlot.card.map(card => (
                        <View key={card.id} style={styles.cardMarginCover}>
                          <Card
                            id={card.id}
                            title={card.title}
                            present={card.present}
                            total={card.total}
                            target_percentage={card.target_percentage}
                            tagColor={card.tagColor}
                            cardRegister={activeRegister}
                            handleMenuOpen={handleMenuOpen}
                            hasLimit={card.hasLimit}
                            limitFreq={card.limit}
                            limitType={card.limitType}
                            handleViewDetails={handleViewDetails}
                            delay={0}
                          />
                        </View>
                      ))}
                    </View>
                  );
                })}
              </View>
            )}
            {upcomingClasses.length > 0 && (
              <View style={styles.cardWrapperWfull}>
                <Text style={styles.eventTypeTxt}>Upcoming Classes</Text>
                {upcomingClasses.map((cardSlot, index) => {
                  return (
                    <View key={index} style={styles.cardWrapperWfull}>
                      <Text style={styles.cardSlotTime}>
                        {formatTime(cardSlot.time)}
                      </Text>
                      {cardSlot.card.map(card => (
                        <View key={card.id} style={styles.cardMarginCover}>
                          <Card
                            id={card.id}
                            title={card.title}
                            present={card.present}
                            total={card.total}
                            target_percentage={card.target_percentage}
                            tagColor={card.tagColor}
                            cardRegister={activeRegister}
                            handleMenuOpen={handleMenuOpen}
                            hasLimit={card.hasLimit}
                            limitFreq={card.limit}
                            limitType={card.limitType}
                            handleViewDetails={handleViewDetails}
                            delay={0}
                          />
                        </View>
                      ))}
                    </View>
                  );
                })}
              </View>
            )}
            {completedClasses.length > 0 && (
              <View style={styles.cardWrapperWfull}>
                <Text style={styles.eventTypeTxt}>Done For Today</Text>
                {completedClasses.map((cardSlot, index) => {
                  return (
                    <View key={index} style={styles.cardWrapperWfull}>
                      <Text style={styles.cardSlotTime}>
                        {formatTime(cardSlot.time)}
                      </Text>
                      {cardSlot.card.map(card => (
                        <View key={card.id} style={styles.cardMarginCover}>
                          <Card
                            id={card.id}
                            title={card.title}
                            present={card.present}
                            total={card.total}
                            target_percentage={card.target_percentage}
                            tagColor={card.tagColor}
                            cardRegister={activeRegister}
                            handleMenuOpen={handleMenuOpen}
                            hasLimit={card.hasLimit}
                            limitFreq={card.limit}
                            limitType={card.limitType}
                            handleViewDetails={handleViewDetails}
                            delay={0}
                          />
                        </View>
                      ))}
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        )}
      </ScrollView>
      <Spacer />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,

    backgroundColor: '#18181B',
    height: '100%',
  },
  scrollView: {
    flex: 0,
    flexGrow: 0,
  },
  scrollView2: {
    flex: 1,
  },
  cardWrapperWfull: {width: '100%'},
  timeTableIcon: {width: 25, height: 25},
  emptyContainer: {
    color: '#fff',
    height: Dimensions.get('window').height - 400,
    gap: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabButtonSunday: {borderColor: '#6C6C6C', borderWidth: 1},
  tabButtonSundayTxt: {
    color: '#6C6C6C',
  },
  emptyText: {
    color: '#5A5A5A',
    fontSize: 20,
  },

  tabContainer: {
    paddingVertical: 25,
    paddingHorizontal: 20,
  },
  tabButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginHorizontal: 5,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: '#3D3D3D',
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    flexWrap: 'wrap',
    paddingTop: 20,
  },
  eventTypeTxt: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  cardMarginCover: {
    marginBottom: 20,
    width: '100%',
    alignItems: 'center',
  },
  selectedTabButton: {
    backgroundColor: '#ffffff',
    borderWidth: 0,
  },
  activeTabButton: {
    borderColor: '#018CC8',
    borderWidth: 1,
  },

  tabButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  selectedTabButtonText: {
    color: '#18181B',
  },
  contentContainer2: {
    marginTop: 20,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    alignContent: 'center',
  },
  timeTableBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  selectedDayText: {
    color: '#A0A0A0',
    fontSize: 18,
    fontWeight: 'bold',
  },
  timeTableText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  cardSlotTime: {
    color: '#A0A0A0',
    width: '90%',
    margin: 'auto',
    marginBottom: 10,
    fontSize: 14,
    textAlign: 'left',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
});

export default TimeTableScreen;
