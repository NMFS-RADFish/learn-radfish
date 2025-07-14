import { useState, useEffect, useCallback } from "react";
import { useApplication } from "@nmfs-radfish/react-radfish";
import { formatToYYYYMMDD, STORE_NAMES, COLLECTION_NAMES } from "../utils";

/**
 * Custom hook for trip data operations
 * Handles loading, creating, and updating trips with RADFish
 * 
 * @param {string} tripId - The ID of the trip to manage
 * @param {Function} onError - Callback function to handle errors
 * @param {Object} options - Configuration options
 * @param {boolean} options.loadOnMount - Whether to load trip data on mount (default: true)
 * @param {string[]} options.formatFields - Fields to format for display (default: [])
 * 
 * @returns {Object} Trip data and operations
 */
export const useTripData = (tripId, onError, options = {}) => {
  const { loadOnMount = true, formatFields = [] } = options;
  const app = useApplication();
  
  // State
  const [trip, setTrip] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  /**
   * Load trip data from RADFish
   */
  const loadTrip = useCallback(async () => {
    if (!app || !tripId) {
      setIsLoading(false);
      if (!tripId && onError) {
        onError("No trip ID provided");
      }
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Get the trip form collection
      const tripStore = app.stores[STORE_NAMES.TRIP];
      const Form = tripStore.getCollection(COLLECTION_NAMES.FORM);
      
      // Find the trip by ID
      const existingTrips = await Form.find({ id: tripId });
      
      if (existingTrips.length > 0) {
        const tripData = existingTrips[0];
        
        // Apply field formatting if specified
        const formattedTrip = { ...tripData };
        formatFields.forEach(field => {
          if (formattedTrip[field]) {
            formattedTrip[field] = formatToYYYYMMDD(formattedTrip[field]);
          }
        });
        
        setTrip(formattedTrip);
      } else {
        const errorMessage = `Trip with ID ${tripId} not found`;
        setError(errorMessage);
        if (onError) {
          onError(errorMessage);
        }
      }
    } catch (err) {
      console.error("Error loading trip:", err);
      setError("Failed to load trip data");
      if (onError) {
        onError(err);
      }
    } finally {
      setIsLoading(false);
    }
  }, [app, tripId, onError, formatFields]);
  
  /**
   * Update trip data in RADFish
   * @param {Object} updateData - Data to update
   * @returns {boolean} Success status
   */
  const updateTrip = async (updateData) => {
    if (!app || !tripId) {
      console.error("Cannot update trip: missing app or tripId");
      return false;
    }
    
    try {
      const tripStore = app.stores[STORE_NAMES.TRIP];
      const Form = tripStore.getCollection(COLLECTION_NAMES.FORM);
      
      // Update the trip in RADFish
      await Form.update({
        id: tripId,
        ...updateData
      });
      
      // Update local state
      setTrip(prev => prev ? { ...prev, ...updateData } : null);
      
      return true;
    } catch (err) {
      console.error("Error updating trip:", err, "Trip ID:", tripId);
      setError("Failed to update trip");
      return false;
    }
  };
  
  /**
   * Create a new trip in RADFish
   * @param {Object} tripData - Trip data to create
   * @returns {string|null} Created trip ID or null if failed
   */
  const createTrip = async (tripData) => {
    if (!app) {
      console.error("Cannot create trip: missing app");
      return null;
    }
    
    try {
      const tripStore = app.stores[STORE_NAMES.TRIP];
      const Form = tripStore.getCollection(COLLECTION_NAMES.FORM);
      
      // Generate new trip ID
      const newTripId = crypto.randomUUID();
      
      // Create the trip in RADFish
      const newTripData = {
        id: newTripId,
        ...tripData,
        createdAt: new Date().toISOString(),
      };
      
      await Form.create(newTripData);
      
      // Update local state
      setTrip(newTripData);
      
      return newTripId;
    } catch (err) {
      console.error("Error creating trip:", err);
      setError("Failed to create trip");
      return null;
    }
  };
  
  // Load trip on mount if enabled
  useEffect(() => {
    if (loadOnMount && tripId) {
      loadTrip();
    }
  }, [loadOnMount, tripId]); // eslint-disable-line react-hooks/exhaustive-deps
  
  return {
    // State
    trip,
    isLoading,
    
    // Operations
    updateTrip,
    createTrip
  };
}; 