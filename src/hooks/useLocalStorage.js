/**
 * useLocalStorage hook
 * Syncs state with localStorage for persistence across page reloads.
 *
 * @param {string} key - localStorage key
 * @param {*} initialValue - Default value if key doesn't exist
 * @returns {[*, Function]} [storedValue, setValue]
 */
import { useState, useCallback } from 'react';

export const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        localStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (err) {
        console.error(`Failed to set localStorage key "${key}":`, err);
      }
    },
    [key, storedValue]
  );

  return [storedValue, setValue];
};

export default useLocalStorage;
