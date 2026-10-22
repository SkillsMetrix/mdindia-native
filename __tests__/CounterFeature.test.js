import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { calculateNextValue } from '../../counterMath';
import CounterFeature from '../../CounterFeature';


// ==========================================
// 1. UNIT TESTING (Testing Isolated Logic)
// ==========================================
describe('Unit Test: calculateNextValue logic calculations', () => {
  it('should correctly add steps when multiplyMode is false', () => {
    expect(calculateNextValue(5, 2, false)).toBe(7);
    expect(calculateNextValue(-2, 2, false)).toBe(0);
  });

  it('should correctly multiply steps when multiplyMode is true', () => {
    expect(calculateNextValue(3, 2, true)).toBe(6);
  });
});

// ==========================================
// 2. SNAPSHOT TESTING (Structural Integrity Check)
// ==========================================
describe('Snapshot Test: CounterFeature Layout', () => {
  it('matches the previous HTML/Component tree layout footprint', async () => {
    // Awaiting the asynchronous rendering cycle of RNTL v14+ / React 19
    const { toJSON } = await render(<CounterFeature />);
    expect(toJSON()).toMatchSnapshot();
  });
});

// ==========================================
// 3. BEHAVIOR & INTEGRATION TESTING (RNTL Basics)
// ==========================================
describe('Behavior & Integration Tests: Counter Workflows', () => {
  
  it('should initialize with standard default layout states (render basics)', async () => {
    const { getByTestId, getByText } = await render(<CounterFeature />);
    
    // Using Case-Insensitive Regex to prevent string mismatch failures
    expect(getByText(/Testing Suite/i)).toBeTruthy();
    expect(getByTestId('counter-value').props.children).toContain(0);
  });

  it('updates count label successfully via fireEvent interaction (Behavior Test)', async () => {
    const { getByTestId } = await render(<CounterFeature />);
    const incrementButton = getByTestId('increment-button');
    const displayVal = getByTestId('counter-value');

    // Awaiting interactions to let the state update settle asynchronously
    await fireEvent.press(incrementButton);
    expect(displayVal.props.children).toContain(2); 

    await fireEvent.press(incrementButton);
    expect(displayVal.props.children).toContain(4);
  });

  it('connects state changes and pure logic helpers flawlessly (Integration Test)', async () => {
    const { getByTestId } = await render(<CounterFeature />);
    const switchElement = getByTestId('mode-switch');
    const incrementButton = getByTestId('increment-button');
    const displayVal = getByTestId('counter-value');

    // Toggle switch to active (multiply mode)
    await fireEvent(switchElement, 'onValueChange', true); 
    expect(displayVal.props.children).toContain(1); // Component baseline safety check

    // Test the integration between UI actions -> local component state -> utility math module
    await fireEvent.press(incrementButton); 
    expect(displayVal.props.children).toContain(2);

    await fireEvent.press(incrementButton); 
    expect(displayVal.props.children).toContain(4);
  });
});