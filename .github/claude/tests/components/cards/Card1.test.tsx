import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { ToastAndroid } from 'react-native';
import Card1 from '../../../../src/components/cards/Card1';

// Mock the store
const mockMarkPresent = jest.fn();
const mockMarkAbsent = jest.fn();

jest.mock('../../../../src/store/store', () => ({
  __esModule: true,
  default: () => ({
    markPresent: mockMarkPresent,
    markAbsent: mockMarkAbsent
  })
}));

jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  return {
    ...RN,
    ToastAndroid: {
      show: jest.fn(),
      SHORT: 'short'
    }
  };
});

describe('Card1 Component', () => {
  const mockHandleMenuOpen = jest.fn();
  const mockHandleViewDetails = jest.fn();

  const defaultProps = {
    id: 1,
    title: 'Mathematics',
    present: 8,
    total: 10,
    target_percentage: 80,
    tagColor: '#FF5733',
    cardRegister: 1,
    handleMenuOpen: mockHandleMenuOpen,
    hasLimit: false,
    limitFreq: 0,
    limitType: 'daily',
    handleViewDetails: mockHandleViewDetails,
    delay: 0,
    days: {
      mon: [{ start: '09:00', end: '10:00', roomName: 'Room 101' }],
      tue: [],
      wed: [],
      thu: [],
      fri: [],
      sat: [],
      sun: []
    },
    defaultClassroom: 'Main Building'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders card with correct title', () => {
      const { getByText } = render(<Card1 {...defaultProps} />);
      expect(getByText('Mathematics')).toBeTruthy();
    });

    it('displays attendance ratio', () => {
      const { getByText } = render(<Card1 {...defaultProps} />);
      expect(getByText('8/10')).toBeTruthy();
    });

    it('shows correct percentage', () => {
      const { getByText } = render(<Card1 {...defaultProps} />);
      expect(getByText('80%')).toBeTruthy();
    });

    it('displays tag color indicator', () => {
      const { getByTestId } = render(<Card1 {...defaultProps} />);
      const indicator = getByTestId('tag-indicator');
      expect(indicator.props.style).toContainEqual(
        expect.objectContaining({ backgroundColor: '#FF5733' })
      );
    });
  });

  describe('Attendance Actions', () => {
    it('marks present when present button is pressed', async () => {
      const { getByTestId } = render(<Card1 {...defaultProps} />);
      const presentButton = getByTestId('mark-present');
      
      fireEvent.press(presentButton);
      
      await waitFor(() => {
        expect(mockMarkPresent).toHaveBeenCalledWith(1, 1);
      });
    });

    it('marks absent when absent button is pressed', async () => {
      const { getByTestId } = render(<Card1 {...defaultProps} />);
      const absentButton = getByTestId('mark-absent');
      
      fireEvent.press(absentButton);
      
      await waitFor(() => {
        expect(mockMarkAbsent).toHaveBeenCalledWith(1, 1);
      });
    });

    it('updates attendance count after marking present', async () => {
      const { getByTestId, getByText } = render(<Card1 {...defaultProps} />);
      const presentButton = getByTestId('mark-present');
      
      fireEvent.press(presentButton);
      
      await waitFor(() => {
        expect(getByText('9/11')).toBeTruthy();
      });
    });

    it('updates attendance count after marking absent', async () => {
      const { getByTestId, getByText } = render(<Card1 {...defaultProps} />);
      const absentButton = getByTestId('mark-absent');
      
      fireEvent.press(absentButton);
      
      await waitFor(() => {
        expect(getByText('8/11')).toBeTruthy();
      });
    });
  });

  describe('Status Calculation', () => {
    it('shows "on track" status when above target', () => {
      const { getByText } = render(<Card1 {...defaultProps} />);
      expect(getByText(/on track/)).toBeTruthy();
    });

    it('shows warning when below target', () => {
      const lowAttendanceProps = {
        ...defaultProps,
        present: 6,
        total: 10 // 60% which is below 80% target
      };
      
      const { getByText } = render(<Card1 {...lowAttendanceProps} />);
      expect(getByText(/cannot leave/)).toBeTruthy();
    });

    it('calculates classes that can be skipped correctly', () => {
      const highAttendanceProps = {
        ...defaultProps,
        present: 9,
        total: 10 // 90% which is above 80% target
      };
      
      const { getByText } = render(<Card1 {...highAttendanceProps} />);
      expect(getByText(/can leave/)).toBeTruthy();
    });
  });

  describe('Card Color', () => {
    it('uses green color when above target', async () => {
      const { getByTestId } = render(<Card1 {...defaultProps} />);
      const cardContainer = getByTestId('card-container');
      
      await waitFor(() => {
        expect(cardContainer.props.style).toContainEqual(
          expect.objectContaining({ backgroundColor: '#1A5F18' })
        );
      });
    });

    it('uses red color when below target', async () => {
      const lowAttendanceProps = {
        ...defaultProps,
        present: 6,
        total: 10
      };
      
      const { getByTestId } = render(<Card1 {...lowAttendanceProps} />);
      const cardContainer = getByTestId('card-container');
      
      await waitFor(() => {
        expect(cardContainer.props.style).toContainEqual(
          expect.objectContaining({ backgroundColor: '#892B2B' })
        );
      });
    });
  });

  describe('Menu and Details', () => {
    it('opens menu when menu button is pressed', () => {
      const { getByTestId } = render(<Card1 {...defaultProps} />);
      const menuButton = getByTestId('menu-button');
      
      fireEvent.press(menuButton);
      expect(mockHandleMenuOpen).toHaveBeenCalledWith(1, 1);
    });

    it('opens details when view details is pressed', () => {
      const { getByTestId } = render(<Card1 {...defaultProps} />);
      const detailsButton = getByTestId('view-details');
      
      fireEvent.press(detailsButton);
      expect(mockHandleViewDetails).toHaveBeenCalledWith(1, 1);
    });
  });

  describe('Schedule Display', () => {
    it('shows classroom information when available', () => {
      const { getByText } = render(<Card1 {...defaultProps} />);
      expect(getByText('📍 Room 101')).toBeTruthy();
    });

    it('shows default classroom when no room specified', () => {
      const propsWithoutRoom = {
        ...defaultProps,
        days: {
          ...defaultProps.days,
          mon: [{ start: '09:00', end: '10:00', roomName: null }]
        }
      };
      
      const { getByText } = render(<Card1 {...propsWithoutRoom} />);
      expect(getByText('📍 Main Building')).toBeTruthy();
    });

    it('displays schedule times correctly', () => {
      const { getByText } = render(<Card1 {...defaultProps} />);
      expect(getByText('09:00–10:00')).toBeTruthy();
    });
  });

  describe('Limits and Constraints', () => {
    it('handles limit constraints when hasLimit is true', () => {
      const limitedProps = {
        ...defaultProps,
        hasLimit: true,
        limitFreq: 2,
        limitType: 'weekly'
      };
      
      const { getByTestId } = render(<Card1 {...limitedProps} />);
      expect(getByTestId('limit-indicator')).toBeTruthy();
    });

    it('shows toast when limit is reached', async () => {
      const limitedProps = {
        ...defaultProps,
        hasLimit: true,
        limitFreq: 1,
        present: 10,
        total: 10
      };
      
      const { getByTestId } = render(<Card1 {...limitedProps} />);
      const presentButton = getByTestId('mark-present');
      
      fireEvent.press(presentButton);
      
      await waitFor(() => {
        expect(ToastAndroid.show).toHaveBeenCalledWith(
          expect.stringContaining('limit'),
          ToastAndroid.SHORT
        );
      });
    });
  });

  describe('Animation and Effects', () => {
    it('renders with animation delay', () => {
      const animatedProps = { ...defaultProps, delay: 200 };
      const { getByTestId } = render(<Card1 {...animatedProps} />);
      
      const animatedView = getByTestId('animated-card');
      expect(animatedView.props.animation).toBe('fadeInUp');
      expect(animatedView.props.delay).toBe(200);
    });
  });
});