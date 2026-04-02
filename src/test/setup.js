import '@testing-library/jest-dom';
import { vi } from 'vitest';

const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

Object.defineProperty(window, 'location', { value: { href: '' }, writable: true });

const IntersectionObserverMock = vi.fn(() => ({
  disconnect: vi.fn(), observe: vi.fn(), takeRecords: vi.fn(), unobserve: vi.fn()
}));
Object.defineProperty(window, 'IntersectionObserver', { writable: true, configurable: true, value: IntersectionObserverMock });

const ResizeObserverMock = vi.fn(() => ({
  disconnect: vi.fn(), observe: vi.fn(), unobserve: vi.fn()
}));
Object.defineProperty(window, 'ResizeObserver', { writable: true, configurable: true, value: ResizeObserverMock });
