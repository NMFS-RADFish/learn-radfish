import "../index.css";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Form,
  Label,
  TextInput,
  FormGroup,
  ErrorMessage,
  TimePicker,
  Select,
  Button,
  Icon,
} from "@trussworks/react-uswds";
import { useApplication } from "@nmfs-radfish/react-radfish";
import Footer from "../components/Footer";
import StepIndicator from "../components/StepIndicator";
import { processCoordinateInput } from "../utils/inputProcessing";

// Field name constants
const FIELD_SPECIES = "Species";
const FIELD_WEIGHT = "Weight";
const FIELD_LENGTH = "Length";
const FIELD_LATITUDE = "Latitude";
const FIELD_LONGITUDE = "Longitude";
const FIELD_TIME = "Catch time";

// Species options
const SPECIES_OPTIONS = ["Yellowfin", "Bluefin", "Salmon", "Halibut"];

// Validation functions
// Validates that a field is not empty
const validateRequired = (value, fieldName) => {
  if (!value && value !== 0) {
    return `${fieldName} is required`;
  }
  return null;
};

// Validates that a number is within a specified range
const validateNumberRange = (value, min, max, fieldName) => {
  if (value === "" || value === null || value === undefined) {
    return null; // Empty validation is handled by validateRequired
  }

  const numValue = Number(value);

  if (isNaN(numValue)) {
    return `${fieldName} must be a valid number`;
  }

  if (numValue < min) {
    return `${fieldName} must be at least ${min}`;
  }

  if (numValue > max) {
    return `${fieldName} is too large`;
  }

  return null;
};

// Validates latitude is between -90 and 90
const validateLatitude = (value) => {
  if (value === "" || value === null || value === undefined) {
    return null; // Empty validation is handled by validateRequired
  }

  const numValue = Number(value);

  if (isNaN(numValue)) {
    return `${FIELD_LATITUDE} must be a valid number`;
  }

  if (numValue < -90 || numValue > 90) {
    return `${FIELD_LATITUDE} must be between -90 and 90`;
  }

  return null;
};

// Validates longitude is between -180 and 180
const validateLongitude = (value) => {
  if (value === "" || value === null || value === undefined) {
    return null; // Empty validation is handled by validateRequired
  }

  const numValue = Number(value);

  if (isNaN(numValue)) {
    return `${FIELD_LONGITUDE} must be a valid number`;
  }

  if (numValue < -180 || numValue > 180) {
    return `${FIELD_LONGITUDE} must be between -180 and 180`;
  }

  return null;
};

function CatchLog() {
  const navigate = useNavigate();
  const app = useApplication();
  const [timeKey, setTimeKey] = useState(0);
  const [tripId, setTripId] = useState(null);

  // Form data for the current catch being entered
  const [currentCatch, setCurrentCatch] = useState({
    species: "",
    weight: "",
    length: "",
    latitude: "",
    longitude: "",
    time: "",
  });

  // List of saved catches
  const [catches, setCatches] = useState([]);

  // Track if form has been submitted for validation display
  const [submitted, setSubmitted] = useState(false);

  // Form validation errors
  const [errors, setErrors] = useState({});
  
  // Load existing trip and catches
  useEffect(() => {
    const loadTripAndCatches = async () => {
      try {
        if (!app) return;
        
        const tripStore = app.stores["trip"];
        const Form = tripStore.getCollection("Form");
        
        // Get in-progress trips
        const existingTrips = await Form.find({ status: "in-progress" });
        
        if (existingTrips.length === 0) {
          console.warn("No in-progress trips found, redirecting to start trip page");
          navigate("/start");
          return;
        }
        
        // Use the first in-progress trip
        const currentTrip = existingTrips[0];
        setTripId(currentTrip.id);
        
        // Get catches for this trip
        const Catch = tripStore.getCollection("Catch");
        const existingCatches = await Catch.find({ tripId: currentTrip.id });
        
        if (existingCatches.length > 0) {
          setCatches(existingCatches);
        }
      } catch (error) {
        console.error("Error loading trip data:", error);
      }
    };
    
    loadTripAndCatches();
  }, [app, navigate]);

  // Handle input changes for text fields and selects
  const handleInputChange = (e) => {
    if (e && e.target) {
      const { name, value } = e.target;

      // For latitude and longitude, apply input processing
      if (name === "latitude" || name === "longitude") {
        const { processedValue, skipUpdate } = processCoordinateInput(
          value,
          name,
          e.target,
        );

        if (skipUpdate) {
          return; // Skip update if validation says so
        }

        setCurrentCatch({
          ...currentCatch,
          [name]: processedValue,
        });
      } else {
        // For other inputs, update normally
        setCurrentCatch({
          ...currentCatch,
          [name]: value,
        });
      }

      // Clear error when user starts typing
      if (errors[name]) {
        setErrors({
          ...errors,
          [name]: undefined,
        });
      }
    }
  };

  // Handle time picker changes
  const handleTimeChange = (time) => {
    setCurrentCatch({
      ...currentCatch,
      time: time,
    });

    // Clear error when user selects time
    if (errors.time) {
      setErrors({
        ...errors,
        time: undefined,
      });
    }
  };

  // Validate form data
  const validateForm = () => {
    const newErrors = {};

    // Validate species (required)
    const speciesError = validateRequired(currentCatch.species, FIELD_SPECIES);
    if (speciesError) newErrors.species = speciesError;

    // Validate weight (required and reasonable range)
    let weightError = validateRequired(currentCatch.weight, FIELD_WEIGHT);
    if (!weightError && currentCatch.weight) {
      weightError = validateNumberRange(
        currentCatch.weight,
        0,
        2000,
        FIELD_WEIGHT,
      );
    }
    if (weightError) newErrors.weight = weightError;

    // Validate length (required and reasonable range)
    let lengthError = validateRequired(currentCatch.length, FIELD_LENGTH);
    if (!lengthError && currentCatch.length) {
      lengthError = validateNumberRange(
        currentCatch.length,
        0,
        240,
        FIELD_LENGTH,
      );
    }
    if (lengthError) newErrors.length = lengthError;

    // Validate latitude (optional but must be valid if provided)
    if (currentCatch.latitude) {
      const latitudeError = validateLatitude(currentCatch.latitude);
      if (latitudeError) newErrors.latitude = latitudeError;
    }

    // Validate longitude (optional but must be valid if provided)
    if (currentCatch.longitude) {
      const longitudeError = validateLongitude(currentCatch.longitude);
      if (longitudeError) newErrors.longitude = longitudeError;
    }

    // Validate time (required)
    const timeError = validateRequired(currentCatch.time, FIELD_TIME);
    if (timeError) newErrors.time = timeError;

    return newErrors;
  };

  // Handle adding a new catch
  const handleAddCatch = async (e) => {
    e.preventDefault();
    setSubmitted(true);

    const newErrors = validateForm();
    setErrors(newErrors);

    // If no errors, add catch to IndexedDB
    if (Object.keys(newErrors).length === 0 && tripId) {
      try {
        const tripStore = app.stores["trip"];
        const Catch = tripStore.getCollection("Catch");
        
        // Create new catch with UUID and tripId
        const newCatchData = {
          ...currentCatch,
          id: crypto.randomUUID(),
          tripId: tripId,
          // Convert string values to numbers for required fields
          weight: Number(currentCatch.weight),
          length: Number(currentCatch.length),
          // Convert coordinates to numbers only if provided
          latitude: currentCatch.latitude ? Number(currentCatch.latitude) : null,
          longitude: currentCatch.longitude ? Number(currentCatch.longitude) : null
        };
        
        // Save to IndexedDB
        await Catch.create(newCatchData);
        
        // Add to local state at the beginning of the array (top of the list)
        setCatches([newCatchData, ...catches]);

        // Reset form
        setCurrentCatch({
          species: "",
          weight: "",
          length: "",
          latitude: "",
          longitude: "",
          time: "",
        });
        setTimeKey((prevKey) => prevKey + 1); // Increment the key to force remount
        setSubmitted(false);
      } catch (error) {
        console.error("Error adding catch:", error);
      }
    }
  };

  // Handle catch input change for recorded catches
  const handleRecordedCatchChange = async (index, field, value) => {
    const updatedCatches = [...catches];
    const catchToUpdate = updatedCatches[index];
    
    // Update local state
    updatedCatches[index] = {
      ...catchToUpdate,
      [field]: value,
    };
    setCatches(updatedCatches);
    
    try {
      const tripStore = app.stores["trip"];
      const Catch = tripStore.getCollection("Catch");
      
      // Prepare updated data with type conversion if needed
      const updateData = { [field]: value };
      if (field === 'weight' || field === 'length' || field === 'latitude' || field === 'longitude') {
        updateData[field] = Number(value);
      }
      
      // Update catch field
      await Catch.update(
        {
          id: catchToUpdate.id,
          ...updateData
        }
      );
    } catch (error) {
      console.error("Error updating catch:", error, "Catch ID:", catchToUpdate.id);
    }
  };

  // Handle time change for recorded catches
  const handleRecordedTimeChange = async (index, time) => {
    const updatedCatches = [...catches];
    const catchToUpdate = updatedCatches[index];
    
    // Update local state
    updatedCatches[index] = {
      ...catchToUpdate,
      time: time,
    };
    setCatches(updatedCatches);
    
    try {
      const tripStore = app.stores["trip"];
      const Catch = tripStore.getCollection("Catch");
      
      // Update catch time
      await Catch.update(
        {
          id: catchToUpdate.id,
          time
        }
      );
    } catch (error) {
      console.error("Error updating catch time:", error, "Catch ID:", catchToUpdate.id);
    }
  };

  // Handle deleting a catch
  const handleDeleteCatch = async (index) => {
    if (window.confirm("Are you sure you want to delete this catch?")) {
      try {
        const catchToDelete = catches[index];
        
        const tripStore = app.stores["trip"];
        const Catch = tripStore.getCollection("Catch");
        
        // Delete from IndexedDB
        await Catch.remove(catchToDelete.id);
        
        // Update local state
        const updatedCatches = [...catches];
        updatedCatches.splice(index, 1);
        setCatches(updatedCatches);
      } catch (error) {
        console.error("Error deleting catch:", error);
      }
    }
  };

  // Handle form submission for navigating to next page
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (tripId) {
      try {
        const tripStore = app.stores["trip"];
        const Form = tripStore.getCollection("Form");
        
        // Update trip step
        await Form.update(
          {
            id: tripId,
            step: 3
          }
        );
        navigate("/end");
      } catch (error) {
        console.error("Error updating trip step:", error, "Trip ID:", tripId);
      }
    } else {
      console.error("No trip ID available");
    }
  };

  return (
    <>
      <div className="page-content">
        <div className="content-container">
          <StepIndicator />

          {/* Catch entry form */}
          <div className="catch-form-container">
            <Form onSubmit={handleAddCatch} large>
              {/* Species dropdown */}
              <FormGroup error={submitted && errors.species}>
                <Label
                  htmlFor="species"
                  error={submitted && errors.species}
                  className="form-label"
                >
                  Species<span className="text-secondary-vivid">*</span>
                </Label>
                <Select
                  id="species"
                  name="species"
                  value={currentCatch.species}
                  onChange={handleInputChange}
                  validationStatus={
                    submitted && errors.species ? "error" : undefined
                  }
                  aria-describedby={
                    submitted && errors.species
                      ? "species-error-message"
                      : undefined
                  }
                >
                  <option value="">-Select-</option>
                  {SPECIES_OPTIONS.map((species) => (
                    <option key={species} value={species}>
                      {species}
                    </option>
                  ))}
                </Select>
                <ErrorMessage
                  id="species-error-message"
                  className="error-message"
                >
                  {(submitted && errors.species && errors.species) || "\u00A0"}
                </ErrorMessage>
              </FormGroup>

              {/* Weight and Length on same row */}
              <div className="measurement-inputs">
                {/* Weight Input */}
                <div className="measurement-input">
                  <FormGroup error={submitted && errors.weight}>
                    <Label
                      htmlFor="weight"
                      error={submitted && errors.weight}
                      className="form-label"
                    >
                      Weight<span className="text-secondary-vivid">*</span>
                    </Label>
                    <span className="usa-hint form-hint">lbs</span>
                    <TextInput
                      id="weight"
                      name="weight"
                      type="number"
                      value={currentCatch.weight}
                      onChange={handleInputChange}
                      validationStatus={
                        submitted && errors.weight ? "error" : undefined
                      }
                      aria-describedby={
                        submitted && errors.weight
                          ? "weight-error-message"
                          : undefined
                      }
                    />
                    <ErrorMessage
                      id="weight-error-message"
                      className="error-message"
                    >
                      {(submitted && errors.weight && errors.weight) ||
                        "\u00A0"}
                    </ErrorMessage>
                  </FormGroup>
                </div>

                {/* Length Input */}
                <div className="measurement-input">
                  <FormGroup error={submitted && errors.length}>
                    <Label
                      htmlFor="length"
                      error={submitted && errors.length}
                      className="form-label"
                    >
                      Length<span className="text-secondary-vivid">*</span>
                    </Label>
                    <span className="usa-hint form-hint">inches</span>
                    <TextInput
                      id="length"
                      name="length"
                      type="number"
                      value={currentCatch.length}
                      onChange={handleInputChange}
                      validationStatus={
                        submitted && errors.length ? "error" : undefined
                      }
                      aria-describedby={
                        submitted && errors.length
                          ? "length-error-message"
                          : undefined
                      }
                    />
                    <ErrorMessage
                      id="length-error-message"
                      className="error-message"
                    >
                      {(submitted && errors.length && errors.length) ||
                        "\u00A0"}
                    </ErrorMessage>
                  </FormGroup>
                </div>
              </div>

              {/* Catch Time */}
              <FormGroup error={submitted && errors.time}>
                <Label
                  htmlFor="catchTime"
                  error={submitted && errors.time}
                  className="form-label time-label"
                >
                  Time<span className="text-secondary-vivid">*</span>
                </Label>
                <TimePicker
                  key={timeKey}
                  id="catchTime"
                  name="time"
                  defaultValue={currentCatch.time}
                  onChange={handleTimeChange}
                  minTime="00:00"
                  maxTime="23:30"
                  step={15}
                  validationStatus={
                    submitted && errors.time ? "error" : undefined
                  }
                  className={
                    submitted && errors.time
                      ? "usa-input--error error-input-field"
                      : ""
                  }
                  aria-describedby={
                    submitted && errors.time ? "time-error-message" : undefined
                  }
                />
                <ErrorMessage id="time-error-message" className="error-message">
                  {(submitted && errors.time && errors.time) || "\u00A0"}
                </ErrorMessage>
              </FormGroup>

              {/* Latitude and Longitude on same row */}
              <div className="coordinate-inputs">
                {/* Latitude Input */}
                <div className="coordinate-input">
                  <FormGroup error={submitted && errors.latitude}>
                    <Label
                      htmlFor="latitude"
                      error={submitted && errors.latitude}
                      className="form-label"
                    >
                      Latitude
                    </Label>
                    <span className="usa-hint form-hint">DD</span>
                    <TextInput
                      id="latitude"
                      name="latitude"
                      type="number"
                      value={currentCatch.latitude}
                      onChange={handleInputChange}
                      validationStatus={
                        submitted && errors.latitude ? "error" : undefined
                      }
                      aria-describedby={
                        submitted && errors.latitude
                          ? "latitude-error-message"
                          : undefined
                      }
                    />
                    <ErrorMessage
                      id="latitude-error-message"
                      className="error-message"
                    >
                      {(submitted && errors.latitude && errors.latitude) ||
                        "\u00A0"}
                    </ErrorMessage>
                  </FormGroup>
                </div>

                {/* Longitude Input */}
                <div className="coordinate-input">
                  <FormGroup error={submitted && errors.longitude}>
                    <Label
                      htmlFor="longitude"
                      error={submitted && errors.longitude}
                      className="form-label"
                    >
                      Longitude
                    </Label>
                    <span className="usa-hint form-hint">DD</span>
                    <TextInput
                      id="longitude"
                      name="longitude"
                      type="number"
                      value={currentCatch.longitude}
                      onChange={handleInputChange}
                      validationStatus={
                        submitted && errors.longitude ? "error" : undefined
                      }
                      aria-describedby={
                        submitted && errors.longitude
                          ? "longitude-error-message"
                          : undefined
                      }
                    />
                    <ErrorMessage
                      id="longitude-error-message"
                      className="error-message"
                    >
                      {(submitted && errors.longitude && errors.longitude) ||
                        "\u00A0"}
                    </ErrorMessage>
                  </FormGroup>
                </div>
              </div>

              {/* Add Catch Button */}
              <div className="catch-form-actions">
                <Button
                  type="submit"
                  className="add-catch-button"
                  accentStyle="cool"
                >
                  Add Catch
                </Button>
              </div>
            </Form>
          </div>

          {/* Recorded Catches List */}
          {catches.length > 0 && (
            <div className="recorded-catches-container">
              <h2 className="usa-prose">Recorded Catches</h2>
              <div className="recorded-catches-list">
                {catches.map((catchItem, index) => (
                  <div key={index} className="recorded-catch-item">
                    <div className="recorded-catch-form">
                      {/* Delete Button */}
                      <div className="recorded-catch-actions">
                        <Button
                          type="button"
                          unstyled
                          onClick={() => handleDeleteCatch(index)}
                          className="delete-catch-button"
                          aria-label="Delete this catch"
                        >
                          Delete <Icon.Delete size={3} aria-hidden="true" />
                        </Button>
                      </div>

                      {/* Species dropdown */}
                      <FormGroup>
                        <Label
                          htmlFor={`recorded-species-${index}`}
                          className="form-label"
                        >
                          Species<span className="text-secondary-vivid">*</span>
                        </Label>
                        <Select
                          id={`recorded-species-${index}`}
                          name="species"
                          value={catchItem.species}
                          onChange={(e) =>
                            handleRecordedCatchChange(
                              index,
                              "species",
                              e.target.value,
                            )
                          }
                        >
                          <option value="">-Select-</option>
                          {SPECIES_OPTIONS.map((species) => (
                            <option key={species} value={species}>
                              {species}
                            </option>
                          ))}
                        </Select>
                      </FormGroup>

                      {/* Weight and Length on same row */}
                      <div className="measurement-inputs">
                        {/* Weight Input */}
                        <div className="measurement-input">
                          <FormGroup>
                            <Label
                              htmlFor={`recorded-weight-${index}`}
                              className="form-label"
                            >
                              Weight
                              <span className="text-secondary-vivid">*</span>
                            </Label>
                            <span className="usa-hint form-hint">lbs</span>
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
                            />
                          </FormGroup>
                        </div>

                        {/* Length Input */}
                        <div className="measurement-input">
                          <FormGroup>
                            <Label
                              htmlFor={`recorded-length-${index}`}
                              className="form-label"
                            >
                              Length
                              <span className="text-secondary-vivid">*</span>
                            </Label>
                            <span className="usa-hint form-hint">inches</span>
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
                            />
                          </FormGroup>
                        </div>
                      </div>

                      {/* Catch Time */}
                      <FormGroup>
                        <Label
                          htmlFor={`recorded-time-${index}`}
                          className="form-label time-label"
                        >
                          Time<span className="text-secondary-vivid">*</span>
                        </Label>
                        <TimePicker
                          id={`recorded-time-${index}`}
                          name="time"
                          defaultValue={catchItem.time}
                          onChange={(time) =>
                            handleRecordedTimeChange(index, time)
                          }
                          validationStatus={
                            submitted && errors.time ? "error" : undefined
                          }
                          className={
                            submitted && errors.time
                              ? "usa-input--error error-input-field"
                              : ""
                          }
                          minTime="00:00"
                          maxTime="23:30"
                          step={15}
                        />
                      </FormGroup>

                      {/* Latitude and Longitude on same row */}
                      <div className="coordinate-inputs">
                        {/* Latitude Input */}
                        <div className="coordinate-input">
                          <FormGroup>
                            <Label
                              htmlFor={`recorded-latitude-${index}`}
                              className="form-label"
                            >
                              Latitude
                            </Label>
                            <span className="usa-hint form-hint">DD</span>
                            <TextInput
                              id={`recorded-latitude-${index}`}
                              name="latitude"
                              type="number"
                              value={catchItem.latitude}
                              onChange={(e) => {
                                const { processedValue, skipUpdate } =
                                  processCoordinateInput(
                                    e.target.value,
                                    "latitude",
                                    e.target,
                                  );

                                if (!skipUpdate) {
                                  handleRecordedCatchChange(
                                    index,
                                    "latitude",
                                    processedValue,
                                  );
                                }
                              }}
                            />
                          </FormGroup>
                        </div>

                        {/* Longitude Input */}
                        <div className="coordinate-input">
                          <FormGroup>
                            <Label
                              htmlFor={`recorded-longitude-${index}`}
                              className="form-label"
                            >
                              Longitude
                            </Label>
                            <span className="usa-hint form-hint">DD</span>
                            <TextInput
                              id={`recorded-longitude-${index}`}
                              name="longitude"
                              type="number"
                              value={catchItem.longitude}
                              onChange={(e) => {
                                const { processedValue, skipUpdate } =
                                  processCoordinateInput(
                                    e.target.value,
                                    "longitude",
                                    e.target,
                                  );

                                if (!skipUpdate) {
                                  handleRecordedCatchChange(
                                    index,
                                    "longitude",
                                    processedValue,
                                  );
                                }
                              }}
                            />
                          </FormGroup>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer backPath="/start" nextPath="/end" onNextClick={handleSubmit} />
    </>
  );
}

export default CatchLog;
