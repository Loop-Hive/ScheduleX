import {useNavigation} from '@react-navigation/native';
import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

interface Task {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
  dueDate: string;
  category: string;
  timestamp: string;
}

interface TasksScreenProps {
  toggleSidebar?: () => void;
}

const TasksScreen: React.FC<TasksScreenProps> = ({}: any) => {
  const navigation = useNavigation();
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: 1,
      title: 'Complete Math Assignment',
      description: 'Solve problems 1-20 from Chapter 5',
      completed: false,
      priority: 'high',
      dueDate: '2025-06-20',
      category: 'Assignment',
      timestamp: '10:30 AM',
    },
    {
      id: 2,
      title: 'Study for Physics Quiz',
      description: 'Review chapters 8-10 on thermodynamics',
      completed: true,
      priority: 'medium',
      dueDate: '2025-06-19',
      category: 'Study',
      timestamp: '11:45 AM',
    },
    {
      id: 3,
      title: 'Prepare Chemistry Lab Report',
      description: 'Write report on acid-base reactions experiment',
      completed: false,
      priority: 'high',
      dueDate: '2025-06-21',
      category: 'Lab Report',
      timestamp: '2:15 PM',
    },
  ]);

  const [inputText, setInputText] = useState('');
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    // Auto scroll to bottom when new tasks are added
    if (tasks.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({animated: true});
      }, 100);
    }
  }, [tasks.length]);

  const addNewTask = () => {
    if (inputText.trim()) {
      const newTask: Task = {
        id: Date.now(),
        title: inputText.trim(),
        description: '',
        completed: false,
        priority: 'medium',
        dueDate: new Date().toISOString().split('T')[0],
        category: 'Task',
        timestamp: new Date().toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        }),
      };
      setTasks(prev => [...prev, newTask]);
      setInputText('');
    }
  };

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

  const renderTaskMessage = ({item}: {item: Task}) => (
    <View style={styles.messageContainer}>
      <TouchableOpacity
        style={[
          styles.messageBubble,
          item.completed && styles.completedMessageBubble,
        ]}
        onPress={() => toggleTaskCompletion(item.id)}>
        <View style={styles.messageHeader}>
          <View style={[styles.checkbox, item.completed && styles.checkedBox]}>
            {item.completed && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text
            style={[
              styles.messageTitle,
              item.completed && styles.completedText,
            ]}>
            {item.title}
          </Text>
        </View>

        {item.description ? (
          <Text style={styles.messageDescription}>{item.description}</Text>
        ) : null}

        <View style={styles.messageFooter}>
          <View
            style={[
              styles.priorityDot,
              {backgroundColor: getPriorityColor(item.priority)},
            ]}
          />
          <Text style={styles.messageTime}>{item.timestamp}</Text>
        </View>
      </TouchableOpacity>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      {/* Chat Header */}
      <View style={styles.chatHeader}>
        <TouchableOpacity onPress={() => navigation.navigate('Tabs' as never)}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Task Manager</Text>
          <Text style={styles.headerSubtitle}>
            {tasks.filter(t => !t.completed).length} pending tasks
          </Text>
        </View>
      </View>

      {/* Messages List */}
      <FlatList
        ref={flatListRef}
        data={tasks}
        renderItem={renderTaskMessage}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.messagesList}
        showsVerticalScrollIndicator={false}
      />

      {/* Input Area */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Add a new task..."
          placeholderTextColor="#9CA3AF"
          multiline
          onSubmitEditing={addNewTask}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            inputText.trim() && styles.sendButtonActive,
          ]}
          onPress={addNewTask}>
          <Text style={styles.sendIcon}>→</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0B0F',
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#18181B',
    borderBottomWidth: 1,
    borderBottomColor: '#27272A',
    paddingTop: Platform.OS === 'ios' ? 50 : 12,
  },
  backIcon: {
    fontSize: 24,
    color: '#6366F1',
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F3F4F6',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  messagesList: {
    padding: 16,
    paddingBottom: 20,
  },
  messageContainer: {
    marginBottom: 12,
    alignItems: 'flex-end',
  },
  messageBubble: {
    backgroundColor: '#6366F1',
    borderRadius: 18,
    padding: 12,
    maxWidth: '85%',
    minWidth: '40%',
  },
  completedMessageBubble: {
    backgroundColor: '#10B981',
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  checkbox: {
    width: 16,
    height: 16,
    borderRadius: 3,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkedBox: {
    backgroundColor: '#FFFFFF',
  },
  checkmark: {
    color: '#10B981',
    fontSize: 10,
    fontWeight: 'bold',
  },
  messageTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#FFFFFF',
    flex: 1,
  },
  completedText: {
    textDecorationLine: 'line-through',
    opacity: 0.8,
  },
  messageDescription: {
    fontSize: 13,
    color: '#E5E7EB',
    marginTop: 4,
    lineHeight: 18,
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  priorityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  messageTime: {
    fontSize: 11,
    color: '#E5E7EB',
    opacity: 0.8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#18181B',
    borderTopWidth: 1,
    borderTopColor: '#27272A',
  },
  textInput: {
    flex: 1,
    backgroundColor: '#27272A',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: '#F3F4F6',
    fontSize: 16,
    maxHeight: 100,
    marginRight: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonActive: {
    backgroundColor: '#6366F1',
  },
  sendIcon: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default TasksScreen;
