import { useNavigate, useLocation } from "react-router-dom";

/**
 * Custom hook to handle trip navigation state
 * Extracts tripId from location state and provides navigation utilities
 * 
 * @returns {Object} Navigation utilities and tripId
 */
export const useTripNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Extract tripId from location state if it exists
  const tripId = location.state?.tripId;
  
  /**
   * Navigate to a route with tripId in state
   * @param {string} path - The route to navigate to
   * @param {string} tripId - The trip ID to pass in state
   * @param {Object} additionalState - Any additional state to pass
   */
  const navigateWithTripId = (path, tripId, additionalState = {}) => {
    navigate(path, { 
      state: { 
        tripId, 
        ...additionalState 
      } 
    });
  };
  
  /**
   * Navigate to home page
   */
  const navigateHome = () => {
    navigate("/");
  };
  
  /**
   * Navigate back with tripId preserved
   * @param {string} path - The route to navigate back to
   * @param {string} tripId - The trip ID to preserve
   */
  const navigateBack = (path, tripId) => {
    navigateWithTripId(path, tripId);
  };
  
  return {
    navigate,
    location,
    tripId,
    navigateWithTripId,
    navigateHome,
    navigateBack
  };
}; 