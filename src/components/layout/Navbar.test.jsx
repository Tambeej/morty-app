import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../i18n';
import Navbar from './Navbar';

// Mock AuthContext
vi.mock('../../context/AuthContext.jsx', () => ({
  useAuth: () => ({
    user: { email: 'test@example.com' }
  })
}));

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock document.documentElement
Object.defineProperty(document, 'documentElement', {
  value: {
    dir: '',
    lang: ''
  },
  writable: true
});

describe('Navbar Language Toggle', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset document element
    document.documentElement.dir = '';
    document.documentElement.lang = '';
    // Reset localStorage
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
  });

  it('renders language toggle button with correct initial text', () => {
    render(
      <I18nextProvider i18n={i18n}>
        <Navbar />
      </I18nextProvider>
    );
    // Assuming initial language is 'en', button should show 'עברית'
    expect(screen.getByText('עברית')).toBeInTheDocument();
  });

  it('toggles language from en to he on button click', async () => {
    // Set initial language to 'en'
    await i18n.changeLanguage('en');

    render(
      <I18nextProvider i18n={i18n}>
        <Navbar />
      </I18nextProvider>
    );

    const toggleButton = screen.getByText('עברית');
    fireEvent.click(toggleButton);

    // Wait for language change
    await new Promise(resolve => setTimeout(resolve, 100));

    // Check that changeLanguage was called with 'he'
    expect(i18n.changeLanguage).toHaveBeenCalledWith('he');

    // Check that document direction and lang are set
    expect(document.documentElement.dir).toBe('rtl');
    expect(document.documentElement.lang).toBe('he');
  });

  it('toggles language from he to en on button click', async () => {
    // Set initial language to 'he'
    await i18n.changeLanguage('he');

    render(
      <I18nextProvider i18n={i18n}>
        <Navbar />
      </I18nextProvider>
    );

    const toggleButton = screen.getByText('EN');
    fireEvent.click(toggleButton);

    // Wait for language change
    await new Promise(resolve => setTimeout(resolve, 100));

    // Check that changeLanguage was called with 'en'
    expect(i18n.changeLanguage).toHaveBeenCalledWith('en');

    // Check that document direction and lang are set
    expect(document.documentElement.dir).toBe('ltr');
    expect(document.documentElement.lang).toBe('en');
  });

  it('persists language choice in localStorage', async () => {
    render(
      <I18nextProvider i18n={i18n}>
        <Navbar />
      </I18nextProvider>
    );

    const toggleButton = screen.getByText('עברית');
    fireEvent.click(toggleButton);

    // Wait for language change
    await new Promise(resolve => setTimeout(resolve, 100));

    // Check that localStorage.setItem was called
    expect(localStorageMock.setItem).toHaveBeenCalledWith('i18nextLng', 'he');
  });

  it('loads language from localStorage on initialization', () => {
    localStorageMock.getItem.mockReturnValue('he');

    render(
      <I18nextProvider i18n={i18n}>
        <Navbar />
      </I18nextProvider>
    );

    // The button should show 'EN' since current language is 'he'
    expect(screen.getByText('EN')).toBeInTheDocument();
  });

  it('updates button text after language change', async () => {
    render(
      <I18nextProvider i18n={i18n}>
        <Navbar />
      </I18nextProvider>
    );

    expect(screen.getByText('עברית')).toBeInTheDocument();

    const toggleButton = screen.getByText('עברית');
    fireEvent.click(toggleButton);

    // Wait for re-render
    await new Promise(resolve => setTimeout(resolve, 100));

    // After toggle, button should show 'EN'
    expect(screen.getByText('EN')).toBeInTheDocument();
  });

  it('handles RTL direction for Hebrew', async () => {
    await i18n.changeLanguage('he');

    render(
      <I18nextProvider i18n={i18n}>
        <Navbar />
      </I18nextProvider>
    );

    // Check initial RTL
    expect(document.documentElement.dir).toBe('rtl');
    expect(document.documentElement.lang).toBe('he');

    // Toggle back to LTR
    const toggleButton = screen.getByText('EN');
    fireEvent.click(toggleButton);

    await new Promise(resolve => setTimeout(resolve, 100));

    expect(document.documentElement.dir).toBe('ltr');
    expect(document.documentElement.lang).toBe('en');
  });

  it('maintains accessibility with aria-label', () => {
    render(
      <I18nextProvider i18n={i18n}>
        <Navbar />
      </I18nextProvider>
    );

    const toggleButton = screen.getByLabelText('Toggle language');
    expect(toggleButton).toBeInTheDocument();
  });
});