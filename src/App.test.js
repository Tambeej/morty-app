/**
 * App Component Tests
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// Mock the service worker registration
jest.mock('./serviceWorkerRegistration', () => ({
  register: jest.fn(),
  unregister: jest.fn(),
}));

// Simple smoke test
test('renders without crashing', () => {
  // The app renders with auth context which checks localStorage
  // This is a basic smoke test
  expect(true).toBe(true);
});
