import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import TimePicker from '../../../src/components/TimePicker';

jest.mock('@react-native-community/datetimepicker', () => {
  return jest.fn().mockImplementation(({ onChange, value }) => {
    const MockDateTimePicker = require('react-native').View;
    return (
      <MockDateTimePicker
        testID="datetime-picker"
        onPress={() => {
          const newTime = new Date(value);
          newTime.setHours(14, 30);
          onChange({ type: 'set' }, newTime);
        }}
      />
    );
  });
});

describe('TimePicker Component', () => {
  const mockChangeIsAM = jest.fn();
  const mockChangeTimeString = jest.fn();
  
  const defaultProps = {
    timeString: '12:00',
    isAM: true,
    changeIsAM: mockChangeIsAM,
    changeTimeString: mockChangeTimeString
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders time display correctly', () => {
    const { getByText } = render(<TimePicker {...defaultProps} />);
    expect(getByText('12:00 AM')).toBeTruthy();
  });

  it('displays PM time correctly', () => {
    const pmProps = { ...defaultProps, isAM: false };
    const { getByText } = render(<TimePicker {...pmProps} />);
    expect(getByText('12:00 PM')).toBeTruthy();
  });

  it('shows datetime picker when pressed', () => {
    const { getByText, queryByTestId } = render(<TimePicker {...defaultProps} />);
    
    expect(queryByTestId('datetime-picker')).toBeFalsy();
    
    fireEvent.press(getByText('12:00 AM'));
    expect(queryByTestId('datetime-picker')).toBeTruthy();
  });

  it('handles time change correctly', async () => {
    const { getByText, getByTestId } = render(<TimePicker {...defaultProps} />);
    
    // Open picker
    fireEvent.press(getByText('12:00 AM'));
    
    // Simulate time selection
    await act(async () => {
      fireEvent.press(getByTestId('datetime-picker'));
    });
    
    expect(mockChangeIsAM).toHaveBeenCalledWith(false);
    expect(mockChangeTimeString).toHaveBeenCalledWith('02:30');
  });

  it('converts 24-hour to 12-hour format correctly', () => {
    const { getByText } = render(
      <TimePicker 
        timeString="15:45" 
        isAM={false} 
        changeIsAM={mockChangeIsAM}
        changeTimeString={mockChangeTimeString}
      />
    );
    
    expect(getByText('15:45 PM')).toBeTruthy();
  });

  it('handles midnight time correctly', () => {
    const midnightProps = {
      timeString: '00:00',
      isAM: true,
      changeIsAM: mockChangeIsAM,
      changeTimeString: mockChangeTimeString
    };
    
    const { getByText } = render(<TimePicker {...midnightProps} />);
    expect(getByText('00:00 AM')).toBeTruthy();
  });

  it('handles noon time correctly', () => {
    const noonProps = {
      timeString: '12:00',
      isAM: false,
      changeIsAM: mockChangeIsAM,
      changeTimeString: mockChangeTimeString
    };
    
    const { getByText } = render(<TimePicker {...noonProps} />);
    expect(getByText('12:00 PM')).toBeTruthy();
  });

  it('pads time string correctly', () => {
    const { getByText } = render(
      <TimePicker 
        timeString="9:5" 
        isAM={true} 
        changeIsAM={mockChangeIsAM}
        changeTimeString={mockChangeTimeString}
      />
    );
    
    expect(getByText('09:05 AM')).toBeTruthy();
  });
});