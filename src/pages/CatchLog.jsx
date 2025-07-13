import "../index.css";

import React, { useState, useEffect } from "react";
import { useApplication } from "@nmfs-radfish/react-radfish";
import {
  Button,
  ErrorMessage,
  Form,
  FormGroup,
  Grid,
  GridContainer,
  Icon,
  Label,
  Select,
  StepIndicator,
  StepIndicatorStep,
  TextInput,
  TimePicker,
} from "@trussworks/react-uswds";
import { 
  validateNewCatch,
  validateRecordedCatch,
  validateAllCatches,
  FIELD_NAMES,
  SPECIES_OPTIONS,
  VALIDATION_RANGES,
  TIME_PICKER_CONFIG,
  STORE_NAMES,
  COLLECTION_NAMES
} from "../utils";
import { useTripNavigation, useTripData } from "../hooks";

function CatchLog() {
  const app = useApplication();
  const { tripId, navigateHome, navigateWithTripId } = useTripNavigation();
  
  // Trip data management (for verification)
  const { updateTrip } = useTripData(
    tripId,
    (error) => {
      console.warn("Trip loading error:", error);
      navigateHome();
    },
    { loadOnMount: false } // Don't load trip data, just verify existence
  );
  
  // Catch data state
  const [catches, setCatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for catch form reset key and recorded catch errors
  const [catchTimeKey, setCatchTimeKey] = useState(0);
  const [recordedCatchErrors, setRecordedCatchErrors] = useState({});
  
  // New catch form state
  const [currentCatch, setCurrentCatch] = useState({
    species: "",
    weight: "",
    length: "",
    latitude: "",
    longitude: "",
    time: "",
  });
  const [errors, setErrors] = useState({});
  
  // Handle input changes for new catch form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentCatch(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };
  
  // Handle time changes for new catch form
  const handleTimeChange = (time, fieldName = 'time') => {
    setCurrentCatch(prev => ({ ...prev, [fieldName]: time }));
    
    // Clear error for this field if it exists
    if (errors[fieldName]) {
      setErrors(prev => ({ ...prev, [fieldName]: undefined }));
    }
  };
  
  // Reset new catch form
  const resetForm = () => {
    setCurrentCatch({
      species: "",
      weight: "",
      length: "",
      latitude: "",
      longitude: "",
      time: "",
    });
    setErrors({});
  };
  
  // Handle new catch form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const validationErrors = validateNewCatch(currentCatch);
    setErrors(validationErrors);
    
    // Only proceed if no validation errors
    if (Object.keys(validationErrors).length === 0) {
      try {
        const success = await addCatch(currentCatch);
        
        if (success) {
          // Reset form and increment key to force TimePicker re-render
          resetForm();
          setCatchTimeKey(prevKey => prevKey + 1);
        } else {
          throw new Error("Failed to add catch");
        }
      } catch (error) {
        console.error("Error adding catch:", error);
      }
    }
  };
  
  /**
   * Load all catches for the current trip
   */
  const loadCatches = async () => {
    if (!app || !tripId) {
      setIsLoading(false);
      if (!tripId) {
        console.warn("No trip ID provided for loading catches");
        navigateHome();
      }
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // First verify the trip exists
      const tripStore = app.stores[STORE_NAMES.TRIP];
      const Form = tripStore.getCollection(COLLECTION_NAMES.FORM);
      const existingTrips = await Form.find({ id: tripId });
      
      if (existingTrips.length === 0) {
        setError("Trip not found");
        navigateHome();
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
      setError("Failed to load catches");
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Add a new catch to the trip
   * @param {Object} catchData - Catch data to add
   * @returns {boolean} Success status
   */
  const addCatch = async (catchData) => {
    if (!app || !tripId) {
      console.error("Cannot add catch: missing app or tripId");
      return false;
    }
    
    try {
      const Catch = app.stores[STORE_NAMES.TRIP].getCollection(COLLECTION_NAMES.CATCH);
      
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
      
      await Catch.create(newCatchData);
      
      // Update local state (add to beginning of array for most recent first)
      setCatches(prev => [newCatchData, ...prev]);
      
      return true;
    } catch (err) {
      console.error("Error adding catch:", err);
      setError("Failed to add catch");
      return false;
    }
  };
  
  /**
   * Update a specific catch
   * @param {number} index - Index of the catch in the catches array
   * @param {string} field - Field to update
   * @param {any} value - New value for the field
   * @returns {boolean} Success status
   */
  const updateCatch = async (index, field, value) => {
    if (!app || index < 0 || index >= catches.length) {
      console.error("Cannot update catch: invalid parameters");
      return false;
    }
    
    const catchToUpdate = catches[index];
    
    try {
      const Catch = app.stores[STORE_NAMES.TRIP].getCollection(COLLECTION_NAMES.CATCH);
      
      // Prepare data for update (ensure correct types)
      const updateData = { [field]: value };
      
      // Convert to number if it's a numeric field, handle empty string
      if (["weight", "length", "latitude", "longitude"].includes(field)) {
        updateData[field] = value === "" ? undefined : Number(value);
      }
      
      // Update in RADFish/IndexedDB
      await Catch.update({ id: catchToUpdate.id, ...updateData });
      
      // Optimistic UI update
      const updatedCatches = [...catches];
      updatedCatches[index] = { ...catchToUpdate, [field]: updateData[field] };
      setCatches(updatedCatches);
      
      return true;
    } catch (err) {
      console.error("Error updating catch:", err, "Catch ID:", catchToUpdate.id);
      setError("Failed to update catch");
      return false;
    }
  };
  
  /**
   * Delete a catch
   * @param {number} index - Index of the catch to delete
   * @param {boolean} skipConfirmation - Skip confirmation dialog (default: false)
   * @returns {boolean} Success status
   */
  const deleteCatch = async (index, skipConfirmation = false) => {
    if (index < 0 || index >= catches.length) {
      console.error("Cannot delete catch: invalid index");
      return false;
    }
    
    if (!skipConfirmation && !window.confirm("Are you sure you want to delete this catch?")) {
      return false;
    }
    
    const catchToDelete = catches[index];
    
    try {
      const Catch = app.stores[STORE_NAMES.TRIP].getCollection(COLLECTION_NAMES.CATCH);
      
      // Remove from RADFish/IndexedDB
      await Catch.delete(catchToDelete.id);
      
      // Update local state to remove from UI
      setCatches(prev => prev.filter((_, i) => i !== index));
      
      return true;
    } catch (err) {
      console.error("Error deleting catch:", err, "Catch ID:", catchToDelete.id);
      setError("Failed to delete catch");
      return false;
    }
  };
  
  // Load catches on mount
  useEffect(() => {
    if (tripId) {
      loadCatches();
    }
  }, [app, tripId]);
  
  // Handle recorded catch changes
  const handleRecordedCatchChange = async (index, field, value) => {
    const success = await updateCatch(index, field, value);
    
    if (!success) {
      console.error("Failed to update recorded catch");
    }
  };
  
  // Handle recorded catch time changes
  const handleRecordedTimeChange = async (index, time) => {
    const success = await updateCatch(index, "time", time);
    
    if (!success) {
      console.error("Failed to update recorded catch time");
    }
  };
  
  // Handle recorded catch deletion
  const handleDeleteCatch = async (index) => {
    const success = await deleteCatch(index);
    
    if (!success) {
      console.error("Failed to delete catch");
    }
  };
  
  // Handle main form submission (proceed to next step)
  const handleMainSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all recorded catches
    const recordedErrors = validateAllCatches(catches, validateRecordedCatch);
    setRecordedCatchErrors(recordedErrors);
    
    // Only proceed if there are no errors in the recorded catches list
    if (Object.keys(recordedErrors).length === 0) {
      try {
        // Update trip step
        const success = await updateTrip({ step: 3 });
        
        if (success) {
          navigateWithTripId("/end", tripId);
        } else {
          throw new Error("Failed to update trip step");
        }
      } catch (error) {
        console.error("Error updating trip step:", error, "Trip ID:", tripId);
      }
    } else {
      console.warn("Validation errors found in recorded catches. Cannot proceed.");
    }
  };
  
  // Show loading message while fetching data
  if (isLoading) {
    return <div className="padding-5 text-center">Loading catches...</div>;
  }
  
  return (
    <>
      <GridContainer className="padding-y-4 padding-x-0 width-full maxw-mobile-lg">
        <Grid row>
          <Grid col="fill">
            <div className="text-left">
              <div className="margin-top-4 border-bottom border-base-light padding-bottom-2">
                <StepIndicator
                  headingLevel="h4"
                  ofText="of"
                  stepText="Step"
                  className="usa-step-indicator margin-bottom-0"
                  showLabels={false}
                >
                  <StepIndicatorStep label="Start Trip" status="complete" />
                  <StepIndicatorStep label="Log Catch" status="current" />
                  <StepIndicatorStep label="End Trip" />
                  <StepIndicatorStep label="Review and Submit" />
                </StepIndicator>
              </div>
              
              {/* New Catch Entry Form Section */}
              <div className="width-full margin-y-0 margin-x-auto display-flex flex-column flex-align-start">
                <Form
                  onSubmit={handleSubmit}
                  large
                  className="margin-top-3 width-full"
                >
                  {/* Species Dropdown */}
                  <FormGroup>
                    <Label htmlFor="species" requiredMarker>
                      Species
                    </Label>
                    <Select
                      id="species"
                      name="species"
                      value={currentCatch.species}
                      onChange={handleInputChange}
                    >
                      <option value="">-Select-</option>
                      {SPECIES_OPTIONS.map((species) => (
                        <option key={species} value={species}>
                          {species}
                        </option>
                      ))}
                    </Select>
                  </FormGroup>
                  
                  {/* Weight & Length Inputs Row */}
                  <div className="display-flex gap-2 width-full">
                    <div className="flex-1">
                      <FormGroup error={errors.weight}>
                        <Label htmlFor="weight" error={errors.weight} requiredMarker>
                          Weight
                        </Label>
                        <span className="usa-hint display-block text-left">lbs</span>
                        <TextInput
                          id="weight"
                          name="weight"
                          type="number"
                          value={currentCatch.weight}
                          onChange={handleInputChange}
                          validationStatus={errors.weight ? "error" : undefined}
                          aria-describedby="weight-error-message"
                        />
                        <ErrorMessage id="weight-error-message" className="font-sans-2xs">
                          {errors.weight}
                        </ErrorMessage>
                      </FormGroup>
                    </div>
                    <div className="flex-1">
                      <FormGroup error={errors.length}>
                        <Label htmlFor="length" error={errors.length} requiredMarker>
                          Length
                        </Label>
                        <span className="usa-hint display-block text-left">inches</span>
                        <TextInput
                          id="length"
                          name="length"
                          type="number"
                          value={currentCatch.length}
                          onChange={handleInputChange}
                          validationStatus={errors.length ? "error" : undefined}
                          aria-describedby="length-error-message"
                        />
                        <ErrorMessage id="length-error-message" className="font-sans-2xs">
                          {errors.length}
                        </ErrorMessage>
                      </FormGroup>
                    </div>
                  </div>
                  
                  {/* Catch Time Input */}
                  <FormGroup error={errors.time}>
                    <Label htmlFor="catchTime" error={errors.time} className="input-time-label" requiredMarker>
                      Time
                    </Label>
                    <TimePicker
                      key={catchTimeKey}
                      id="catchTime"
                      name="time"
                      defaultValue={currentCatch.time}
                      onChange={handleTimeChange}
                      minTime={TIME_PICKER_CONFIG.MIN_TIME}
                      maxTime="23:30"
                      step={TIME_PICKER_CONFIG.STEP}
                      validationStatus={errors.time ? "error" : undefined}
                      className={errors.time ? "usa-input--error" : ""}
                      aria-describedby="time-error-message"
                    />
                    <ErrorMessage id="time-error-message" className="font-sans-2xs">
                      {errors.time}
                    </ErrorMessage>
                  </FormGroup>
                  
                  {/* Coordinate Inputs Row */}
                  <div className="display-flex gap-2 width-full">
                    <div className="flex-1">
                      <FormGroup error={errors.latitude}>
                        <Label htmlFor="latitude" error={errors.latitude}>
                          Latitude
                        </Label>
                        <span className="usa-hint display-block text-left">DD</span>
                        <TextInput
                          id="latitude"
                          name="latitude"
                          type="number"
                          value={currentCatch.latitude}
                          onChange={handleInputChange}
                          validationStatus={errors.latitude ? "error" : undefined}
                          aria-describedby="latitude-error-message"
                        />
                        <ErrorMessage id="latitude-error-message" className="font-sans-2xs">
                          {errors.latitude}
                        </ErrorMessage>
                      </FormGroup>
                    </div>
                    <div className="flex-1">
                      <FormGroup error={errors.longitude}>
                        <Label htmlFor="longitude" error={errors.longitude}>
                          Longitude
                        </Label>
                        <span className="usa-hint display-block text-left">DD</span>
                        <TextInput
                          id="longitude"
                          name="longitude"
                          type="number"
                          value={currentCatch.longitude}
                          onChange={handleInputChange}
                          validationStatus={errors.longitude ? "error" : undefined}
                          aria-describedby="longitude-error-message"
                        />
                        <ErrorMessage id="longitude-error-message" className="font-sans-2xs">
                          {errors.longitude}
                        </ErrorMessage>
                      </FormGroup>
                    </div>
                  </div>
                  
                  {/* Add Catch Button */}
                  <div className="display-flex flex-justify-start margin-top-1 margin-bottom-2">
                    <Button type="submit" className="width-full" accentStyle="cool">
                      Add Catch
                    </Button>
                  </div>
                </Form>
              </div>
              
              {/* Recorded Catches Section */}
              {catches.length > 0 && (
                <>
                  <div className="width-full border-top border-base-lighter padding-top-105 margin-top-105">
                    <h2 className="font-heading-lg margin-bottom-1">Recorded Catches</h2>
                    <div className="display-flex flex-column width-full">
                      {catches.map((catchItem, index) => {
                        const catchErrors = recordedCatchErrors[index] || {};
                        
                        return (
                          <div key={catchItem.id || index} className="padding-y-1 border-bottom border-base-lighter">
                            <div className="position-relative width-full">
                              <div className="position-absolute top-neg-105 right-0">
                                <Button
                                  type="button"
                                  unstyled
                                  onClick={() => handleDeleteCatch(index)}
                                  className="text-secondary hover:bg-base-lightest border-radius-sm padding-05 display-flex flex-align-center"
                                  aria-label="Delete this catch"
                                >
                                  Delete <Icon.Delete size={3} aria-hidden="true" />
                                </Button>
                              </div>
                              
                              {/* Species */}
                              <FormGroup error={catchErrors.species}>
                                <Label htmlFor={`recorded-species-${index}`} error={catchErrors.species} requiredMarker>
                                  Species
                                </Label>
                                <Select
                                  id={`recorded-species-${index}`}
                                  name="species"
                                  value={catchItem.species}
                                  className="margin-top-05 margin-bottom-0"
                                  onChange={(e) => handleRecordedCatchChange(index, "species", e.target.value)}
                                  validationStatus={catchErrors.species ? "error" : undefined}
                                  aria-describedby={`recorded-species-${index}-error-message`}
                                >
                                  <option value="">-Select-</option>
                                  {SPECIES_OPTIONS.map((species) => (
                                    <option key={species} value={species}>
                                      {species}
                                    </option>
                                  ))}
                                </Select>
                                <ErrorMessage id={`recorded-species-${index}-error-message`} className="font-sans-2xs">
                                  {catchErrors.species}
                                </ErrorMessage>
                              </FormGroup>
                              
                              {/* Weight & Length */}
                              <div className="display-flex gap-2 width-full">
                                <div className="flex-1">
                                  <FormGroup error={catchErrors.weight}>
                                    <Label htmlFor={`recorded-weight-${index}`} error={catchErrors.weight} requiredMarker>
                                      Weight
                                    </Label>
                                    <span className="usa-hint display-block text-left">lbs</span>
                                    <TextInput
                                      id={`recorded-weight-${index}`}
                                      name="weight"
                                      type="number"
                                      value={catchItem.weight}
                                      onChange={(e) => handleRecordedCatchChange(index, "weight", e.target.value)}
                                      validationStatus={catchErrors.weight ? "error" : undefined}
                                      aria-describedby={`recorded-weight-${index}-error-message`}
                                    />
                                    <ErrorMessage id={`recorded-weight-${index}-error-message`} className="font-sans-2xs">
                                      {catchErrors.weight}
                                    </ErrorMessage>
                                  </FormGroup>
                                </div>
                                <div className="flex-1">
                                  <FormGroup error={catchErrors.length}>
                                    <Label htmlFor={`recorded-length-${index}`} error={catchErrors.length} requiredMarker>
                                      Length
                                    </Label>
                                    <span className="usa-hint display-block text-left">inches</span>
                                    <TextInput
                                      id={`recorded-length-${index}`}
                                      name="length"
                                      type="number"
                                      value={catchItem.length}
                                      onChange={(e) => handleRecordedCatchChange(index, "length", e.target.value)}
                                      validationStatus={catchErrors.length ? "error" : undefined}
                                      aria-describedby={`recorded-length-${index}-error-message`}
                                    />
                                    <ErrorMessage id={`recorded-length-${index}-error-message`} className="font-sans-2xs">
                                      {catchErrors.length}
                                    </ErrorMessage>
                                  </FormGroup>
                                </div>
                              </div>
                              
                              {/* Time */}
                              <FormGroup error={catchErrors.time}>
                                <Label htmlFor={`recorded-time-${index}`} error={catchErrors.time} className="input-time-label" requiredMarker>
                                  Time
                                </Label>
                                <TimePicker
                                  id={`recorded-time-${index}`}
                                  name={`recorded-time-${index}`}
                                  defaultValue={catchItem.time}
                                  onChange={(time) => handleRecordedTimeChange(index, time)}
                                  minTime={TIME_PICKER_CONFIG.MIN_TIME}
                                  maxTime={TIME_PICKER_CONFIG.MAX_TIME}
                                  step={TIME_PICKER_CONFIG.STEP}
                                  className={catchErrors.time ? "usa-input--error" : ""}
                                  validationStatus={catchErrors.time ? "error" : undefined}
                                  aria-describedby={`recorded-time-${index}-error-message`}
                                />
                                <ErrorMessage id={`recorded-time-${index}-error-message`} className="font-sans-2xs">
                                  {catchErrors.time}
                                </ErrorMessage>
                              </FormGroup>
                              
                              {/* Coordinates */}
                              <div className="display-flex gap-2 width-full">
                                <div className="flex-1">
                                  <FormGroup error={catchErrors.latitude}>
                                    <Label htmlFor={`recorded-latitude-${index}`} error={catchErrors.latitude}>
                                      Latitude
                                    </Label>
                                    <span className="usa-hint display-block text-left">DD</span>
                                    <TextInput
                                      id={`recorded-latitude-${index}`}
                                      name="latitude"
                                      type="number"
                                      className="margin-top-05 margin-bottom-0"
                                      value={catchItem.latitude ?? ""}
                                      onChange={(e) => handleRecordedCatchChange(index, "latitude", e.target.value)}
                                      validationStatus={catchErrors.latitude ? "error" : undefined}
                                      aria-describedby={`recorded-latitude-${index}-error-message`}
                                    />
                                    <ErrorMessage id={`recorded-latitude-${index}-error-message`} className="font-sans-2xs">
                                      {catchErrors.latitude}
                                    </ErrorMessage>
                                  </FormGroup>
                                </div>
                                <div className="flex-1">
                                  <FormGroup error={catchErrors.longitude}>
                                    <Label htmlFor={`recorded-longitude-${index}`} error={catchErrors.longitude}>
                                      Longitude
                                    </Label>
                                    <span className="usa-hint display-block text-left">DD</span>
                                    <TextInput
                                      id={`recorded-longitude-${index}`}
                                      name="longitude"
                                      type="number"
                                      className="margin-top-05 margin-bottom-0"
                                      value={catchItem.longitude ?? ""}
                                      onChange={(e) => handleRecordedCatchChange(index, "longitude", e.target.value)}
                                      validationStatus={catchErrors.longitude ? "error" : undefined}
                                      aria-describedby={`recorded-longitude-${index}-error-message`}
                                    />
                                    <ErrorMessage id={`recorded-longitude-${index}-error-message`} className="font-sans-2xs">
                                      {catchErrors.longitude}
                                    </ErrorMessage>
                                  </FormGroup>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>
          </Grid>
        </Grid>
      </GridContainer>
      
      <footer className="position-fixed bottom-0 width-full bg-gray-5 padding-bottom-2 padding-x-2 shadow-1 z-top">
        <div className="display-flex flex-justify maxw-mobile-lg margin-x-auto padding-top-2">
          <Button
            outline
            type="button"
            className="width-card-lg bg-white"
            onClick={() => navigateWithTripId("/start", tripId)}
          >
            Back
          </Button>
          <Button
            type="button"
            className="width-full margin-left-2"
            onClick={handleMainSubmit}
          >
            Next
          </Button>
        </div>
      </footer>
    </>
  );
}

export default CatchLog;
