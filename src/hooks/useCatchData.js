import { useState, useEffect } from "react";
import { useApplication } from "@nmfs-radfish/react-radfish";
import { STORE_NAMES, COLLECTION_NAMES } from "../utils";

/**
 * Custom hook for managing catch data in RADFish
 * Provides loading, creating, and state management for catches within a trip
 * 
 * @param {string} tripId - ID of the trip to load catches for
 * @param {Function} onError - Callback function called when errors occur
 * @returns {Object} Catch data and operations
 */
export const useCatchData = (tripId, onError = () => {}) => {
  const app = useApplication();
  
  // --- State ---
  const [catches, setCatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  /**
   * Load all catches for the current trip
   * Handles cases where the Catch collection may not exist yet
   */
  const loadCatches = async () => {
    if (!app || !tripId) {
      setIsLoading(false);
      if (!tripId) {
        console.warn("No trip ID provided for loading catches");
        onError(new Error("No trip ID provided"));
      }
      return;
    }
    
    setIsLoading(true);
    
    try {
      // First verify the trip exists
      const tripStore = app.stores[STORE_NAMES.TRIP];
      const Form = tripStore.getCollection(COLLECTION_NAMES.FORM);
      const existingTrips = await Form.find({ id: tripId });
      
      if (existingTrips.length === 0) {
        console.warn("Trip not found");
        onError(new Error("Trip not found"));
        return;
      }
      
      // Load catches for this trip
      try {
        const Catch = tripStore.getCollection(COLLECTION_NAMES.CATCH);
        const existingCatches = await Catch.find({ tripId: tripId });
        
        if (existingCatches.length > 0) {
          // Sort catches by creation date (most recent first)
          const sortedCatches = existingCatches.sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          );
          setCatches(sortedCatches);
        } else {
          setCatches([]);
        }
      } catch (catchCollectionError) {
        // Catch collection doesn't exist yet - this is expected in early lessons
        console.warn("Catch collection not yet defined - proceeding with empty catches list");
        setCatches([]);
      }
    } catch (err) {
      console.error("Error loading catches:", err);
      onError(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Add a new catch to the trip
   * @param {Object} catchData - Raw catch data from form
   * @returns {boolean} Success status
   */
  const addCatch = async (catchData) => {
    if (!app || !tripId) {
      console.error("Cannot add catch: missing app or tripId");
      return false;
    }
    
    try {
      const Catch = app.stores[STORE_NAMES.TRIP].getCollection(COLLECTION_NAMES.CATCH);
      
      // Format the data for storage
      const newCatchData = {
        ...catchData,
        id: crypto.randomUUID(),
        tripId: tripId,
        weight: Number(catchData.weight),
        length: Number(catchData.length),
        latitude: catchData.latitude ? Number(catchData.latitude) : undefined,
        longitude: catchData.longitude ? Number(catchData.longitude) : undefined,
        createdAt: new Date().toISOString(),
      };
      
      // Save to RADFish store
      await Catch.create(newCatchData);
      
      // Update local state (add to beginning of array for most recent first)
      setCatches(prev => [newCatchData, ...prev]);
      
      return true;
    } catch (err) {
      console.error("Error adding catch:", err);
      onError(err);
      return false;
    }
  };
  
  // Load catches when hook is first used or tripId changes
  useEffect(() => {
    if (tripId) {
      loadCatches();
    }
  }, [app, tripId]); // eslint-disable-line react-hooks/exhaustive-deps
  
  return {
    catches,
    isLoading,
    addCatch,
    setCatches, // For optimistic updates in the component
  };
};