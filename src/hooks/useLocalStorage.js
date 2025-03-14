/**
 * Custom hook for localStorage management
 * @returns {Object} Object containing setItem, getItem, and removeItem methods
 */
export function useLocalStorage() {
  /**
   * Set an item in localStorage
   * @param {string} key - The key to store the value under
   * @param {any} value - The value to store
   */
  const setItem = (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  };

  /**
   * Get an item from localStorage
   * @param {string} key - The key to retrieve the value for
   * @returns {any} The stored value or null if not found
   */
  const getItem = (key) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Error getting from localStorage:', error);
      return null;
    }
  };

  /**
   * Remove an item from localStorage
   * @param {string} key - The key to remove
   */
  const removeItem = (key) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  };

  return { setItem, getItem, removeItem };
}