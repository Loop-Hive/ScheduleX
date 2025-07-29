import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Calendar from '../../../src/components/Calendar';

describe('Calendar Component', () => {
  const mockSetSelectedDate = jest.fn();
  const mockSetCurrentMonth = jest.fn();
  
  const defaultProps = {
    selectedDate: new Date(2024, 0, 15),
    setSelectedDate: mockSetSelectedDate,
    markedArr: [
      { date: '2024-01-10', type: 'present' },
      { date: '2024-01-20', type: 'absent' }
    ],
    currentMonth: new Date(2024, 0, 1),
    setCurrentMonth: mockSetCurrentMonth
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with default props', () => {
    const { getByText } = render(<Calendar {...defaultProps} />);
    expect(getByText('January 2024')).toBeTruthy();
  });

  it('displays days of the week headers', () => {
    const { getByText } = render(<Calendar {...defaultProps} />);
    expect(getByText('Sun')).toBeTruthy();
    expect(getByText('Mon')).toBeTruthy();
    expect(getByText('Tue')).toBeTruthy();
    expect(getByText('Wed')).toBeTruthy();
    expect(getByText('Thu')).toBeTruthy();
    expect(getByText('Fri')).toBeTruthy();
    expect(getByText('Sat')).toBeTruthy();
  });

  it('handles date selection', () => {
    const { getByText } = render(<Calendar {...defaultProps} />);
    const dateButton = getByText('20');
    fireEvent.press(dateButton);
    expect(mockSetSelectedDate).toHaveBeenCalledWith(new Date(2024, 0, 20));
  });

  it('navigates to previous month', () => {
    const { getByTestId } = render(<Calendar {...defaultProps} />);
    const prevButton = getByTestId('prev-month');
    fireEvent.press(prevButton);
    expect(mockSetCurrentMonth).toHaveBeenCalledWith(new Date(2023, 11, 1));
  });

  it('navigates to next month', () => {
    const { getByTestId } = render(<Calendar {...defaultProps} />);
    const nextButton = getByTestId('next-month');
    fireEvent.press(nextButton);
    expect(mockSetCurrentMonth).toHaveBeenCalledWith(new Date(2024, 1, 1));
  });

  it('highlights marked dates', () => {
    const { getByText } = render(<Calendar {...defaultProps} />);
    const markedDate = getByText('10');
    expect(markedDate.props.style).toMatchObject({ color: expect.any(String) });
  });

  it('identifies today correctly', () => {
    const today = new Date();
    const todayProps = {
      ...defaultProps,
      selectedDate: today,
      currentMonth: today
    };
    
    const { getByText } = render(<Calendar {...todayProps} />);
    const todayElement = getByText(today.getDate().toString());
    expect(todayElement).toBeTruthy();
  });

  it('handles swipe gestures for month navigation', () => {
    const { getByTestId } = render(<Calendar {...defaultProps} />);
    const gestureHandler = getByTestId('calendar-gesture');
    
    fireEvent(gestureHandler, 'onSwipeLeft');
    expect(mockSetCurrentMonth).toHaveBeenCalledWith(new Date(2024, 1, 1));
    
    fireEvent(gestureHandler, 'onSwipeRight');
    expect(mockSetCurrentMonth).toHaveBeenCalledWith(new Date(2023, 11, 1));
  });

  it('renders empty calendar for month without marked dates', () => {
    const propsWithoutMarks = {
      ...defaultProps,
      markedArr: []
    };
    
    const { queryByText } = render(<Calendar {...propsWithoutMarks} />);
    expect(queryByText('No events')).toBeFalsy();
  });
});