import "../index.css";

import React, { useState } from "react";
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
  FIELD_NAMES,
  SPECIES_OPTIONS,
  TIME_PICKER_CONFIG,
  STORE_NAMES,
  COLLECTION_NAMES,
} from "../utils";
import { useTripNavigation, useTripData, useCatchData } from "../hooks";

// --- Component Definition ---
/**
 * CatchLog - Second step in the trip recording workflow
 * This component demonstrates lesson 4 concepts:
 * - Custom hooks for data management
 * - Dynamic form inputs for multiple catch records
 * - CRUD operations with RADFish collections
 * - Event handlers for form management
 */
function CatchLog() {
  // --- RADFish Application Context ---
  const app = useApplication();

  // --- Custom Hooks ---
  // Navigation hook for trip-specific routing
  const { tripId, navigateHome, navigateWithTripId } = useTripNavigation();

  // Trip data hook - only used for verification and step updates
  const { updateTrip } = useTripData(
    tripId,
    (error) => {
      console.warn("Trip loading error:", error);
      navigateHome();
    },
    { loadOnMount: false } // Don't load trip data, just verify existence
  );

  // Use custom hook for catch data management
  const {
    catches,
    isLoading,
    addCatch,
    setCatches
  } = useCatchData(tripId, (error) => {
    console.warn("Catch data error:", error);
    if (error.message === "Trip not found" || error.message === "No trip ID provided") {
      navigateHome();
    }
  });

  // --- State Management ---
  // Form management state
  const [catchTimeKey, setCatchTimeKey] = useState(0); // Forces TimePicker re-render on reset
  
  // New catch form state
  const [currentCatch, setCurrentCatch] = useState({
    species: "",
    weight: "",
    length: "",
    latitude: "",
    longitude: "",
    time: "",
  });
  const [errors, setErrors] = useState({}); // Validation errors for new catch form

  // --- Event Handlers ---

  // const handleInputChange = (e) => {
  //   // Handle input changes for new catch form
  // };

  // const handleTimeChange = (time, fieldName = "time") => {
  //   // Handle time picker changes
  // };

  // const resetForm = () => {
  //   // Reset form to initial state
  // };

  // const handleAddCatch = async (e) => {
  //   // Handle new catch form submission
  // };

  // const handleSubmit = async (e) => {
  //   // Handle main form submission to proceed to next step
  // };

  // --- Event Handlers for Recorded Catches ---
  // These are provided for advanced functionality (editing existing catches)
  
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
      const tripStore = app.stores[STORE_NAMES.TRIP];
      const Catch = tripStore.getCollection(COLLECTION_NAMES.CATCH);

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
      return false;
    }
  };

  /**
   * Handles changes to recorded catch fields
   * @param {number} index - Index of the catch in the catches array
   * @param {string} field - Field name to update
   * @param {any} value - New value for the field
   */
  const handleRecordedCatchChange = async (index, field, value) => {
    const success = await updateCatch(index, field, value);
    
    if (!success) {
      console.error("Failed to update recorded catch");
    }
  };
  
  /**
   * Handles time changes for recorded catches
   * @param {number} index - Index of the catch in the catches array
   * @param {string} time - New time value
   */
  const handleRecordedTimeChange = async (index, time) => {
    const success = await updateCatch(index, "time", time);
    
    if (!success) {
      console.error("Failed to update recorded catch time");
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
      const tripStore = app.stores[STORE_NAMES.TRIP];
      const Catch = tripStore.getCollection(COLLECTION_NAMES.CATCH);
      
      // Remove from RADFish/IndexedDB
      await Catch.delete({ id: catchToDelete.id });
      
      // Update local state to remove from UI
      setCatches(prev => prev.filter((_, i) => i !== index));
      
      return true;
    } catch (err) {
      console.error("Error deleting catch:", err, "Catch ID:", catchToDelete.id);
      return false;
    }
  };

  /**
   * Handles deletion of a recorded catch
   * @param {number} index - Index of the catch to delete
   */
  const handleDeleteCatch = async (index) => {
    const success = await deleteCatch(index);
    
    if (!success) {
      console.error("Failed to delete catch");
    }
  };

  // --- Render Logic ---
  if (isLoading) {
    return <div className="padding-5 text-center">Loading catches...</div>;
  }

  return (
    <>
      <GridContainer className="padding-y-4 padding-x-0 width-full maxw-mobile-lg">
        <Grid row>
          <Grid col="fill">
            <div className="text-left">
              {/* --- Step Indicator --- */}
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

              {/* --- New Catch Entry Form --- */}
              {/* Complete form structure provided*/}
              <div className="width-full margin-y-0 margin-x-auto display-flex flex-column flex-align-start">
                <Form
                  onSubmit={() => {}}
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
                      onChange={() => {}}
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
                    {/* Weight Input */}
                    <div className="flex-1">
                      <FormGroup error={errors.weight}>
                        <Label
                          htmlFor="weight"
                          error={errors.weight}
                          requiredMarker
                        >
                          Weight
                        </Label>
                        <span className="usa-hint display-block text-left">
                          lbs
                        </span>
                        <TextInput
                          id="weight"
                          name="weight"
                          type="number"
                          value={currentCatch.weight}
                          onChange={() => {}}
                          validationStatus={errors.weight ? "error" : undefined}
                          aria-describedby="weight-error-message"
                        />
                        <ErrorMessage id="weight-error-message" className="font-sans-2xs">
                          {errors.weight}
                        </ErrorMessage>
                      </FormGroup>
                    </div>

                    {/* Length Input */}
                    <div className="flex-1">
                      <FormGroup error={errors.length}>
                        <Label
                          htmlFor="length"
                          error={errors.length}
                          requiredMarker
                        >
                          Length
                        </Label>
                        <span className="usa-hint display-block text-left">
                          inches
                        </span>
                        <TextInput
                          id="length"
                          name="length"
                          type="number"
                          value={currentCatch.length}
                          onChange={() => {}}
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
                    <Label
                      htmlFor="catchTime"
                      error={errors.time}
                      className="input-time-label"
                      requiredMarker
                    >
                      Time
                    </Label>
                    <TimePicker
                      key={catchTimeKey} // Use key to force re-render on reset
                      id="catchTime"
                      name="time"
                      defaultValue={currentCatch.time}
                      onChange={() => {}}
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
                    {/* Latitude Input */}
                    <div className="flex-1">
                      <FormGroup error={errors.latitude}>
                        <Label htmlFor="latitude" error={errors.latitude}>
                          Latitude
                        </Label>
                        <span className="usa-hint display-block text-left">
                          DD
                        </span>
                        <TextInput
                          id="latitude"
                          name="latitude"
                          type="number"
                          value={currentCatch.latitude}
                          onChange={() => {}}
                          validationStatus={errors.latitude ? "error" : undefined}
                          aria-describedby="latitude-error-message"
                        />
                        <ErrorMessage id="latitude-error-message" className="font-sans-2xs">
                          {errors.latitude}
                        </ErrorMessage>
                      </FormGroup>
                    </div>

                    {/* Longitude Input */}
                    <div className="flex-1">
                      <FormGroup error={errors.longitude}>
                        <Label htmlFor="longitude" error={errors.longitude}>
                          Longitude
                        </Label>
                        <span className="usa-hint display-block text-left">
                          DD
                        </span>
                        <TextInput
                          id="longitude"
                          name="longitude"
                          type="number"
                          value={currentCatch.longitude}
                          onChange={() => {}}
                          validationStatus={errors.longitude ? "error" : undefined}
                          aria-describedby="longitude-error-message"
                        />
                        <ErrorMessage id="longitude-error-message" className="font-sans-2xs">
                          {errors.longitude}
                        </ErrorMessage>
                      </FormGroup>
                    </div>
                  </div>

                  {/* Add Catch Button Area */}
                  <div className="display-flex flex-justify-start margin-top-1 margin-bottom-2">
                    <Button
                      type="submit"
                      className="width-full"
                      accentStyle="cool"
                    >
                      Add Catch
                    </Button>
                  </div>
                </Form>
              </div>

              {/* Recorded Catches Section */}
              {catches.length > 0 && (
                <>
                  {/* Container for the recorded catches section */}
                  <div className="width-full border-top border-base-lighter padding-top-105 margin-top-105">
                    <h2 className="font-heading-lg margin-bottom-1">
                      Recorded Catches
                    </h2>
                    {/* List container for individual catch items */}
                    <div className="display-flex flex-column width-full">
                      {catches.map((catchItem, index) => {
                        // Error handling will be added in lesson 5
                        const catchErrors = {};

                        return (
                          // Container for a single recorded catch item
                          <div
                            key={catchItem.id || index}
                            className="padding-y-1 border-bottom border-base-lighter"
                          >
                            {/* Wrapper for the recorded catch form elements */}
                            <div className="position-relative width-full">
                              {/* Delete button positioned absolutely */}
                              <div className="position-absolute top-neg-105 right-0">
                                <Button
                                  type="button"
                                  unstyled // Use unstyled to allow custom styling with utilities
                                  onClick={() => handleDeleteCatch(index)}
                                  className="text-secondary hover:bg-base-lightest border-radius-sm padding-05 display-flex flex-align-center"
                                  aria-label="Delete this catch"
                                >
                                  Delete{" "}
                                  <Icon.Delete size={3} aria-hidden="true" />
                                </Button>
                              </div>

                              {/* Recorded Catch Form Fields */}
                              <FormGroup error={catchErrors.species}>
                                <Label
                                  htmlFor={`recorded-species-${index}`}
                                  error={catchErrors.species}
                                  requiredMarker
                                >
                                  Species
                                </Label>
                                <Select
                                  id={`recorded-species-${index}`}
                                  name="species"
                                  value={catchItem.species}
                                  className="margin-top-05 margin-bottom-0"
                                  onChange={(e) =>
                                    handleRecordedCatchChange(
                                      index,
                                      "species",
                                      e.target.value,
                                    )
                                  }
                                  validationStatus={
                                    catchErrors.species ? "error" : undefined
                                  }
                                  aria-describedby={`recorded-species-${index}-error-message`}
                                >
                                  <option value="">-Select-</option>
                                  {SPECIES_OPTIONS.map((species) => (
                                    <option key={species} value={species}>
                                      {species}
                                    </option>
                                  ))}
                                </Select>

                                <ErrorMessage
                                  id={`recorded-species-${index}-error-message`}
                                  className="font-sans-2xs"
                                >
                                  {catchErrors.species}
                                </ErrorMessage>
                              </FormGroup>

                              {/* Recorded Weight/Length Row */}
                              <div className="display-flex gap-2 width-full">
                                {/* Recorded Weight */}
                                <div className="flex-1">
                                  <FormGroup error={catchErrors.weight}>
                                    <Label
                                      htmlFor={`recorded-weight-${index}`}
                                      error={catchErrors.weight}
                                      requiredMarker
                                    >
                                      Weight
                                    </Label>
                                    <span className="usa-hint display-block text-left">
                                      lbs
                                    </span>
                                    <TextInput
                                      id={`recorded-weight-${index}`}
                                      name="weight"
                                      type="number"
                                      value={catchItem.weight}
                                      onChange={(e) =>
                                        handleRecordedCatchChange(
                                          index,
                                          "weight",
                                          e.target.value,
                                        )
                                      }
                                      validationStatus={
                                        catchErrors.weight ? "error" : undefined
                                      }
                                      aria-describedby={`recorded-weight-${index}-error-message`}
                                    />

                                    <ErrorMessage
                                      id={`recorded-weight-${index}-error-message`}
                                      className="font-sans-2xs"
                                    >
                                      {catchErrors.weight}
                                    </ErrorMessage>
                                  </FormGroup>
                                </div>
                                {/* Recorded Length */}
                                <div className="flex-1">
                                  <FormGroup error={catchErrors.length}>
                                    <Label
                                      htmlFor={`recorded-length-${index}`}
                                      error={catchErrors.length}
                                      requiredMarker
                                    >
                                      Length
                                    </Label>
                                    <span className="usa-hint display-block text-left">
                                      inches
                                    </span>
                                    <TextInput
                                      id={`recorded-length-${index}`}
                                      name="length"
                                      type="number"
                                      value={catchItem.length}
                                      onChange={(e) =>
                                        handleRecordedCatchChange(
                                          index,
                                          "length",
                                          e.target.value,
                                        )
                                      }
                                      validationStatus={
                                        catchErrors.length ? "error" : undefined
                                      }
                                      aria-describedby={`recorded-length-${index}-error-message`}
                                    />

                                    <ErrorMessage
                                      id={`recorded-length-${index}-error-message`}
                                      className="font-sans-2xs"
                                    >
                                      {catchErrors.length}
                                    </ErrorMessage>
                                  </FormGroup>
                                </div>
                              </div>

                              {/* Recorded Time */}
                              <FormGroup error={catchErrors.time}>
                                <Label
                                  htmlFor={`recorded-time-${index}`}
                                  error={catchErrors.time}
                                  className="input-time-label"
                                  requiredMarker
                                >
                                  Time
                                </Label>
                                <TimePicker
                                  id={`recorded-time-${index}`}
                                  name={`recorded-time-${index}`}
                                  defaultValue={catchItem.time}
                                  onChange={(time) =>
                                    handleRecordedTimeChange(index, time)
                                  }
                                  minTime={TIME_PICKER_CONFIG.MIN_TIME}
                                  maxTime="23:30"
                                  step={TIME_PICKER_CONFIG.STEP}
                                  className={
                                    catchErrors.time ? "usa-input--error" : ""
                                  }
                                  validationStatus={
                                    catchErrors.time ? "error" : undefined
                                  }
                                  aria-describedby={`recorded-time-${index}-error-message`}
                                />

                                <ErrorMessage
                                  id={`recorded-time-${index}-error-message`}
                                  className="font-sans-2xs"
                                >
                                  {catchErrors.time}
                                </ErrorMessage>
                              </FormGroup>

                              {/* Recorded Coordinates Row */}
                              <div className="display-flex gap-2 width-full">
                                {/* Recorded Latitude */}
                                <div className="flex-1">
                                  <FormGroup error={catchErrors.latitude}>
                                    <Label
                                      htmlFor={`recorded-latitude-${index}`}
                                      error={catchErrors.latitude}
                                    >
                                      Latitude
                                    </Label>
                                    <span className="usa-hint display-block text-left">
                                      DD
                                    </span>
                                    <TextInput
                                      id={`recorded-latitude-${index}`}
                                      name="latitude"
                                      type="number"
                                      className="margin-top-05 margin-bottom-0"
                                      value={catchItem.latitude ?? ""}
                                      onChange={(e) => {
                                        handleRecordedCatchChange(
                                          index,
                                          "latitude",
                                          e.target.value,
                                        );
                                      }}
                                      validationStatus={
                                        catchErrors.latitude
                                          ? "error"
                                          : undefined
                                      }
                                      aria-describedby={`recorded-latitude-${index}-error-message`}
                                    />

                                    <ErrorMessage
                                      id={`recorded-latitude-${index}-error-message`}
                                      className="font-sans-2xs"
                                    >
                                      {catchErrors.latitude}
                                    </ErrorMessage>
                                  </FormGroup>
                                </div>
                                {/* Recorded Longitude */}
                                <div className="flex-1">
                                  <FormGroup error={catchErrors.longitude}>
                                    <Label
                                      htmlFor={`recorded-longitude-${index}`}
                                      error={catchErrors.longitude}
                                    >
                                      Longitude
                                    </Label>
                                    <span className="usa-hint display-block text-left">
                                      DD
                                    </span>
                                    <TextInput
                                      id={`recorded-longitude-${index}`}
                                      name="longitude"
                                      type="number"
                                      className="margin-top-05 margin-bottom-0"
                                      value={catchItem.longitude ?? ""}
                                      onChange={(e) => {
                                        handleRecordedCatchChange(
                                          index,
                                          "longitude",
                                          e.target.value,
                                        );
                                      }}
                                      validationStatus={
                                        catchErrors.longitude
                                          ? "error"
                                          : undefined
                                      }
                                      aria-describedby={`recorded-longitude-${index}-error-message`}
                                    />

                                    <ErrorMessage
                                      id={`recorded-longitude-${index}-error-message`}
                                      className="font-sans-2xs"
                                    >
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

      {/* --- Footer Navigation --- */}
      <footer className="position-fixed bottom-0 width-full bg-gray-5 padding-bottom-2 padding-x-2 shadow-1 z-top">
        <div className="display-flex flex-justify maxw-mobile-lg margin-x-auto padding-top-2">
          <Button
            outline
            type="button"
            className="width-card-lg bg-white"
            onClick={navigateHome}
          >
            Back
          </Button>
          <Button
            type="button"
            className="width-full margin-left-2"
            onClick={() => {}}
          >
            Next
          </Button>
        </div>
      </footer>
    </>
  );
}

export default CatchLog;