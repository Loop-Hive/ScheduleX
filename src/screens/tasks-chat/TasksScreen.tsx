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
  Alert,
  ScrollView,
  Modal,
  Linking,
  Image,
} from 'react-native';
import {useTaskStore, Task, TaskList} from '../../store/taskStore';

interface TasksScreenProps {
  toggleSidebar?: () => void;
}

const TasksScreen: React.FC<TasksScreenProps> = ({}: any) => {
  const navigation = useNavigation();
  const {
    taskLists,
    activeListId,
    addTaskList,
    deleteTaskList,
    renameTaskList,
    setActiveList,
    addTask,
    toggleTaskCompletion,
    deleteTask,
    deleteCompletedTask,
    clearAllTasks,
    clearAllCompletedTasks,
    addImageTask,
    addUrlTask,
  } = useTaskStore();

  const [inputText, setInputText] = useState('');
  const [showCompletedTasks, setShowCompletedTasks] = useState(false);
  const [showListSelector, setShowListSelector] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [showListMenu, setShowListMenu] = useState(false);
  const [selectedListForMenu, setSelectedListForMenu] = useState<number | null>(
    null,
  );
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [renameText, setRenameText] = useState('');
  const [showCreateListModal, setShowCreateListModal] = useState(false);
  const [createListText, setCreateListText] = useState('');
  const flatListRef = useRef<FlatList>(null);

  const activeList =
    taskLists.find(list => list.id === activeListId) || taskLists[0];
  const tasks = activeList?.tasks || [];
  const completedTasks = activeList?.completedTasks || [];

  // Calculate total tasks across all lists for display
  const totalTasksAllLists = taskLists.reduce(
    (total, list) => total + list.tasks.length,
    0,
  );
  const totalCompletedAllLists = taskLists.reduce(
    (total, list) => total + list.completedTasks.length,
    0,
  );

  // Auto scroll to bottom when new tasks are added
  useEffect(() => {
    if (tasks.length > 0 && !showCompletedTasks) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({animated: true});
      }, 100);
    }
  }, [tasks.length, showCompletedTasks]);

  const addNewTask = () => {
    if (inputText.trim()) {
      const newTaskData = {
        title: inputText.trim(),
        description: '',
        completed: false,
        priority: 'medium' as const,
        dueDate: new Date().toISOString().split('T')[0],
        category: 'Task',
        timestamp: new Date().toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        }),
        type: 'task' as const,
      };
      addTask(activeListId, newTaskData);
      setInputText('');
    }
  };

  const handleTaskPress = (taskId: number) => {
    if (showCompletedTasks) {
      // For completed tasks, just show details or do nothing
      return;
    }
    // Toggle completion for active tasks
    toggleTaskCompletion(activeListId, taskId);
  };

  const handleTaskLongPress = (taskId: number) => {
    const taskList = showCompletedTasks ? completedTasks : tasks;
    const task = taskList.find((t: Task) => t.id === taskId);

    if (!task) return;

    Alert.alert(
      'Delete Task',
      `Are you sure you want to delete "${task.title}"?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            if (showCompletedTasks) {
              deleteCompletedTask(activeListId, taskId);
            } else {
              deleteTask(activeListId, taskId);
            }
          },
        },
      ],
    );
  };

  const handleClearAll = () => {
    const actionText = showCompletedTasks ? 'completed tasks' : 'all tasks';

    Alert.alert(
      'Clear All Tasks',
      `Are you sure you want to delete all ${actionText}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: () => {
            if (showCompletedTasks) {
              clearAllCompletedTasks(activeListId);
            } else {
              clearAllTasks(activeListId);
            }
          },
        },
      ],
    );
  };

  const handleAddUrl = () => {
    Alert.prompt(
      'Add URL',
      'Enter the URL you want to add:',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Add',
          onPress: (url?: string) => {
            if (url && url.trim()) {
              const urlData = {
                url: url.trim(),
                title: url.trim(),
              };
              addUrlTask(activeListId, url.trim(), urlData);
            }
          },
        },
      ],
      'plain-text',
      '',
      'url',
    );
    setShowAttachmentMenu(false);
  };

  const handleAddImage = () => {
    // For now, we'll just add a placeholder image functionality
    Alert.alert(
      'Add Image',
      'Image picker functionality would be implemented here',
      [
        {
          text: 'OK',
          onPress: () => {
            // Placeholder: In a real app, you'd use react-native-image-picker here
            const placeholderImageUri =
              'https://via.placeholder.com/300x200.png?text=Sample+Image';
            addImageTask(activeListId, placeholderImageUri, 'Sample Image');
          },
        },
      ],
    );
    setShowAttachmentMenu(false);
  };

  const detectUrls = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.match(urlRegex) || [];
  };

  const handleInputSubmit = () => {
    if (inputText.trim()) {
      const urls = detectUrls(inputText);

      if (urls.length > 0) {
        // If URLs are detected, create URL tasks
        urls.forEach(url => {
          const urlData = {
            url,
            title: url,
          };
          addUrlTask(activeListId, url, urlData);
        });

        // Also add the text as a regular task if there's text beyond URLs
        const textWithoutUrls = inputText
          .replace(/(https?:\/\/[^\s]+)/g, '')
          .trim();
        if (textWithoutUrls) {
          addNewTask();
        } else {
          setInputText('');
        }
      } else {
        addNewTask();
      }
    }
  };

  const handleCreateNewList = () => {
    setCreateListText('');
    setShowCreateListModal(true);
  };

  const confirmCreateList = () => {
    if (!createListText.trim()) return;

    const colors = [
      '#E5E7EB',
      '#FEE2E2',
      '#DBEAFE',
      '#D1FAE5',
      '#FEF3C7',
      '#E9D5FF',
    ];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    addTaskList(createListText.trim(), randomColor);

    setShowCreateListModal(false);
    setCreateListText('');
  };

  const cancelCreateList = () => {
    setShowCreateListModal(false);
    setCreateListText('');
  };

  const handleListLongPress = (listId: number) => {
    // Don't allow operations on default list (List 1)
    if (listId === 1) {
      Alert.alert(
        'Protected List',
        'The default list cannot be modified or deleted.',
        [{text: 'OK'}],
      );
      return;
    }

    setSelectedListForMenu(listId);
    setShowListMenu(true);
  };

  const handleRenameList = () => {
    if (!selectedListForMenu) return;

    const list = taskLists.find(l => l.id === selectedListForMenu);
    if (!list) return;

    setRenameText(list.name);
    setShowListMenu(false);
    setShowRenameModal(true);
  };

  const confirmRename = () => {
    if (!selectedListForMenu || !renameText.trim()) return;

    renameTaskList(selectedListForMenu, renameText.trim());
    setShowRenameModal(false);
    setSelectedListForMenu(null);
    setRenameText('');
  };

  const cancelRename = () => {
    setShowRenameModal(false);
    setSelectedListForMenu(null);
    setRenameText('');
  };

  const handleDeleteList = () => {
    if (!selectedListForMenu) return;

    const list = taskLists.find(l => l.id === selectedListForMenu);
    if (!list) return;

    Alert.alert(
      'Delete List',
      `Are you sure you want to delete "${list.name}"? This will permanently delete all tasks in this list.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteTaskList(selectedListForMenu);
            setShowListMenu(false);
            setSelectedListForMenu(null);
          },
        },
      ],
    );
  };

  const handleDuplicateList = () => {
    if (!selectedListForMenu) return;

    const list = taskLists.find(l => l.id === selectedListForMenu);
    if (!list) return;

    const colors = [
      '#E5E7EB',
      '#FEE2E2',
      '#DBEAFE',
      '#D1FAE5',
      '#FEF3C7',
      '#E9D5FF',
    ];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    addTaskList(`${list.name} Copy`, randomColor);

    setShowListMenu(false);
    setSelectedListForMenu(null);
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
        onPress={() => handleTaskPress(item.id)}
        onLongPress={() => handleTaskLongPress(item.id)}>
        {/* Header with checkbox and title */}
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

        {/* Image content */}
        {item.type === 'image' && item.imageUri && (
          <Image source={{uri: item.imageUri}} style={styles.messageImage} />
        )}

        {/* URL content */}
        {item.type === 'url' && item.urlData && (
          <TouchableOpacity
            style={styles.urlContainer}
            onPress={() => Linking.openURL(item.urlData!.url)}>
            <Text style={styles.urlTitle}>{item.urlData.title || 'Link'}</Text>
            <Text style={styles.urlText} numberOfLines={1}>
              {item.urlData.url}
            </Text>
          </TouchableOpacity>
        )}

        {/* Description */}
        {item.description ? (
          <Text style={styles.messageDescription}>{item.description}</Text>
        ) : null}

        {/* Footer with priority and time */}
        <View style={styles.messageFooter}>
          <View
            style={[
              styles.priorityDot,
              {backgroundColor: getPriorityColor(item.priority)},
            ]}
          />
          <Text style={styles.messageTime}>
            {showCompletedTasks && item.completedAt
              ? `Completed: ${item.completedAt}`
              : item.timestamp}
          </Text>
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
          <Text style={styles.headerTitle}>
            {showCompletedTasks
              ? 'Completed Tasks'
              : activeList?.name || 'Task Manager'}
          </Text>
          <Text style={styles.headerSubtitle}>
            {showCompletedTasks
              ? `${completedTasks.length} completed tasks`
              : taskLists.length > 3
                ? `${tasks.length} pending tasks`
                : `${tasks.length} pending tasks`}
          </Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setShowCompletedTasks(!showCompletedTasks)}>
            <Text style={styles.headerButtonText}>
              {showCompletedTasks ? '📝' : '✅'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={handleClearAll}>
            <Text style={styles.headerButtonText}>🗑️</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* List Selector at the second */}
      <View style={styles.listSelector}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.listScrollView}>
          {taskLists.map(list => (
            <TouchableOpacity
              key={list.id}
              style={[
                styles.listTab,
                list.id === activeListId && styles.activeListTab,
                {
                  backgroundColor:
                    list.id === activeListId ? list.color : '#27272A',
                },
              ]}
              onPress={() => setActiveList(list.id)}
              onLongPress={() => handleListLongPress(list.id)}>
              <Text
                style={[
                  styles.listTabText,
                  list.id === activeListId && styles.activeListTabText,
                ]}>
                {list.name}
              </Text>
              {list.tasks.length > 0 && (
                <View style={styles.taskCountBadge}>
                  <Text style={styles.taskCountText}>{list.tasks.length}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={styles.addListButton}
            onPress={handleCreateNewList}>
            <Text style={styles.addListIcon}>+</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Messages List */}
      <FlatList
        ref={flatListRef}
        data={showCompletedTasks ? completedTasks : tasks}
        renderItem={renderTaskMessage}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.messagesList}
        showsVerticalScrollIndicator={false}
      />

      {/* Input Area - Hidden when showing completed tasks */}
      {!showCompletedTasks && (
        <View style={styles.inputContainer}>
          <TouchableOpacity
            style={styles.attachmentButton}
            onPress={() => setShowAttachmentMenu(!showAttachmentMenu)}>
            <Text style={styles.attachmentIcon}>📎</Text>
          </TouchableOpacity>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Add a new task..."
            placeholderTextColor="#9CA3AF"
            multiline
            onSubmitEditing={handleInputSubmit}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              inputText.trim() && styles.sendButtonActive,
            ]}
            onPress={handleInputSubmit}>
            <Text style={styles.sendIcon}>→</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Attachment Menu Modal */}
      <Modal
        visible={showAttachmentMenu}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowAttachmentMenu(false)}>
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => setShowAttachmentMenu(false)}>
          <View style={styles.attachmentMenu}>
            <TouchableOpacity
              style={styles.attachmentOption}
              onPress={handleAddImage}>
              <Text style={styles.attachmentOptionIcon}>🖼️</Text>
              <Text style={styles.attachmentOptionText}>Add Image</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.attachmentOption}
              onPress={handleAddUrl}>
              <Text style={styles.attachmentOptionIcon}>🔗</Text>
              <Text style={styles.attachmentOptionText}>Add URL</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* List Management Menu Modal */}
      <Modal
        visible={showListMenu}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowListMenu(false)}>
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => setShowListMenu(false)}>
          <View style={styles.listMenu}>
            <Text style={styles.listMenuTitle}>List Options</Text>

            <TouchableOpacity
              style={styles.listMenuOption}
              onPress={handleRenameList}>
              <Text style={styles.listMenuIcon}>✏️</Text>
              <Text style={styles.listMenuText}>Rename List</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.listMenuOption}
              onPress={handleDuplicateList}>
              <Text style={styles.listMenuIcon}>📋</Text>
              <Text style={styles.listMenuText}>Duplicate List</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.listMenuOption, styles.listMenuDeleteOption]}
              onPress={handleDeleteList}>
              <Text style={styles.listMenuIcon}>🗑️</Text>
              <Text style={[styles.listMenuText, styles.listMenuDeleteText]}>
                Delete List
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Rename List Modal */}
      <Modal
        visible={showRenameModal}
        transparent={true}
        animationType="fade"
        onRequestClose={cancelRename}>
        <TouchableOpacity
          style={styles.centeredModalOverlay}
          activeOpacity={1}
          onPress={cancelRename}>
          <TouchableOpacity
            style={styles.renameModal}
            activeOpacity={1}
            onPress={() => {}}>
            <Text style={styles.renameModalTitle}>Rename List</Text>
            <Text style={styles.renameModalSubtitle}>
              Enter a new name for this list:
            </Text>

            <TextInput
              style={styles.renameInput}
              value={renameText}
              onChangeText={setRenameText}
              placeholder="List name"
              placeholderTextColor="#9CA3AF"
              autoFocus={true}
              selectTextOnFocus={true}
            />

            <View style={styles.renameModalButtons}>
              <TouchableOpacity
                style={[
                  styles.renameModalButton,
                  styles.renameModalCancelButton,
                ]}
                onPress={cancelRename}>
                <Text style={styles.renameModalCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.renameModalButton,
                  styles.renameModalConfirmButton,
                ]}
                onPress={confirmRename}>
                <Text style={styles.renameModalConfirmText}>Rename</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Create List Modal */}
      <Modal
        visible={showCreateListModal}
        transparent={true}
        animationType="fade"
        onRequestClose={cancelCreateList}>
        <TouchableOpacity
          style={styles.centeredModalOverlay}
          activeOpacity={1}
          onPress={cancelCreateList}>
          <TouchableOpacity
            style={styles.renameModal}
            activeOpacity={1}
            onPress={() => {}}>
            <Text style={styles.renameModalTitle}>Create New List</Text>
            <Text style={styles.renameModalSubtitle}>
              Enter a name for the new list:
            </Text>

            <TextInput
              style={styles.renameInput}
              value={createListText}
              onChangeText={setCreateListText}
              placeholder="List name"
              placeholderTextColor="#9CA3AF"
              autoFocus={true}
            />

            <View style={styles.renameModalButtons}>
              <TouchableOpacity
                style={[
                  styles.renameModalButton,
                  styles.renameModalCancelButton,
                ]}
                onPress={cancelCreateList}>
                <Text style={styles.renameModalCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.renameModalButton,
                  styles.renameModalConfirmButton,
                ]}
                onPress={confirmCreateList}>
                <Text style={styles.renameModalConfirmText}>Create</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0B0F',
  },
  listSelector: {
    backgroundColor: '#18181B',
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#27272A',
    paddingTop: Platform.OS === 'ios' ? 54 : 12,
    overflow: 'visible',
  },
  listScrollView: {
    paddingVertical: 8,
  },
  listTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 24,
    backgroundColor: '#27272A',
    position: 'relative',
    overflow: 'visible',
  },
  activeListTab: {
    backgroundColor: '#E5E7EB',
  },
  listTabText: {
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: '500',
  },
  activeListTabText: {
    color: '#1F2937',
  },
  taskCountBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#EF4444',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    zIndex: 10,
    borderWidth: 2,
    borderColor: '#18181B',
  },
  taskCountText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  addListButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  addListIcon: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#18181B',
    borderBottomWidth: 1,
    borderBottomColor: '#27272A',
  },
  backIcon: {
    fontSize: 24,
    color: '#6366F1',
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#27272A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerButtonText: {
    fontSize: 16,
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
    padding: 8,
    paddingBottom: 20,
  },
  messageContainer: {
    marginBottom: 12,
    alignItems: 'flex-end',
  },
  messageBubble: {
    backgroundColor: '#202023',
    borderRadius: 18,
    padding: 12,
    maxWidth: '95%',
    minWidth: '80%',
  },
  completedMessageBubble: {
    backgroundColor: '#D1FAE5',
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
    borderColor: '#374151',
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkedBox: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  messageTitle: {
    fontSize: 15,
    color: '#fff',
    flex: 1,
  },
  completedText: {
    textDecorationLine: 'line-through',
    opacity: 0.8,
  },
  messageImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 4,
  },
  urlContainer: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 8,
    marginTop: 4,
    marginBottom: 4,
  },
  urlTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1155CC',
    marginBottom: 2,
  },
  urlText: {
    fontSize: 12,
    color: '#',
  },
  messageDescription: {
    fontSize: 13,
    color: '#6B7280',
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
    color: '#6B7280',
    opacity: 0.8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 30,
    backgroundColor: '#18181B',
    borderTopWidth: 1,
    borderTopColor: '#27272A',
  },
  attachmentButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  attachmentIcon: {
    fontSize: 18,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  centeredModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  attachmentMenu: {
    backgroundColor: '#18181B',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
  },
  attachmentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#27272A',
  },
  attachmentOptionIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  attachmentOptionText: {
    fontSize: 16,
    color: '#F3F4F6',
    fontWeight: '500',
  },
  listMenu: {
    backgroundColor: '#18181B',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  listMenuTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F3F4F6',
    marginBottom: 16,
    textAlign: 'center',
  },
  listMenuOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#27272A',
  },
  listMenuDeleteOption: {
    borderBottomWidth: 0,
  },
  listMenuIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  listMenuText: {
    fontSize: 16,
    color: '#F3F4F6',
    fontWeight: '500',
  },
  listMenuDeleteText: {
    color: '#EF4444',
  },
  renameModal: {
    backgroundColor: '#18181B',
    borderRadius: 20,
    padding: 24,
    margin: 20,
  },
  renameModalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#F3F4F6',
    textAlign: 'center',
    marginBottom: 8,
  },
  renameModalSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 20,
  },
  renameInput: {
    backgroundColor: '#27272A',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#F3F4F6',
    fontSize: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#374151',
  },
  renameModalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  renameModalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  renameModalCancelButton: {
    backgroundColor: '#374151',
  },
  renameModalConfirmButton: {
    backgroundColor: '#6366F1',
  },
  renameModalCancelText: {
    color: '#9CA3AF',
    fontSize: 16,
    fontWeight: '500',
  },
  renameModalConfirmText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default TasksScreen;
