import "../index.css";

import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

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
  validateRequired, 
  validateNumberRange, 
  validateLatitude, 
  validateLongitude, 
  FIELD_NAMES,
  SPECIES_OPTIONS 
} from "../utils/validation";

function CatchLog() {
  // React Router hooks
  const navigate = useNavigate();
  const location = useLocation();
  // RADFish hook
  const app = useApplication();

  // --- State Management ---
  // Get tripId from navigation state (essential for associating catches)
  const tripId = location.state?.tripId;
  // Key for TimePicker to force re-render when resetting the form
  const [catchTimeKey, setCatchTimeKey] = useState(0);
  // State for the *new* catch currently being entered in the top form
  const [currentCatch, setCurrentCatch] = useState({
    species: "",
    weight: "",
    length: "",
    latitude: "",
    longitude: "",
    time: "",
  });
  // State for the list of catches already recorded for this trip
  const [catches, setCatches] = useState([]);
  // State for validation errors in the *new catch form*
  const [errors, setErrors] = useState({});
  // State to store validation errors for each recorded catch {index: {field: message}}
  const [recordedCatchErrors, setRecordedCatchErrors] = useState({});
  // State for loading indicator while fetching data
  const [isLoading, setIsLoading] = useState(true);

  // --- Data Loading ---
  // useEffect to load the trip (to ensure it exists) and its existing catches
  useEffect(() => {
    const loadTripAndCatches = async () => {
      setIsLoading(true);
      // Critical check: Need app instance and tripId to proceed
      if (!app || !tripId) {
        console.warn(
          "App or Trip ID not available in state, cannot load catch data.",
        );
        navigate("/"); // Redirect home if essential data is missing
        return;
      }
      try {
        // Access RADFish collections
        const tripStore = app.stores["trip"];
        const Form = tripStore.getCollection("Form");

        // Verify the trip exists
        const existingTrips = await Form.find({ id: tripId });
        if (existingTrips.length === 0) {
          console.warn(`Trip with ID ${tripId} not found, redirecting.`);
          navigate("/");
          return;
        }

        try {
          const Catch = tripStore.getCollection("Catch");
          // Fetch catches associated with this tripId
          const existingCatches = await Catch.find({ tripId: tripId });
          if (existingCatches.length > 0) {
            // Sort catches by creation date (most recent first)
            setCatches(
              existingCatches.sort(
                (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
              ),
            );
          }
        } catch (catchCollectionError) {
          // Catch collection doesn't exist yet - this is expected in early lessons
          console.warn(
            "Catch collection not yet defined - proceeding without loading catches",
          );
        }
      } catch (error) {
        console.error("Error loading trip/catch data:", error);
        navigate("/"); // Redirect home on error
      } finally {
        setIsLoading(false);
      }
    };
    loadTripAndCatches();
  }, [app, tripId, navigate]); // Dependencies: re-run if app or tripId changes

  // --- Event Handlers for New Catch Form ---
  const handleInputChange = (e) => {
    if (!e?.target) return;
    let { name, value } = e.target;

    setCurrentCatch((prev) => ({ ...prev, [name]: value }));

    // Clear validation error on input change
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleTimeChange = (time) => {
    setCurrentCatch((prev) => ({ ...prev, time: time }));
    if (errors.time) {
      setErrors((prev) => ({ ...prev, time: undefined }));
    }
  };

  // --- Validation for New Catch Form ---
  const validateForm = () => {
    const newErrors = {};
    // Validate required fields
    newErrors.species = validateRequired(currentCatch.species, FIELD_NAMES.SPECIES);
    newErrors.weight = validateRequired(currentCatch.weight, FIELD_NAMES.WEIGHT);
    newErrors.length = validateRequired(currentCatch.length, FIELD_NAMES.LENGTH);
    newErrors.time = validateRequired(currentCatch.time, FIELD_NAMES.TIME);
    // Validate ranges if value exists and required check passed
    if (!newErrors.weight && currentCatch.weight) {
      newErrors.weight = validateNumberRange(
        currentCatch.weight,
        0,
        1000,
        FIELD_NAMES.WEIGHT,
        false,
      );
    }
    if (!newErrors.length && currentCatch.length) {
      newErrors.length = validateNumberRange(
        currentCatch.length,
        0,
        500,
        FIELD_NAMES.LENGTH,
        false,
      );
    }
    // Validate coordinates if entered
    if (currentCatch.latitude) {
      newErrors.latitude = validateLatitude(currentCatch.latitude);
    }
    if (currentCatch.longitude) {
      newErrors.longitude = validateLongitude(currentCatch.longitude);
    }
    // Filter out null/undefined errors
    return Object.entries(newErrors).reduce((acc, [key, value]) => {
      if (value) acc[key] = value;
      return acc;
    }, {});
  };

  // --- Validation for Recorded Catches ---
  // Validates all catches in the list
  const validateRecordedCatches = () => {
    const allErrors = {};
    catches.forEach((catchItem, index) => {
      const catchErrors = {};
      // Validate required fields
      catchErrors.species = validateRequired(catchItem.species, FIELD_NAMES.SPECIES);
      catchErrors.weight = validateRequired(catchItem.weight, FIELD_NAMES.WEIGHT);
      catchErrors.length = validateRequired(catchItem.length, FIELD_NAMES.LENGTH);
      catchErrors.time = validateRequired(catchItem.time, FIELD_NAMES.TIME);
      // Validate ranges if value exists and required check passed
      if (!catchErrors.weight && catchItem.weight) {
        catchErrors.weight = validateNumberRange(
          catchItem.weight,
          0,
          1000,
          FIELD_NAMES.WEIGHT,
          false,
        );
      }
      if (!catchErrors.length && catchItem.length) {
        catchErrors.length = validateNumberRange(
          catchItem.length,
          0,
          500,
          FIELD_NAMES.LENGTH,
          false,
        );
      }
      // Validate coordinates if entered
      if (catchItem.latitude) {
        catchErrors.latitude = validateLatitude(catchItem.latitude);
      }
      if (catchItem.longitude) {
        catchErrors.longitude = validateLongitude(catchItem.longitude);
      }
      // Filter out null/undefined errors for this specific catch
      const filteredCatchErrors = Object.entries(catchErrors).reduce(
        (acc, [key, value]) => {
          if (value) acc[key] = value;
          return acc;
        },
        {},
      );
      // If there are errors for this catch, add them to the main error object
      if (Object.keys(filteredCatchErrors).length > 0) {
        allErrors[index] = filteredCatchErrors;
      }
    });
    return allErrors;
  };

  // --- Form Submission Handlers ---
  // Handles adding the *new* catch from the top form
  const handleAddCatch = async (e) => {
    e.preventDefault();

    const formErrors = {};

    if (Object.keys(formErrors).length === 0 && tripId) {
      try {
        const Catch = app.stores["trip"].getCollection("Catch");

        const newCatchData = {
          ...currentCatch,
          id: crypto.randomUUID(),
          tripId: tripId,
          weight: Number(currentCatch.weight),
          length: Number(currentCatch.length),
          latitude: currentCatch.latitude
            ? Number(currentCatch.latitude)
            : undefined,
          longitude: currentCatch.longitude
            ? Number(currentCatch.longitude)
            : undefined,
          createdAt: new Date().toISOString(),
        };

        setCurrentCatch({
          species: "",
          weight: "",
          length: "",
          latitude: "",
          longitude: "",
          time: "",
        });
        setCatchTimeKey((prevKey) => prevKey + 1);
        setErrors({});
      } catch (error) {
        console.error("Error adding catch:", error);
      }
    }
  };

  // Handles submitting the entire page (navigating to the next step)
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all recorded catches first
    const recordedErrors = validateRecordedCatches();
    setRecordedCatchErrors(recordedErrors);

    // Only proceed if there are no errors in the recorded catches list
    if (Object.keys(recordedErrors).length === 0) {
      if (tripId) {
        try {
          const Form = app.stores["trip"].getCollection("Form");
          // Update the trip's step in RADFish/IndexedDB
          await Form.update({ id: tripId, step: 3 });
          // Navigate to the EndTrip page, passing tripId
          navigate(`/end`, { state: { tripId: tripId } });
        } catch (error) {
          console.error("Error updating trip step:", error, "Trip ID:", tripId);
          // Add user feedback here
        }
      } else {
        console.error("No trip ID available to proceed.");
        // Add user feedback here
      }
    } else {
      console.warn(
        "Validation errors found in recorded catches. Cannot proceed.",
      );
    }
  };

  // --- Event Handlers for Recorded Catches List ---
  // Handles input changes within the list of existing catches
  const handleRecordedCatchChange = async (index, field, value) => {
    const updatedCatches = [...catches];
    const catchToUpdate = { ...updatedCatches[index], [field]: value };
    updatedCatches[index] = catchToUpdate;
    setCatches(updatedCatches); // Optimistic UI update

    try {
      const Catch = app.stores["trip"].getCollection("Catch");
      // Prepare data for update (ensure correct types)
      const updateData = { [field]: value };
      // Convert to number if it's a numeric field, handle empty string
      if (
        field === "weight" ||
        field === "length" ||
        field === "latitude" ||
        field === "longitude"
      ) {
        updateData[field] = value === "" ? undefined : Number(value);
      }
      // Update the specific field in RADFish/IndexedDB
      await Catch.update({ id: catchToUpdate.id, ...updateData });
    } catch (error) {
      console.error(
        "Error updating recorded catch:",
        error,
        "Catch ID:",
        catchToUpdate.id,
      );
    }
  };

  // Handles time changes within the list of existing catches
  const handleRecordedTimeChange = async (index, time) => {
    const updatedCatches = [...catches];
    const catchToUpdate = { ...updatedCatches[index], time: time };
    updatedCatches[index] = catchToUpdate;
    setCatches(updatedCatches); // Optimistic UI update

    try {
      const Catch = app.stores["trip"].getCollection("Catch");
      // Update time field in RADFish/IndexedDB
      await Catch.update({ id: catchToUpdate.id, time });
    } catch (error) {
      console.error(
        "Error updating recorded catch time:",
        error,
        "Catch ID:",
        catchToUpdate.id,
      );
    }
  };

  // Handles deleting a catch from the list
  const handleDeleteCatch = async (index) => {
    if (window.confirm("Are you sure you want to delete this catch?")) {
      const catchToDelete = catches[index];
      try {
        const Catch = app.stores["trip"].getCollection("Catch");
        // Remove from RADFish/IndexedDB
        await Catch.delete(catchToDelete.id);
        // Update local state to remove from UI
        setCatches((prev) => prev.filter((_, i) => i !== index));
      } catch (error) {
        console.error(
          "Error deleting catch:",
          error,
          "Catch ID:",
          catchToDelete.id,
        );
      }
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
                  onSubmit={handleAddCatch}
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
                      minTime="00:00"
                      maxTime="23:30"
                      step={15}
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
                                  minTime="00:00"
                                  maxTime="23:45"
                                  step={15}
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
            onClick={() => navigate("/start", { state: { tripId: tripId } })}
          >
            Back
          </Button>
          <Button
            type="button"
            className="width-full margin-left-2"
            onClick={handleSubmit}
          >
            Next
          </Button>
        </div>
      </footer>
    </>
  );
}

export default CatchLog;
