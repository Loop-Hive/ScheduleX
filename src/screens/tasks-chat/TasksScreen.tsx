import React, {useState} from 'react';
import {View, StyleSheet, Text, TouchableOpacity, FlatList} from 'react-native';
import Header from '../../components/layout/Header';

interface Task {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
  dueDate: string;
  category: string;
}

interface TasksScreenProps {
  toggleSidebar: () => void;
}

const TasksScreen: React.FC<TasksScreenProps> = ({
  navigation,
  toggleSidebar,
}: any) => {
  // Demo tasks data
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: 1,
      title: 'Complete Math Assignment',
      description: 'Solve problems 1-20 from Chapter 5',
      completed: false,
      priority: 'high',
      dueDate: '2025-06-20',
      category: 'Assignment',
    },
    {
      id: 2,
      title: 'Study for Physics Quiz',
      description: 'Review chapters 8-10 on thermodynamics',
      completed: true,
      priority: 'medium',
      dueDate: '2025-06-19',
      category: 'Study',
    },
    {
      id: 3,
      title: 'Prepare Chemistry Lab Report',
      description: 'Write report on acid-base reactions experiment',
      completed: false,
      priority: 'high',
      dueDate: '2025-06-21',
      category: 'Lab Report',
    },
    {
      id: 4,
      title: 'Read History Chapter',
      description: 'Chapter 12: World War II',
      completed: false,
      priority: 'low',
      dueDate: '2025-06-25',
      category: 'Reading',
    },
  ]);

  const toggleTaskCompletion = (taskId: number) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId ? {...task, completed: !task.completed} : task,
      ),
    );
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return '#EF4444';
      case 'medium':
        return '#F59E0B';
      case 'low':
        return '#10B981';
      default:
        return '#6B7280';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Assignment':
        return '📝';
      case 'Study':
        return '📚';
      case 'Lab Report':
        return '🧪';
      case 'Reading':
        return '📖';
      default:
        return '📋';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const renderTaskItem = ({item}: {item: Task}) => (
    <TouchableOpacity
      style={[styles.taskCard, item.completed && styles.completedTaskCard]}
      onPress={() => toggleTaskCompletion(item.id)}>
      <View style={styles.taskHeader}>
        <View style={styles.taskLeft}>
          <View style={[styles.checkbox, item.completed && styles.checkedBox]}>
            {item.completed && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <View style={styles.taskInfo}>
            <Text
              style={[
                styles.taskTitle,
                item.completed && styles.completedText,
              ]}>
              {item.title}
            </Text>
            <Text style={styles.taskDescription}>{item.description}</Text>
          </View>
        </View>
        <View style={styles.taskRight}>
          <Text style={styles.categoryIcon}>
            {getCategoryIcon(item.category)}
          </Text>
        </View>
      </View>

      <View style={styles.taskFooter}>
        <View style={styles.taskMeta}>
          <View
            style={[
              styles.priorityBadge,
              {backgroundColor: getPriorityColor(item.priority)},
            ]}>
            <Text style={styles.priorityText}>
              {item.priority.toUpperCase()}
            </Text>
          </View>
          <Text style={styles.categoryText}>{item.category}</Text>
        </View>
        <Text style={styles.dueDate}>Due: {formatDate(item.dueDate)}</Text>
      </View>
    </TouchableOpacity>
  );

  const completedTasks = tasks.filter(task => task.completed);
  const pendingTasks = tasks.filter(task => !task.completed);

  return (
    <View style={styles.container}>
      <Header
        toggler={toggleSidebar}
        changeStack={navigation.navigate}
        registerName="Tasks"
      />

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{pendingTasks.length}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{completedTasks.length}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{tasks.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
      </View>

      {tasks.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>✅</Text>
          <Text style={styles.emptyTitle}>No Tasks Found</Text>
          <Text style={styles.emptyText}>
            Create tasks to stay organized and productive
          </Text>
        </View>
      ) : (
        <FlatList
          data={tasks}
          renderItem={renderTaskItem}
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
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  statCard: {
    backgroundColor: '#27272A',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#3F3F46',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6366F1',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  taskCard: {
    backgroundColor: '#27272A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#3F3F46',
  },
  completedTaskCard: {
    opacity: 0.7,
    backgroundColor: '#1F2937',
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  taskLeft: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'flex-start',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#6B7280',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  checkedBox: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F3F4F6',
    marginBottom: 4,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#9CA3AF',
  },
  taskDescription: {
    fontSize: 14,
    color: '#9CA3AF',
    lineHeight: 20,
  },
  taskRight: {
    marginLeft: 12,
  },
  categoryIcon: {
    fontSize: 20,
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginRight: 8,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  categoryText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  dueDate: {
    fontSize: 12,
    color: '#9CA3AF',
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
  },
});

export default TasksScreen;
