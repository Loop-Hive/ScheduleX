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
  BackHandler,
  Clipboard,
  ToastAndroid,
  ImageBackground,
  TouchableWithoutFeedback,
} from 'react-native';
import {useTaskStore, Task, TaskList} from '../../store/taskStore';
import MessageBox from './components/message-box';
import MessageOverlay from './components/MessageOverlay';

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
    updateTask,
    starTask,
    pinTask,
    forwardTask,
    replyToTask,
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

  // Multi-selection state
  const [selectedTaskIds, setSelectedTaskIds] = useState<number[]>([]);
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const [overlayReplyText, setOverlayReplyText] = useState('');
  const [overlayEditText, setOverlayEditText] = useState('');

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
    if (isMultiSelectMode) {
      // In multi-select mode, toggle selection
      if (selectedTaskIds.includes(taskId)) {
        const newSelection = selectedTaskIds.filter(id => id !== taskId);
        setSelectedTaskIds(newSelection);
        // Exit multi-select mode if no tasks are selected
        if (newSelection.length === 0) {
          setIsMultiSelectMode(false);
        } else {
          // Show overlay when there are selected tasks
          setShowOverlay(true);
        }
      } else {
        const newSelection = [...selectedTaskIds, taskId];
        setSelectedTaskIds(newSelection);
        // Show overlay when there are selected tasks
        setShowOverlay(true);
      }
      return;
    }

    if (showCompletedTasks) {
      // For completed tasks, just show details or do nothing
      return;
    }
    // Toggle completion for active tasks
    toggleTaskCompletion(activeListId, taskId);
  };

  const handleTaskLongPress = (taskId: number) => {
    if (!isMultiSelectMode) {
      // Enter multi-select mode and select this task
      setIsMultiSelectMode(true);
      setSelectedTaskIds([taskId]);
      // Show overlay immediately
      setShowOverlay(true);
    }
  };

  // Overlay handlers
  const handleOverlayClose = () => {
    setShowOverlay(false);
    setSelectedTaskIds([]);
    setIsMultiSelectMode(false);
    setOverlayReplyText('');
    setOverlayEditText('');
  };

  const handleOverlayReply = (text: string) => {
    if (selectedTaskIds.length > 0 && text.trim()) {
      // For multi-select, reply to all selected tasks
      selectedTaskIds.forEach(taskId => {
        replyToTask(activeListId, taskId, text);
      });
    }
  };

  const handleOverlayStar = () => {
    selectedTaskIds.forEach(taskId => {
      starTask(activeListId, taskId);
    });
  };

  const handleOverlayDelete = () => {
    if (selectedTaskIds.length === 0) return;

    const taskList = showCompletedTasks ? completedTasks : tasks;
    const selectedTasks = taskList.filter((t: Task) => selectedTaskIds.includes(t.id));

    if (selectedTasks.length === 0) return;

    const message = selectedTaskIds.length === 1 
      ? `Are you sure you want to delete "${selectedTasks[0].title}"?`
      : `Are you sure you want to delete ${selectedTaskIds.length} selected tasks?`;

    Alert.alert(
      'Delete Task(s)',
      message,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            selectedTaskIds.forEach(taskId => {
              if (showCompletedTasks) {
                deleteCompletedTask(activeListId, taskId);
              } else {
                deleteTask(activeListId, taskId);
              }
            });
            handleOverlayClose();
          },
        },
      ],
    );
  };

  const handleOverlayForward = (toListId: number) => {
    selectedTaskIds.forEach(taskId => {
      forwardTask(activeListId, toListId, taskId);
    });
  };

  const handleOverlayCopy = () => {
    if (selectedTaskIds.length > 0) {
      const taskList = showCompletedTasks ? completedTasks : tasks;
      const selectedTasks = taskList.filter((t: Task) => selectedTaskIds.includes(t.id));
      
      if (selectedTasks.length > 0) {
        const textToCopy = selectedTasks.map(task => 
          `${task.title}${task.description ? '\n' + task.description : ''}`
        ).join('\n\n');
        
        Clipboard.setString(textToCopy);
        
        if (Platform.OS === 'android') {
          ToastAndroid.show('Copied to Clipboard', ToastAndroid.SHORT);
        } else {
          Alert.alert('Success', 'Copied to Clipboard');
        }
      }
    }
  };

  const handleOverlayEdit = (text: string) => {
    if (selectedTaskIds.length === 1 && text.trim()) {
      // Only allow editing when a single task is selected
      updateTask(activeListId, selectedTaskIds[0], { title: text });
    }
  };

  const handleOverlayPin = () => {
    selectedTaskIds.forEach(taskId => {
      pinTask(activeListId, taskId);
    });
  };

  const handleOverlayMarkCompleted = () => {
    selectedTaskIds.forEach(taskId => {
      toggleTaskCompletion(activeListId, taskId);
    });
  };

  // Get selected task data for overlay (for single selection)
  const getSelectedTask = () => {
    if (selectedTaskIds.length !== 1) return null;
    const taskList = showCompletedTasks ? completedTasks : tasks;
    return taskList.find((t: Task) => t.id === selectedTaskIds[0]) || null;
  };

  const selectedTask = getSelectedTask();

  // Function to clear all selections and exit multi-select mode
  const clearSelection = () => {
    setIsMultiSelectMode(false);
    setSelectedTaskIds([]);
  };

  // Missing handler functions
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

  const detectUrls = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.match(urlRegex) || [];
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
    Alert.alert(
      'Add Image',
      'Image picker functionality would be implemented here',
      [
        {
          text: 'OK',
          onPress: () => {
            const placeholderImageUri =
              'https://via.placeholder.com/300x200.png?text=Sample+Image';
            addImageTask(activeListId, placeholderImageUri, 'Sample Image');
          },
        },
      ],
    );
    setShowAttachmentMenu(false);
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

  const activeListName = taskLists.find(list => list.id === activeListId)?.name;

  const renderTaskMessage = ({item}: {item: Task}) => (
    <MessageBox
      id={item.id}
      title={item.title}
      imageUri={item.imageUri}
      type={item.type}
      urlData={item.urlData}
      description={item.description}
      completed={item.completed}
      completedAt={item.completedAt}
      timestamp={item.timestamp}
      handleTaskPress={handleTaskPress}
      handleTaskLongPress={handleTaskLongPress}
      priority={item.priority}
      getPriorityColor={getPriorityColor}
      showCompletedTasks={showCompletedTasks}
      starred={item.starred}
      pinned={item.pinned}
      isSelected={selectedTaskIds.includes(item.id)}
      isMultiSelectMode={isMultiSelectMode}
    />
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ImageBackground
        source={require('../../assets/icons/tasks-chat/chat-background.jpeg')}
        style={styles.backgroundImage}
        imageStyle={styles.backgroundImageStyle}>
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
              {showCompletedTasks ? '📋' : '✅'}
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
          
          {/* Add new list button */}
          <TouchableOpacity
            style={styles.addListButton}
            onPress={handleCreateNewList}>
            <Text style={styles.addListIcon}>+</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
      
      {/* Messages List */}
      <TouchableWithoutFeedback 
        onPress={() => {
          if (isMultiSelectMode && selectedTaskIds.length === 0) {
            clearSelection();
          }
        }}>
        <View style={{ flex: 1 }}>
          <FlatList
            ref={flatListRef}
            data={showCompletedTasks ? completedTasks : tasks}
            renderItem={renderTaskMessage}
            keyExtractor={item => item.id.toString()}
            contentContainerStyle={styles.messagesList}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </TouchableWithoutFeedback>

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

      {/* Message Overlay - For task actions like reply, edit, etc. */}
      {showOverlay && selectedTaskIds.length > 0 && (
        <MessageOverlay
          visible={showOverlay}
          onClose={handleOverlayClose}
          onReply={handleOverlayReply}
          onStar={handleOverlayStar}
          onDelete={handleOverlayDelete}
          onForward={() => {}}
          onForwardToList={(listId: number) => handleOverlayForward(listId)}
          onCopy={handleOverlayCopy}
          onEdit={handleOverlayEdit}
          onPin={handleOverlayPin}
          onMarkCompleted={handleOverlayMarkCompleted}
          isStarred={selectedTask?.starred || false}
          isPinned={selectedTask?.pinned || false}
          isCompleted={selectedTask?.completed || false}
          taskLists={taskLists}
          currentListId={activeListId}
          selectedCount={selectedTaskIds.length}
        />
      )}
      </ImageBackground>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0B0F',
  },
  backgroundImage: {
    flex: 1,
  },
  backgroundImageStyle: {
    opacity: 0.1,
    resizeMode: 'repeat',
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
