import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert, Linking, Platform } from 'react-native';
import MessageBox from '../../../../../src/screens/tasks-chat/components/message-box';

// Mock dependencies
jest.mock('@react-native-clipboard/clipboard', () => ({
  setString: jest.fn()
}));

jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  return {
    ...RN,
    Alert: {
      alert: jest.fn()
    },
    ToastAndroid: {
      show: jest.fn(),
      SHORT: 'short'
    },
    Linking: {
      openURL: jest.fn()
    },
    Platform: {
      OS: 'android'
    }
  };
});

describe('MessageBox Component', () => {
  const mockHandleTaskPress = jest.fn();
  const mockHandleTaskLongPress = jest.fn();
  const mockGetPriorityColor = jest.fn(() => '#FF5733');

  const defaultProps = {
    id: 1,
    title: 'Test Task',
    description: 'This is a test task description',
    completed: false,
    timestamp: '2024-01-15T10:30:00Z',
    handleTaskPress: mockHandleTaskPress,
    handleTaskLongPress: mockHandleTaskLongPress,
    priority: 'high' as const,
    getPriorityColor: mockGetPriorityColor,
    showCompletedTasks: true,
    type: 'task' as const
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders task message correctly', () => {
      const { getByText } = render(<MessageBox {...defaultProps} />);
      expect(getByText('Test Task')).toBeTruthy();
      expect(getByText('This is a test task description')).toBeTruthy();
    });

    it('renders completed task with checkmark', () => {
      const completedProps = { 
        ...defaultProps, 
        completed: true,
        completedAt: '2024-01-15T11:00:00Z'
      };
      
      const { getByText } = render(<MessageBox {...completedProps} />);
      expect(getByText('✓')).toBeTruthy();
    });

    it('displays priority indicator', () => {
      const { getByTestId } = render(<MessageBox {...defaultProps} />);
      const priorityIndicator = getByTestId('priority-indicator');
      expect(mockGetPriorityColor).toHaveBeenCalledWith('high');
    });
  });

  describe('Task Interactions', () => {
    it('handles task press', () => {
      const { getByTestId } = render(<MessageBox {...defaultProps} />);
      const messageContainer = getByTestId('message-container');
      
      fireEvent.press(messageContainer);
      expect(mockHandleTaskPress).toHaveBeenCalledWith(1);
    });

    it('handles task long press', () => {
      const { getByTestId } = render(<MessageBox {...defaultProps} />);
      const messageContainer = getByTestId('message-container');
      
      fireEvent(messageContainer, 'onLongPress');
      expect(mockHandleTaskLongPress).toHaveBeenCalledWith(1);
    });

    it('handles checkbox press for completion', () => {
      const { getByTestId } = render(<MessageBox {...defaultProps} />);
      const checkbox = getByTestId('task-checkbox');
      
      fireEvent.press(checkbox);
      expect(mockHandleTaskPress).toHaveBeenCalledWith(1);
    });
  });

  describe('Message Types', () => {
    it('renders image message type', () => {
      const imageProps = {
        ...defaultProps,
        type: 'image' as const,
        imageUri: 'https://example.com/image.jpg'
      };
      
      const { getByTestId } = render(<MessageBox {...imageProps} />);
      expect(getByTestId('message-image')).toBeTruthy();
    });

    it('renders URL message type', () => {
      const urlProps = {
        ...defaultProps,
        type: 'url' as const,
        urlData: {
          url: 'https://example.com',
          title: 'Example Site',
          description: 'Test website'
        }
      };
      
      const { getByText } = render(<MessageBox {...urlProps} />);
      expect(getByText('Example Site')).toBeTruthy();
      expect(getByText('https://example.com')).toBeTruthy();
    });

    it('handles URL press to open link', async () => {
      const urlProps = {
        ...defaultProps,
        type: 'url' as const,
        urlData: {
          url: 'https://example.com',
          title: 'Example Site'
        }
      };
      
      const { getByTestId } = render(<MessageBox {...urlProps} />);
      const urlContainer = getByTestId('url-container');
      
      fireEvent.press(urlContainer);
      
      await waitFor(() => {
        expect(Linking.openURL).toHaveBeenCalledWith('https://example.com');
      });
    });
  });

  describe('Copy Functionality', () => {
    it('copies message content to clipboard on Android', async () => {
      Platform.OS = 'android';
      const Clipboard = require('@react-native-clipboard/clipboard');
      
      const { getByTestId } = render(<MessageBox {...defaultProps} />);
      const copyButton = getByTestId('copy-button');
      
      fireEvent.press(copyButton);
      
      await waitFor(() => {
        expect(Clipboard.setString).toHaveBeenCalledWith('Test Task\nThis is a test task description');
      });
    });

    it('shows alert on iOS after copying', async () => {
      Platform.OS = 'ios';
      
      const { getByTestId } = render(<MessageBox {...defaultProps} />);
      const copyButton = getByTestId('copy-button');
      
      fireEvent.press(copyButton);
      
      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith('Success', 'Copied to Clipboard');
      });
    });
  });

  describe('Status Icons', () => {
    it('displays starred status', () => {
      const starredProps = { ...defaultProps, starred: true };
      const { getByText } = render(<MessageBox {...starredProps} />);
      expect(getByText('⭐')).toBeTruthy();
    });

    it('displays pinned status', () => {
      const pinnedProps = { ...defaultProps, pinned: true };
      const { getByText } = render(<MessageBox {...pinnedProps} />);
      expect(getByText('📌')).toBeTruthy();
    });

    it('displays seen status', () => {
      const seenProps = { ...defaultProps, seen: true };
      const { getByTestId } = render(<MessageBox {...seenProps} />);
      expect(getByTestId('seen-icon')).toBeTruthy();
    });
  });

  describe('Multi-select Mode', () => {
    it('renders differently in multi-select mode', () => {
      const multiSelectProps = { 
        ...defaultProps, 
        isMultiSelectMode: true,
        isSelected: true 
      };
      
      const { getByTestId } = render(<MessageBox {...multiSelectProps} />);
      const container = getByTestId('message-container');
      
      expect(container.props.style).toContainEqual(
        expect.objectContaining({ backgroundColor: expect.any(String) })
      );
    });

    it('handles selection in multi-select mode', () => {
      const multiSelectProps = { 
        ...defaultProps, 
        isMultiSelectMode: true 
      };
      
      const { getByTestId } = render(<MessageBox {...multiSelectProps} />);
      const messageContainer = getByTestId('message-container');
      
      fireEvent.press(messageContainer);
      expect(mockHandleTaskPress).toHaveBeenCalledWith(1);
    });
  });
});