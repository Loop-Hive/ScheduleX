import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  ScrollView,
  Text,
  TouchableOpacity,
} from 'react-native';
import useStore from '../../store/store';
import Header from '../../layout/Header';
import {CardInterface, Days, Slots} from '../../types/cards';
import {convertToUTM} from '../../utils/functions';

interface HomeScreenProps {
  toggleSidebar: () => void;
  handleMenuOpen: (r: number, c: number) => void;
}

interface EventInfo {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  roomName?: string;
  color: string;
  cardId: number;
  registerId: number;
  isRunning: boolean;
}

const HomeScreen: React.FC<HomeScreenProps> = ({
  navigation,
  toggleSidebar,
}: any) => {
  const {registers, activeRegister, updatedAt} = useStore();
  const [currentEvents, setCurrentEvents] = useState<EventInfo[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<EventInfo[]>([]);

  // Get current day key (mon, tue, etc.)
  const getCurrentDayKey = (): keyof Days => {
    const days: (keyof Days)[] = [
      'sun',
      'mon',
      'tue',
      'wed',
      'thu',
      'fri',
      'sat',
    ];
    return days[new Date().getDay()];
  };

  // Convert time string to minutes for comparison
  const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  // Get current time in minutes
  const getCurrentTimeInMinutes = (): number => {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
  };

  // Process events from current register
  useEffect(() => {
    if (!registers[activeRegister]?.cards) {
      setCurrentEvents([]);
      setUpcomingEvents([]);
      return;
    }

    const currentDay = getCurrentDayKey();
    const currentTimeMinutes = getCurrentTimeInMinutes();
    const allEvents: EventInfo[] = [];

    // Extract all events for today from current register
    registers[activeRegister].cards.forEach((card: CardInterface) => {
      const todaySlots = card.days[currentDay] || [];

      todaySlots.forEach((slot: Slots, index: number) => {
        const startMinutes = timeToMinutes(slot.start);
        const endMinutes = timeToMinutes(slot.end);

        allEvents.push({
          id: `${card.id}-${currentDay}-${index}`,
          title: card.title,
          startTime: slot.start,
          endTime: slot.end,
          roomName: slot.roomName || undefined,
          color: card.tagColor,
          cardId: card.id,
          registerId: activeRegister,
          isRunning:
            currentTimeMinutes >= startMinutes &&
            currentTimeMinutes <= endMinutes,
        });
      });
    });

    // Sort events by start time
    allEvents.sort(
      (a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime),
    );

    // Separate current and upcoming events
    const running = allEvents.filter(event => event.isRunning);
    const upcoming = allEvents
      .filter(
        event =>
          !event.isRunning &&
          timeToMinutes(event.startTime) > currentTimeMinutes,
      )
      .slice(0, 2); // Next 2 upcoming events

    setCurrentEvents(running);
    setUpcomingEvents(upcoming);
  }, [registers, activeRegister, updatedAt]);

  // Navigate to card details
  const handleEventPress = (event: EventInfo) => {
    navigation.navigate('CardDetails', {
      card_register: event.registerId,
      card_id: event.cardId,
    });
  };

  // Render event card
  const renderEventCard = (event: EventInfo, isRunning: boolean) => (
    <TouchableOpacity
      key={event.id}
      style={[
        styles.eventCard,
        isRunning ? styles.runningEventCard : styles.upcomingEventCard,
        {borderLeftColor: event.color},
      ]}
      onPress={() => handleEventPress(event)}>
      <View style={styles.eventHeader}>
        <Text
          style={[styles.eventTitle, isRunning && styles.runningEventTitle]}>
          {event.title}
        </Text>
        <View
          style={[
            styles.statusBadge,
            isRunning ? styles.runningBadge : styles.upcomingBadge,
          ]}>
          <Text style={styles.statusText}>
            {isRunning ? 'LIVE' : 'UPCOMING'}
          </Text>
        </View>
      </View>

      <View style={styles.eventDetails}>
        <Text style={styles.eventTime}>
          {convertToUTM(event.startTime)} - {convertToUTM(event.endTime)}
        </Text>
        {event.roomName && (
          <Text style={styles.eventRoom}>📍 {event.roomName}</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.homeView}>
      <Header
        toggler={toggleSidebar}
        changeStack={navigation.navigate}
        registerName={registers[activeRegister]?.name}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}>
        {/* Currently Running Events */}
        {currentEvents.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🔴 Currently Running</Text>
            {currentEvents.map(event => renderEventCard(event, true))}
          </View>
        )}

        {/* Upcoming Events */}
        {upcomingEvents.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>⏰ Next Up</Text>
            {upcomingEvents.map(event => renderEventCard(event, false))}
          </View>
        )}

        {/* Empty State */}
        {currentEvents.length === 0 && upcomingEvents.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No events scheduled for today</Text>
            <Text style={styles.emptySubtext}>
              Add subjects to{' '}
              {registers[activeRegister]?.name || 'your register'} to see your
              schedule
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  homeView: {
    flex: 1,
    backgroundColor: '#18181B',
  },
  scrollView: {
    flex: 1,
    marginBottom: 77,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  eventCard: {
    backgroundColor: '#2A2A2E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  runningEventCard: {
    backgroundColor: '#2D1B2E',
    borderLeftColor: '#FF6B6B',
  },
  upcomingEventCard: {
    backgroundColor: '#1E2A37',
    borderLeftColor: '#4ECDC4',
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  eventTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 12,
  },
  runningEventTitle: {
    color: '#FF6B6B',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 80,
    alignItems: 'center',
  },
  runningBadge: {
    backgroundColor: '#FF6B6B20',
  },
  upcomingBadge: {
    backgroundColor: '#4ECDC420',
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  eventDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  eventTime: {
    color: '#B0B0B0',
    fontSize: 14,
    fontWeight: '500',
  },
  eventRoom: {
    color: '#B0B0B0',
    fontSize: 14,
    fontStyle: 'italic',
  },
  emptyContainer: {
    flex: 1,
    height: Dimensions.get('window').height - 300,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    color: '#B0B0B0',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default HomeScreen;
