import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { BackHandler } from 'react-native';
import MessageOverlay from '../../../../../src/screens/tasks-chat/components/MessageOverlay';

// Mock BackHandler
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  return {
    ...RN,
    BackHandler: {
      addEventListener: jest.fn(() => ({ remove: jest.fn() })),
      removeEventListener: jest.fn()
    }
  };
});

describe('MessageOverlay Component', () => {
  const mockOnClose = jest.fn();
  const mockOnReply = jest.fn();
  const mockOnStar = jest.fn();
  const mockOnDelete = jest.fn();
  const mockOnForward = jest.fn();
  const mockOnCopy = jest.fn();
  const mockOnEdit = jest.fn();
  const mockOnPin = jest.fn();
  const mockOnMarkCompleted = jest.fn();
  const mockOnForwardToList = jest.fn();

  const defaultProps = {
    visible: true,
    onClose: mockOnClose,
    onReply: mockOnReply,
    onStar: mockOnStar,
    onDelete: mockOnDelete,
    onForward: mockOnForward,
    onCopy: mockOnCopy,
    onEdit: mockOnEdit,
    onPin: mockOnPin,
    onMarkCompleted: mockOnMarkCompleted,
    isStarred: false,
    isPinned: false,
    isCompleted: false,
    taskLists: [
      { id: 1, name: 'Personal', color: '#FF5733' },
      { id: 2, name: 'Work', color: '#33FF57' }
    ],
    currentListId: 1,
    onForwardToList: mockOnForwardToList
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders when visible', () => {
      const { getByTestId } = render(<MessageOverlay {...defaultProps} />);
      expect(getByTestId('message-overlay')).toBeTruthy();
    });

    it('does not render when not visible', () => {
      const { queryByTestId } = render(
        <MessageOverlay {...defaultProps} visible={false} />
      );
      expect(queryByTestId('message-overlay')).toBeFalsy();
    });

    it('displays action buttons', () => {
      const { getByText } = render(<MessageOverlay {...defaultProps} />);
      expect(getByText('Reply')).toBeTruthy();
      expect(getByText('Star')).toBeTruthy();
      expect(getByText('Delete')).toBeTruthy();
      expect(getByText('Forward')).toBeTruthy();
      expect(getByText('Copy')).toBeTruthy();
      expect(getByText('Edit')).toBeTruthy();
      expect(getByText('Pin')).toBeTruthy();
    });
  });

  describe('Action Handling', () => {
    it('handles star action', () => {
      const { getByText } = render(<MessageOverlay {...defaultProps} />);
      fireEvent.press(getByText('Star'));
      expect(mockOnStar).toHaveBeenCalled();
    });

    it('handles delete action', () => {
      const { getByText } = render(<MessageOverlay {...defaultProps} />);
      fireEvent.press(getByText('Delete'));
      expect(mockOnDelete).toHaveBeenCalled();
    });

    it('handles copy action', () => {
      const { getByText } = render(<MessageOverlay {...defaultProps} />);
      fireEvent.press(getByText('Copy'));
      expect(mockOnCopy).toHaveBeenCalled();
    });

    it('handles pin action', () => {
      const { getByText } = render(<MessageOverlay {...defaultProps} />);
      fireEvent.press(getByText('Pin'));
      expect(mockOnPin).toHaveBeenCalled();
    });

    it('handles mark completed action', () => {
      const { getByText } = render(<MessageOverlay {...defaultProps} />);
      fireEvent.press(getByText('Mark Complete'));
      expect(mockOnMarkCompleted).toHaveBeenCalled();
    });
  });

  describe('Star/Unstar Toggle', () => {
    it('shows "Unstar" when message is starred', () => {
      const starredProps = { ...defaultProps, isStarred: true };
      const { getByText } = render(<MessageOverlay {...starredProps} />);
      expect(getByText('Unstar')).toBeTruthy();
    });

    it('shows "Star" when message is not starred', () => {
      const { getByText } = render(<MessageOverlay {...defaultProps} />);
      expect(getByText('Star')).toBeTruthy();
    });
  });

  describe('Pin/Unpin Toggle', () => {
    it('shows "Unpin" when message is pinned', () => {
      const pinnedProps = { ...defaultProps, isPinned: true };
      const { getByText } = render(<MessageOverlay {...pinnedProps} />);
      expect(getByText('Unpin')).toBeTruthy();
    });

    it('shows "Pin" when message is not pinned', () => {
      const { getByText } = render(<MessageOverlay {...defaultProps} />);
      expect(getByText('Pin')).toBeTruthy();
    });
  });

  describe('Reply Modal', () => {
    it('opens reply modal when reply is pressed', () => {
      const { getByText, queryByTestId } = render(<MessageOverlay {...defaultProps} />);
      
      fireEvent.press(getByText('Reply'));
      expect(queryByTestId('reply-modal')).toBeTruthy();
    });

    it('handles reply submission', async () => {
      const { getByText, getByTestId } = render(<MessageOverlay {...defaultProps} />);
      
      // Open reply modal
      fireEvent.press(getByText('Reply'));
      
      // Enter reply text
      const replyInput = getByTestId('reply-input');
      fireEvent.changeText(replyInput, 'Test reply message');
      
      // Submit reply
      fireEvent.press(getByText('Send Reply'));
      
      await waitFor(() => {
        expect(mockOnReply).toHaveBeenCalledWith('Test reply message');
        expect(mockOnClose).toHaveBeenCalled();
      });
    });
  });

  describe('Edit Modal', () => {
    it('opens edit modal when edit is pressed', () => {
      const { getByText, queryByTestId } = render(<MessageOverlay {...defaultProps} />);
      
      fireEvent.press(getByText('Edit'));
      expect(queryByTestId('edit-modal')).toBeTruthy();
    });

    it('handles edit submission', async () => {
      const { getByText, getByTestId } = render(<MessageOverlay {...defaultProps} />);
      
      // Open edit modal
      fireEvent.press(getByText('Edit'));
      
      // Enter edit text
      const editInput = getByTestId('edit-input');
      fireEvent.changeText(editInput, 'Updated message text');
      
      // Submit edit
      fireEvent.press(getByText('Save Changes'));
      
      await waitFor(() => {
        expect(mockOnEdit).toHaveBeenCalledWith('Updated message text');
        expect(mockOnClose).toHaveBeenCalled();
      });
    });
  });

  describe('Forward Modal', () => {
    it('opens forward modal when forward is pressed', () => {
      const { getByText, queryByTestId } = render(<MessageOverlay {...defaultProps} />);
      
      fireEvent.press(getByText('Forward'));
      expect(queryByTestId('forward-modal')).toBeTruthy();
    });

    it('displays available task lists for forwarding', () => {
      const { getByText, getByTestId } = render(<MessageOverlay {...defaultProps} />);
      
      fireEvent.press(getByText('Forward'));
      
      expect(getByText('Personal')).toBeTruthy();
      expect(getByText('Work')).toBeTruthy();
    });

    it('handles forwarding to selected list', async () => {
      const { getByText } = render(<MessageOverlay {...defaultProps} />);
      
      fireEvent.press(getByText('Forward'));
      fireEvent.press(getByText('Work'));
      
      await waitFor(() => {
        expect(mockOnForwardToList).toHaveBeenCalledWith(2);
        expect(mockOnClose).toHaveBeenCalled();
      });
    });
  });

  describe('Multi-select Mode', () => {
    it('shows selected count in multi-select mode', () => {
      const multiSelectProps = { ...defaultProps, selectedCount: 3 };
      const { getByText } = render(<MessageOverlay {...multiSelectProps} />);
      expect(getByText('3 selected')).toBeTruthy();
    });

    it('adjusts action labels for multiple selection', () => {
      const multiSelectProps = { ...defaultProps, selectedCount: 2 };
      const { getByText } = render(<MessageOverlay {...multiSelectProps} />);
      expect(getByText('Delete All')).toBeTruthy();
    });
  });

  describe('Back Handler', () => {
    it('registers back handler when visible', () => {
      render(<MessageOverlay {...defaultProps} />);
      expect(BackHandler.addEventListener).toHaveBeenCalledWith(
        'hardwareBackPress', 
        expect.any(Function)
      );
    });

    it('removes back handler when component unmounts', () => {
      const { unmount } = render(<MessageOverlay {...defaultProps} />);
      const mockRemove = jest.fn();
      (BackHandler.addEventListener as jest.Mock).mockReturnValue({ remove: mockRemove });
      
      unmount();
      expect(mockRemove).toHaveBeenCalled();
    });
  });

  describe('Completion Status', () => {
    it('shows different action for completed tasks', () => {
      const completedProps = { ...defaultProps, isCompleted: true };
      const { getByText } = render(<MessageOverlay {...completedProps} />);
      expect(getByText('Mark Incomplete')).toBeTruthy();
    });

    it('shows mark complete for incomplete tasks', () => {
      const { getByText } = render(<MessageOverlay {...defaultProps} />);
      expect(getByText('Mark Complete')).toBeTruthy();
    });
  });
});