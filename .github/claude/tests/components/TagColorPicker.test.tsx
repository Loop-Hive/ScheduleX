import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import TagColorPicker from '../../../src/components/TagColorPicker';

describe('TagColorPicker Component', () => {
  const mockSetSelectedColor = jest.fn();
  
  const defaultProps = {
    selectedColor: '#F93827',
    setSelectedColor: mockSetSelectedColor
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all available colors', () => {
    const { getAllByRole } = render(<TagColorPicker {...defaultProps} />);
    const colorButtons = getAllByRole('button');
    expect(colorButtons).toHaveLength(11); // Based on colors array in component
  });

  it('highlights selected color', () => {
    const { getByTestId } = render(<TagColorPicker {...defaultProps} />);
    const selectedColorButton = getByTestId('color-#F93827');
    expect(selectedColorButton.props.style).toContainEqual(
      expect.objectContaining({ borderColor: '#868686' })
    );
  });

  it('calls setSelectedColor when color is pressed', () => {
    const { getByTestId } = render(<TagColorPicker {...defaultProps} />);
    const colorButton = getByTestId('color-#FF5733');
    
    fireEvent.press(colorButton);
    expect(mockSetSelectedColor).toHaveBeenCalledWith('#FF5733');
  });

  it('renders colors with correct background', () => {
    const { getByTestId } = render(<TagColorPicker {...defaultProps} />);
    const whiteColorButton = getByTestId('color-#FFFFFF');
    
    expect(whiteColorButton.props.style).toContainEqual(
      expect.objectContaining({ backgroundColor: '#FFFFFF' })
    );
  });

  it('handles color selection change', () => {
    const { rerender, getByTestId } = render(<TagColorPicker {...defaultProps} />);
    
    // Select new color
    fireEvent.press(getByTestId('color-#16C47F'));
    expect(mockSetSelectedColor).toHaveBeenCalledWith('#16C47F');
    
    // Re-render with new selected color
    rerender(
      <TagColorPicker 
        selectedColor="#16C47F" 
        setSelectedColor={mockSetSelectedColor} 
      />
    );
    
    const newSelectedButton = getByTestId('color-#16C47F');
    expect(newSelectedButton.props.style).toContainEqual(
      expect.objectContaining({ borderColor: '#868686' })
    );
  });

  it('renders with proper accessibility labels', () => {
    const { getAllByRole } = render(<TagColorPicker {...defaultProps} />);
    const colorButtons = getAllByRole('button');
    
    colorButtons.forEach(button => {
      expect(button.props.accessibilityRole).toBe('button');
    });
  });
});