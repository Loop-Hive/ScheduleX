import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
} from 'react-native';

interface Slots {
  start: string;
  end: string;
  // room string or null
  roomName: string | null;
}

interface Days {
  mon: Slots[];
  tue: Slots[];
  wed: Slots[];
  thu: Slots[];
  fri: Slots[];
  sat: Slots[];
  sun: Slots[];
}

interface CardProps {
  id: number;
  title: string;
  target_percentage: number;
  tagColor: string;
  delay: number;
  days: Days;
}
const AiCard: React.FC<CardProps> = ({
  // id,
  title,
  target_percentage,
  tagColor,
  // delay,
  days,
}) => {
  return (
    <View style={styles.cardWrapper}>
      {/* Left colored bar */}
      <View style={styles.card}>
        <View style={[styles.bar, {backgroundColor: tagColor}]} />
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>{title}</Text>
            <View style={styles.targetRow}>
              <Text style={styles.targetIcon}>🎯</Text>
              <Text style={styles.targetText}>
                Target: {target_percentage}%
              </Text>
            </View>
          </View>
          <View style={styles.actionsRow}>
            <TouchableOpacity style={[styles.actionButton, styles.addButton]}>
              <Text style={[styles.actionText]}>Add</Text>
              <Image
                source={require('../../assets/icons/plus.png')}
                style={styles.iconsStyle}
              />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionButton, styles.closeButton]}>
              <Text style={styles.actionText}>Clear</Text>
              <Image
                source={require('../../assets/icons/bin.png')}
                style={styles.iconsStyle}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
      {/* Schedule entries */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.entriesRow}>
          {Object.entries(days).map(([day, slots]) =>
            slots.map((slot: Slots, index: number) => (
              <View key={`${day}-${index}`} style={styles.entryCard}>
                <Text style={styles.dayText}>
                  {day.charAt(0).toUpperCase() + day.slice(1).toLowerCase()}
                  {slot.roomName && `, ${slot.roomName}`}
                </Text>
                <Text style={styles.timeText}>
                  {slot.start}–{slot.end}
                </Text>
              </View>
            )),
          )}
        </View>
      </ScrollView>

      {/* Header row */}
    </View>
  );
};

const styles = StyleSheet.create({
  cardWrapper: {
    flexDirection: 'column',
    width: '95%',
    maxWidth: 500,
    marginHorizontal: 'auto',
    backgroundColor: '#1e1e1e',
    borderRadius: 12,
    padding: 16,
    paddingVertical: 24,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    position: 'relative',
  },
  card: {
    flexDirection: 'row',
    width: '100%',
  },
  bar: {
    width: 6,
    borderRadius: 3,
    minHeight: 10,
    marginRight: 12,
  },
  headerRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  title: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  targetRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  targetIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  targetText: {
    color: '#aaa',
    fontSize: 14,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 6,
    // backgroundColor: '#2e2e2e',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginLeft: 8,
  },
  iconsStyle: {
    width: 12,
    height: 12,
    objectFit: 'contain',
  },
  addButton: {
    backgroundColor: '#166534',
  },
  actionText: {
    color: '#fff',
    fontSize: 12,
  },
  addText: {
    fontWeight: '600',
  },
  closeButton: {
    backgroundColor: '#C20000',
  },
  closeIcon: {
    fontSize: 12,
    color: '#fff',
  },
  entriesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 16,
  },
  entryCard: {
    backgroundColor: '#2e2e2e',
    borderRadius: 10,
    padding: 10,
    marginRight: 12,
  },
  dayText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 4,
  },
  timeText: {
    color: '#aaa',
    fontSize: 11,
  },
});

export default AiCard;
