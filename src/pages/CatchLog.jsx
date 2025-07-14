import "../index.css";

import React, { useState } from "react";
import { useApplication } from "@nmfs-radfish/react-radfish";
import {
  Button,
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

// --- Helper Functions ---
/**
 * Checks if lesson 4 implementation is complete by verifying required imports exist
 * @returns {boolean} True if all required imports are available
 */
const checkLesson4Complete = () => {
  try {
    // This will throw if the imports don't exist
    return typeof SPECIES_OPTIONS !== 'undefined' && 
           typeof useTripNavigation !== 'undefined' &&
           typeof TIME_PICKER_CONFIG !== 'undefined';
  } catch {
    return false;
  }
};

/**
 * Renders the lesson completion message when implementation is missing
 * @returns {JSX.Element} The lesson completion UI
 */
const renderLessonIncomplete = () => (
  <GridContainer className="padding-y-4 padding-x-2 width-full maxw-mobile-lg">
    <Grid row>
      <Grid col="fill">
        <div className="text-center padding-4">
          <div className="margin-bottom-4">
            <h1 className="font-heading-xl text-primary">Lesson 4: Dynamic Inputs</h1>
            <p className="font-body-lg text-base-dark margin-top-2">
              Complete the lesson implementation to access this page
            </p>
          </div>
          
          <div className="margin-top-4">
            <Button 
              outline 
              type="button"
              onClick={() => window.history.back()}
            >
              ← Back
            </Button>
          </div>
        </div>
      </Grid>
    </Grid>
  </GridContainer>
);

// --- Component Definition ---
/**
 * CatchLog - Second step in the trip recording workflow
 * This component demonstrates:
 * - Managing multiple related records (catches) within a trip
 * - Complex form validation for both new and existing records
 * - CRUD operations with RADFish collections
 * - Dynamic UI updates with optimistic rendering
 * - Handling collections that may not exist in early lessons
 */
function CatchLog() {
  // --- RADFish Application Context ---
  const app = useApplication();

  // --- Custom Hooks ---

  // --- State Management ---

  // --- Event Handlers for New Catch Form ---

  /**
   * Handles new catch form submission
   * @param {Event} e - Form submit event
   */
  const handleSubmit = async (e) => {

  };

  /**
   * Handles main form submission to proceed to next step
   * @param {Event} e - Form submit event
   */
  const handleMainSubmit = async (e) => {

  };

  // --- Event Handlers for Recorded Catches ---
  /**
   * Update a specific catch
   * @param {number} index - Index of the catch in the catches array
   * @param {string} field - Field to update
   * @param {any} value - New value for the field
   * @returns {boolean} Success status
   */
  const updateCatch = async (index, field, value) => {
  };
  
  /**
   * Delete a catch
   * @param {number} index - Index of the catch to delete
   * @param {boolean} skipConfirmation - Skip confirmation dialog (default: false)
   * @returns {boolean} Success status
   */
  const deleteCatch = async (index, skipConfirmation = false) => {
  };
  
  /**
   * Handles changes to recorded catch fields
   * @param {number} index - Index of the catch in the catches array
   * @param {string} field - Field name to update
   * @param {any} value - New value for the field
   */
  const handleRecordedCatchChange = async (index, field, value) => {

  };
  
  /**
   * Handles time changes for recorded catches
   * @param {number} index - Index of the catch in the catches array
   * @param {string} time - New time value
   */
  const handleRecordedTimeChange = async (index, time) => {

  };
  
  /**
   * Handles deletion of a recorded catch
   * @param {number} index - Index of the catch to delete
   */
  const handleDeleteCatch = async (index) => {
  };

  // --- Render Logic ---
  if (isLoading) {
    return <div className="padding-5 text-center">Loading catches...</div>;
  }

    // Check if lesson 4 implementation is complete
    if (!checkLesson4Complete()) {
      return renderLessonIncomplete();
    }
  

  return (
    <>
      <GridContainer className="padding-y-4 padding-x-0 width-full maxw-mobile-lg">
        <Grid row>
          <Grid col="fill">
            <div className="text-left">
              {/* --- Embedded Step Indicator --- */}
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
                    {/* Weight Input*/}
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
                          onChange={handleInputChange}
                          validationStatus={errors.weight ? "error" : undefined}
                          aria-describedby="weight-error-message"
                        />
                        <ErrorMessage
                          id="weight-error-message"
                          className="font-sans-2xs"
                        >
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
                          onChange={handleInputChange}
                          validationStatus={errors.length ? "error" : undefined}
                          aria-describedby="length-error-message"
                        />
                        <ErrorMessage
                          id="length-error-message"
                          className="font-sans-2xs"
                        >
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
                      onChange={handleTimeChange}
                      minTime={TIME_PICKER_CONFIG.MIN_TIME}
                      maxTime="23:30"
                      step={TIME_PICKER_CONFIG.STEP}
                      validationStatus={errors.time ? "error" : undefined}
                      className={errors.time ? "usa-input--error" : ""}
                      aria-describedby="time-error-message"
                    />
                    <ErrorMessage
                      id="time-error-message"
                      className="font-sans-2xs"
                    >
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
                          onChange={handleInputChange}
                          validationStatus={
                            errors.latitude ? "error" : undefined
                          }
                          aria-describedby="latitude-error-message"
                        />
                        <ErrorMessage
                          id="latitude-error-message"
                          className="font-sans-2xs"
                        >
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
                          onChange={handleInputChange}
                          validationStatus={
                            errors.longitude ? "error" : undefined
                          }
                          aria-describedby="longitude-error-message"
                        />
                        <ErrorMessage
                          id="longitude-error-message"
                          className="font-sans-2xs"
                        >
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
                        // Get errors for this specific catch item, default to empty object if none
                        const catchErrors = recordedCatchErrors[index] || {};

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
                                  maxTime={TIME_PICKER_CONFIG.MAX_TIME}
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

      {/* Footer uses USWDS utilities */}
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