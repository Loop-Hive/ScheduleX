import React, {useState, useEffect} from 'react';
import {View, StyleSheet, Text, TouchableOpacity, FlatList} from 'react-native';
import useStore from '../store/store';
import {CardInterface} from '../types/cards';
import Header from '../components/Header';

interface SubjectsScreenProps {
  toggleSidebar: () => void;
  handleMenuOpen: (r: number, c: number) => void;
}

const SubjectsScreen: React.FC<SubjectsScreenProps> = ({
  navigation,
  toggleSidebar,
  handleMenuOpen,
}: any) => {
  const {registers, activeRegister} = useStore();
  const [subjects, setSubjects] = useState<CardInterface[]>([]);

  useEffect(() => {
    setSubjects(registers[activeRegister]?.cards || []);
  }, [activeRegister, registers]);

  const handleViewDetails = (r: number, c: number) => {
    navigation.navigate('CardDetails', {
      card_register: r,
      card_id: c,
    });
  };

  const getAttendancePercentage = (present: number, total: number) => {
    if (total === 0) {
      return 0;
    }
    return Math.round((present / total) * 100);
  };

  const getStatusColor = (percentage: number, target: number) => {
    if (percentage >= target) {
      return '#10B981';
    }
    if (percentage >= target - 10) {
      return '#F59E0B';
    }
    return '#EF4444';
  };

  const renderSubjectItem = ({item}: {item: CardInterface}) => {
    const percentage = getAttendancePercentage(item.present, item.total);
    const statusColor = getStatusColor(percentage, item.target_percentage);

    return (
      <TouchableOpacity
        style={styles.subjectCard}
        onPress={() => handleViewDetails(activeRegister, item.id)}
        onLongPress={() => handleMenuOpen(activeRegister, item.id)}>
        <View style={styles.subjectHeader}>
          <View style={[styles.colorTag, {backgroundColor: registers[activeRegister]?.color || item.tagColor}]} />
          <Text style={styles.subjectTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <TouchableOpacity
            onPress={() => handleMenuOpen(activeRegister, item.id)}
            style={styles.menuButton}>
            <Text style={styles.menuDots}>⋮</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Present</Text>
            <Text style={styles.statValue}>{item.present}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Total</Text>
            <Text style={styles.statValue}>{item.total}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Percentage</Text>
            <Text style={[styles.statValue, {color: statusColor}]}>
              {percentage}%
            </Text>
          </View>
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${percentage}%`,
                  backgroundColor: statusColor,
                },
              ]}
            />
          </View>
          <Text style={styles.targetText}>
            Target: {item.target_percentage}%
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Header
        toggler={toggleSidebar}
        changeStack={navigation.navigate}
        registerName={registers[activeRegister]?.name}
      />

      {subjects.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📚</Text>
          <Text style={styles.emptyTitle}>No Subjects Found</Text>
          <Text style={styles.emptyText}>
            Add subjects to track your attendance
          </Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate('Add')}>
            <Text style={styles.addButtonText}>Add Subject</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={subjects}
          renderItem={renderSubjectItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#18181B',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  subjectCard: {
    backgroundColor: '#27272A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#3F3F46',
  },
  subjectHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  colorTag: {
    width: 4,
    height: 20,
    borderRadius: 2,
    marginRight: 12,
  },
  subjectTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#F3F4F6',
  },
  menuButton: {
    padding: 4,
  },
  menuDots: {
    fontSize: 18,
    color: '#9CA3AF',
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F3F4F6',
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#3F3F46',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  targetText: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'right',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#F3F4F6',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 24,
  },
  addButton: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SubjectsScreen;
