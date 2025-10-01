import { render, screen, fireEvent } from '@testing-library/react';
import OTPInput from './OTPInput';

describe('OTPInput Component', () => {
  test('renders 6 input boxes by default', () => {
    render(<OTPInput />);
    const inputs = screen.getAllByRole('textbox');
    expect(inputs).toHaveLength(6);
  });

  test('accepts only numeric input', () => {
    const onChange = jest.fn();
    render(<OTPInput onChange={onChange} />);
    const firstInput = screen.getAllByRole('textbox')[0];
    
    fireEvent.change(firstInput, { target: { value: 'a' } });
    expect(onChange).not.toHaveBeenCalled();
    
    fireEvent.change(firstInput, { target: { value: '1' } });
    expect(onChange).toHaveBeenCalledWith('1');
  });

  test('auto-focuses next input when digit is entered', () => {
    render(<OTPInput />);
    const inputs = screen.getAllByRole('textbox');
    
    fireEvent.change(inputs[0], { target: { value: '1' } });
    expect(inputs[1]).toHaveFocus();
  });

  test('handles backspace correctly', () => {
    const onChange = jest.fn();
    render(<OTPInput onChange={onChange} />);
    const inputs = screen.getAllByRole('textbox');
    
    // Fill first input
    fireEvent.change(inputs[0], { target: { value: '1' } });
    
    // Focus second input and press backspace
    inputs[1].focus();
    fireEvent.keyDown(inputs[1], { key: 'Backspace' });
    
    // Should clear first input and focus it
    expect(inputs[0]).toHaveFocus();
  });

  test('calls onComplete when all digits are filled', () => {
    const onComplete = jest.fn();
    render(<OTPInput onComplete={onComplete} />);
    const inputs = screen.getAllByRole('textbox');
    
    // Fill all inputs
    inputs.forEach((input, index) => {
      fireEvent.change(input, { target: { value: (index + 1).toString() } });
    });
    
    expect(onComplete).toHaveBeenCalledWith('123456');
  });

  test('shows error state correctly', () => {
    render(<OTPInput error={true} />);
    const inputs = screen.getAllByRole('textbox');
    
    inputs.forEach(input => {
      expect(input).toHaveClass('border-red-500');
    });
  });

  test('handles paste correctly', () => {
    const onChange = jest.fn();
    render(<OTPInput onChange={onChange} />);
    const firstInput = screen.getAllByRole('textbox')[0];
    
    // Mock clipboard API
    Object.assign(navigator, {
      clipboard: {
        readText: () => Promise.resolve('123456')
      }
    });
    
    fireEvent.paste(firstInput, {
      clipboardData: {
        getData: () => '123456'
      }
    });
    
    expect(onChange).toHaveBeenCalledWith('123456');
  });
});
