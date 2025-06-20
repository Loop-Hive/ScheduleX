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
}

interface TaskStoreState {
  tasks: Task[];
  completedTasks: Task[];
  updatedAt: Date | null;
  addTask: (task: Omit<Task, 'id'>) => void;
  toggleTaskCompletion: (taskId: number) => void;
  deleteTask: (taskId: number) => void;
  deleteCompletedTask: (taskId: number) => void;
  clearAllTasks: () => void;
  clearAllCompletedTasks: () => void;
  updateTask: (taskId: number, updates: Partial<Task>) => void;
}

export const useTaskStore = create<TaskStoreState>()(
  persist(
    set => ({
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
      ],
      completedTasks: [],
      updatedAt: null,

      addTask: taskData =>
        set(state => {
          const newTask: Task = {
            ...taskData,
            id: Date.now(),
            completed: false,
          };
          return {
            tasks: [...state.tasks, newTask],
            updatedAt: new Date(),
          };
        }),

      toggleTaskCompletion: taskId =>
        set(state => {
          const taskIndex = state.tasks.findIndex(task => task.id === taskId);

          if (taskIndex === -1) return state;

          const task = state.tasks[taskIndex];
          const updatedTask = {
            ...task,
            completed: true,
            completedAt: new Date().toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
              hour12: true,
            }),
          };

          const newTasks = state.tasks.filter(
            (_, index) => index !== taskIndex,
          );
          const newCompletedTasks = [...state.completedTasks, updatedTask];

          return {
            tasks: newTasks,
            completedTasks: newCompletedTasks,
            updatedAt: new Date(),
          };
        }),

      deleteTask: taskId =>
        set(state => ({
          tasks: state.tasks.filter(task => task.id !== taskId),
          updatedAt: new Date(),
        })),

      deleteCompletedTask: taskId =>
        set(state => ({
          completedTasks: state.completedTasks.filter(
            task => task.id !== taskId,
          ),
          updatedAt: new Date(),
        })),

      clearAllTasks: () =>
        set(() => ({
          tasks: [],
          updatedAt: new Date(),
        })),

      clearAllCompletedTasks: () =>
        set(() => ({
          completedTasks: [],
          updatedAt: new Date(),
        })),

      updateTask: (taskId, updates) =>
        set(state => ({
          tasks: state.tasks.map(task =>
            task.id === taskId ? {...task, ...updates} : task,
          ),
          updatedAt: new Date(),
        })),
    }),
    {
      name: 'task-storage',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
