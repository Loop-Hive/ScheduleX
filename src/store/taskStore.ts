import {create} from 'zustand';
import {persist, createJSONStorage} from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Task {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
  dueDate: string;
  category: string;
  timestamp: string;
  completedAt?: string;
  type: 'task' | 'message' | 'image' | 'url';
  imageUri?: string;
  urlData?: {
    url: string;
    title?: string;
    description?: string;
    image?: string;
  };
  // New properties for overlay functionality
  starred?: boolean;
  pinned?: boolean;
}

export interface TaskList {
  id: number;
  name: string;
  color: string;
  tasks: Task[];
  completedTasks: Task[];
  createdAt: string;
}

interface TaskStoreState {
  taskLists: TaskList[];
  activeListId: number;
  addTaskList: (name: string, color: string) => void;
  deleteTaskList: (listId: number) => void;
  renameTaskList: (listId: number, name: string) => void;
  setActiveList: (listId: number) => void;
  addTask: (listId: number, task: Omit<Task, 'id'>) => void;
  toggleTaskCompletion: (listId: number, taskId: number) => void;
  deleteTask: (listId: number, taskId: number) => void;
  deleteCompletedTask: (listId: number, taskId: number) => void;
  clearAllTasks: (listId: number) => void;
  clearAllCompletedTasks: (listId: number) => void;
  updateTask: (listId: number, taskId: number, updates: Partial<Task>) => void;
  addImageTask: (listId: number, imageUri: string, title?: string) => void;
  addUrlTask: (listId: number, url: string, urlData?: any) => void;
  // New methods for overlay functionality
  starTask: (listId: number, taskId: number) => void;
  pinTask: (listId: number, taskId: number) => void;
  forwardTask: (fromListId: number, toListId: number, taskId: number) => void;
  replyToTask: (listId: number, taskId: number, replyText: string) => void;
}

export const useTaskStore = create<TaskStoreState>()(
  persist(
    set => ({
      taskLists: [
        {
          id: 1,
          name: 'List 1',
          color: '#E5E7EB',
          createdAt: new Date().toISOString(),
          tasks: [
            {
              id: 1,
              title: 'Complete Math Assignment',
              description: 'Solve problems 1-20 from Chapter 5',
              completed: false,
              priority: 'high',
              dueDate: '2025-06-20',
              category: 'Assignment',
              timestamp: '10:30 AM',
              type: 'task',
            },
            {
              id: 2,
              title: 'Study for Physics Quiz',
              description: 'Review chapters 8-10 on thermodynamics',
              completed: false,
              priority: 'medium',
              dueDate: '2025-06-19',
              category: 'Study',
              timestamp: '11:45 AM',
              type: 'task',
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
              type: 'task',
            },
          ],
          completedTasks: [],
        },
        {
          id: 2,
          name: 'List 2',
          color: '#E5E7EB',
          createdAt: new Date().toISOString(),
          tasks: [],
          completedTasks: [],
        },
        {
          id: 3,
          name: 'List 3',
          color: '#E5E7EB',
          createdAt: new Date().toISOString(),
          tasks: [],
          completedTasks: [],
        },
      ],
      activeListId: 1,

      addTaskList: (name, color) =>
        set(state => ({
          taskLists: [
            ...state.taskLists,
            {
              id: Date.now(),
              name,
              color,
              createdAt: new Date().toISOString(),
              tasks: [],
              completedTasks: [],
            },
          ],
        })),

      deleteTaskList: listId =>
        set(state => {
          // Prevent deletion of default list (id: 1)
          if (listId === 1) {
            return state;
          }

          const newTaskLists = state.taskLists.filter(
            list => list.id !== listId,
          );

          // If we're deleting the active list, switch to the first available list
          let newActiveListId = state.activeListId;
          if (state.activeListId === listId) {
            newActiveListId = newTaskLists.length > 0 ? newTaskLists[0].id : 1;
          }

          return {
            taskLists: newTaskLists,
            activeListId: newActiveListId,
          };
        }),

      renameTaskList: (listId, name) =>
        set(state => ({
          taskLists: state.taskLists.map(list =>
            list.id === listId ? {...list, name} : list,
          ),
        })),

      setActiveList: listId =>
        set(() => ({
          activeListId: listId,
        })),

      addTask: (listId, taskData) =>
        set(state => ({
          taskLists: state.taskLists.map(list =>
            list.id === listId
              ? {
                  ...list,
                  tasks: [
                    ...list.tasks,
                    {
                      ...taskData,
                      id: Date.now(),
                      completed: false,
                    },
                  ],
                }
              : list,
          ),
        })),

      toggleTaskCompletion: (listId, taskId) =>
        set(state => ({
          taskLists: state.taskLists.map(list => {
            if (list.id !== listId) return list;

            const taskIndex = list.tasks.findIndex(task => task.id === taskId);
            if (taskIndex === -1) return list;

            const task = list.tasks[taskIndex];
            const updatedTask = {
              ...task,
              completed: true,
              completedAt: new Date().toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
              }),
            };

            const newTasks = list.tasks.filter(
              (_, index) => index !== taskIndex,
            );
            const newCompletedTasks = [...list.completedTasks, updatedTask];

            return {
              ...list,
              tasks: newTasks,
              completedTasks: newCompletedTasks,
            };
          }),
        })),

      deleteTask: (listId, taskId) =>
        set(state => ({
          taskLists: state.taskLists.map(list =>
            list.id === listId
              ? {
                  ...list,
                  tasks: list.tasks.filter(task => task.id !== taskId),
                }
              : list,
          ),
        })),

      deleteCompletedTask: (listId, taskId) =>
        set(state => ({
          taskLists: state.taskLists.map(list =>
            list.id === listId
              ? {
                  ...list,
                  completedTasks: list.completedTasks.filter(
                    task => task.id !== taskId,
                  ),
                }
              : list,
          ),
        })),

      clearAllTasks: listId =>
        set(state => ({
          taskLists: state.taskLists.map(list =>
            list.id === listId ? {...list, tasks: []} : list,
          ),
        })),

      clearAllCompletedTasks: listId =>
        set(state => ({
          taskLists: state.taskLists.map(list =>
            list.id === listId ? {...list, completedTasks: []} : list,
          ),
        })),

      updateTask: (listId, taskId, updates) =>
        set(state => ({
          taskLists: state.taskLists.map(list =>
            list.id === listId
              ? {
                  ...list,
                  tasks: list.tasks.map(task =>
                    task.id === taskId ? {...task, ...updates} : task,
                  ),
                }
              : list,
          ),
        })),

      addImageTask: (listId, imageUri, title) =>
        set(state => ({
          taskLists: state.taskLists.map(list =>
            list.id === listId
              ? {
                  ...list,
                  tasks: [
                    ...list.tasks,
                    {
                      id: Date.now(),
                      title: title || 'Image',
                      description: '',
                      completed: false,
                      priority: 'medium',
                      dueDate: new Date().toISOString().split('T')[0],
                      category: 'Media',
                      timestamp: new Date().toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true,
                      }),
                      type: 'image',
                      imageUri,
                    },
                  ],
                }
              : list,
          ),
        })),

      addUrlTask: (listId, url, urlData) =>
        set(state => ({
          taskLists: state.taskLists.map(list =>
            list.id === listId
              ? {
                  ...list,
                  tasks: [
                    ...list.tasks,
                    {
                      id: Date.now(),
                      title: urlData?.title || url,
                      description: urlData?.description || '',
                      completed: false,
                      priority: 'medium',
                      dueDate: new Date().toISOString().split('T')[0],
                      category: 'Link',
                      timestamp: new Date().toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true,
                      }),
                      type: 'url',
                      urlData: {url, ...urlData},
                    },
                  ],
                }
              : list,
          ),
        })),

      // New methods for overlay functionality
      starTask: (listId, taskId) =>
        set(state => ({
          taskLists: state.taskLists.map(list =>
            list.id === listId
              ? {
                  ...list,
                  tasks: list.tasks.map(task =>
                    task.id === taskId ? {...task, starred: !task.starred} : task,
                  ),
                  completedTasks: list.completedTasks.map(task =>
                    task.id === taskId ? {...task, starred: !task.starred} : task,
                  ),
                }
              : list,
          ),
        })),

      pinTask: (listId, taskId) =>
        set(state => ({
          taskLists: state.taskLists.map(list =>
            list.id === listId
              ? {
                  ...list,
                  tasks: list.tasks.map(task =>
                    task.id === taskId ? {...task, pinned: !task.pinned} : task,
                  ),
                  completedTasks: list.completedTasks.map(task =>
                    task.id === taskId ? {...task, pinned: !task.pinned} : task,
                  ),
                }
              : list,
          ),
        })),

      forwardTask: (fromListId, toListId, taskId) =>
        set(state => {
          const fromList = state.taskLists.find(list => list.id === fromListId);
          if (!fromList) return state;

          const task = fromList.tasks.find(t => t.id === taskId) || 
                      fromList.completedTasks.find(t => t.id === taskId);
          if (!task) return state;

          const newTask = {
            ...task,
            id: Date.now(),
            timestamp: new Date().toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit', 
              hour12: true,
            }),
          };

          return {
            taskLists: state.taskLists.map(list =>
              list.id === toListId
                ? {
                    ...list,
                    tasks: [...list.tasks, newTask],
                  }
                : list,
            ),
          };
        }),

      replyToTask: (listId, taskId, replyText) =>
        set(state => ({
          taskLists: state.taskLists.map(list =>
            list.id === listId
              ? {
                  ...list,
                  tasks: [
                    ...list.tasks,
                    {
                      id: Date.now(),
                      title: `Reply: ${replyText}`,
                      description: `In reply to task #${taskId}`,
                      completed: false,
                      priority: 'medium',
                      dueDate: new Date().toISOString().split('T')[0],
                      category: 'Reply',
                      timestamp: new Date().toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true,
                      }),
                      type: 'message',
                    },
                  ],
                }
              : list,
          ),
        })),
    }),
    {
      name: 'task-storage',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
