import "../index.css";
import "./CatchLog.css";
import React, { useState, useRef } from "react";
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
import Footer from "../components/Footer";
import StepIndicator from "../components/StepIndicator";
import {
  validateRequired,
  validateLatitude,
  validateLongitude,
  validateNumberRange,
  validateChain,
} from "../utils/validation";
import { processCoordinateInput } from "../utils/inputProcessing";

// Field name constants
const FIELD_SPECIES = "Species";
const FIELD_WEIGHT = "Weight";
const FIELD_LENGTH = "Length";
const FIELD_LATITUDE = "Latitude";
const FIELD_LONGITUDE = "Longitude";
const FIELD_TIME = "Catch time";

function CatchLog() {
  const navigate = useNavigate();
  const formRef = useRef(null);

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
  
  // For editing existing catches
  const [editIndex, setEditIndex] = useState(null);
  
  // Form validation errors
  const [errors, setErrors] = useState({});

  // Handle input changes for text fields and selects
  const handleInputChange = (e) => {
    if (e && e.target) {
      const { name, value } = e.target;

      // For latitude and longitude, apply input processing
      if (name === "latitude" || name === "longitude") {
        const { processedValue, skipUpdate } = processCoordinateInput(
          value, 
          name, 
          e.target
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

    // Validate species
    const speciesError = validateRequired(currentCatch.species, FIELD_SPECIES);
    if (speciesError) newErrors.species = speciesError;

    // Validate weight (positive number)
    const weightError = validateChain(
      validateRequired(currentCatch.weight, FIELD_WEIGHT),
      validateNumberRange(currentCatch.weight, 0, 999999, FIELD_WEIGHT)
    );
    if (weightError) newErrors.weight = weightError;

    // Validate length (positive number)
    const lengthError = validateChain(
      validateRequired(currentCatch.length, FIELD_LENGTH),
      validateNumberRange(currentCatch.length, 0, 999999, FIELD_LENGTH)
    );
    if (lengthError) newErrors.length = lengthError;

    // Validate latitude
    const latitudeError = validateChain(
      validateRequired(currentCatch.latitude, FIELD_LATITUDE),
      validateLatitude(currentCatch.latitude)
    );
    if (latitudeError) newErrors.latitude = latitudeError;

    // Validate longitude
    const longitudeError = validateChain(
      validateRequired(currentCatch.longitude, FIELD_LONGITUDE),
      validateLongitude(currentCatch.longitude)
    );
    if (longitudeError) newErrors.longitude = longitudeError;

    // Validate time
    const timeError = validateRequired(currentCatch.time, FIELD_TIME);
    if (timeError) newErrors.time = timeError;

    return newErrors;
  };

  // Handle adding a new catch
  const handleAddCatch = (e) => {
    e.preventDefault();
    setSubmitted(true);

    const newErrors = validateForm();
    setErrors(newErrors);

    // If no errors, add catch to list
    if (Object.keys(newErrors).length === 0) {
      if (editIndex !== null) {
        // Update existing catch
        const updatedCatches = [...catches];
        updatedCatches[editIndex] = { ...currentCatch };
        setCatches(updatedCatches);
        setEditIndex(null);
      } else {
        // Add new catch
        setCatches([...catches, { ...currentCatch }]);
      }

      // Reset form
      setCurrentCatch({
        species: "",
        weight: "",
        length: "",
        latitude: "",
        longitude: "",
        time: "",
      });
      setSubmitted(false);
    }
  };

  // Handle editing a catch
  const handleEditCatch = (index) => {
    setCurrentCatch({ ...catches[index] });
    setEditIndex(index);
    setSubmitted(false);
    setErrors({});
    formRef.current.scrollIntoView({ behavior: "smooth" });
  };

  // Handle deleting a catch
  const handleDeleteCatch = (index) => {
    if (window.confirm("Are you sure you want to delete this catch?")) {
      const updatedCatches = [...catches];
      updatedCatches.splice(index, 1);
      setCatches(updatedCatches);
      
      // If we're currently editing this catch, reset the form
      if (editIndex === index) {
        setCurrentCatch({
          species: "",
          weight: "",
          length: "",
          latitude: "",
          longitude: "",
          time: "",
        });
        setEditIndex(null);
        setSubmitted(false);
      } else if (editIndex !== null && editIndex > index) {
        // Adjust editIndex if we're deleting a catch before the one being edited
        setEditIndex(editIndex - 1);
      }
    }
  };

  // Handle form submission for navigating to next page
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // TODO: Save catches to storage/state management
    console.log("Catches to be saved:", catches);
    
    // Navigate to next page
    navigate("/end");
  };

  return (
    <>
      <div className="page-content" ref={formRef}>
        <div className="content-container">
          <StepIndicator />
          
          {/* Catch entry form */}
          <div className="catch-form-container">
            {/* <h2 className="usa-prose">{editIndex !== null ? "Edit Catch" : "Add New Catch"}</h2> */}
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
                  <option value="Yellowfin">Yellowfin</option>
                  <option value="Bluefin">Bluefin</option>
                  <option value="Salmon">Salmon</option>
                  <option value="Halibut">Halibut</option>
                </Select>
                <ErrorMessage id="species-error-message" className="error-message">
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
                    <ErrorMessage id="weight-error-message" className="error-message">
                      {(submitted && errors.weight && errors.weight) || "\u00A0"}
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
                    <ErrorMessage id="length-error-message" className="error-message">
                      {(submitted && errors.length && errors.length) || "\u00A0"}
                    </ErrorMessage>
                  </FormGroup>
                </div>
              </div>

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
                      Latitude<span className="text-secondary-vivid">*</span>
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
                    <ErrorMessage id="latitude-error-message" className="error-message">
                      {(submitted && errors.latitude && errors.latitude) || "\u00A0"}
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
                      Longitude<span className="text-secondary-vivid">*</span>
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
                    <ErrorMessage id="longitude-error-message" className="error-message">
                      {(submitted && errors.longitude && errors.longitude) || "\u00A0"}
                    </ErrorMessage>
                  </FormGroup>
                </div>
              </div>

              {/* Catch Time */}
              <FormGroup
                error={submitted && errors.time}
                className="margin-bottom-4"
              >
                <Label
                  htmlFor="catchTime"
                  error={submitted && errors.time}
                  className="form-label time-label"
                >
                  Time<span className="text-secondary-vivid">*</span>
                </Label>
                <TimePicker
                  id="catchTime"
                  name="time"
                  value={currentCatch.time}
                  onChange={(time) => handleTimeChange(time)}
                  minTime="00:00"
                  maxTime="23:30"
                  validationStatus={
                    submitted && errors.time ? "error" : undefined
                  }
                  aria-describedby={
                    submitted && errors.time
                      ? "time-error-message"
                      : undefined
                  }
                />
                <ErrorMessage id="time-error-message" className="error-message">
                  {(submitted && errors.time && errors.time) || "\u00A0"}
                </ErrorMessage>
              </FormGroup>

              {/* Add/Update Catch Button */}
              <div className="catch-form-actions">
                <Button type="submit" className="add-catch-button">
                  {editIndex !== null ? "Update Catch" : "Add Catch"}
                </Button>
              </div>
            </Form>
          </div>

          {/* Catch List */}
          {catches.length > 0 && (
            <div className="catch-list-container margin-top-4">
              <h2 className="usa-prose">Recorded Catches</h2>
              <div className="catch-list">
                {catches.map((catchItem, index) => (
                  <div key={index} className="catch-item">
                    <div className="catch-item-content">
                      <FormGroup>
                        <Label className="recorded-label">Species:</Label>
                        <div className="recorded-value">{catchItem.species}</div>
                      </FormGroup>
                      <div className="catch-item-details">
                        <div className="catch-item-measurement">
                          <Label className="recorded-label">Weight:</Label>
                          <div className="recorded-value">{catchItem.weight} lbs</div>
                        </div>
                        <div className="catch-item-measurement">
                          <Label className="recorded-label">Length:</Label>
                          <div className="recorded-value">{catchItem.length} inches</div>
                        </div>
                        <div className="catch-item-coordinates">
                          <Label className="recorded-label">Coordinates:</Label>
                          <div className="recorded-value">{catchItem.latitude}°, {catchItem.longitude}°</div>
                        </div>
                        <div className="catch-item-time">
                          <Label className="recorded-label">Time:</Label>
                          <div className="recorded-value">{catchItem.time}</div>
                        </div>
                      </div>
                    </div>
                    <div className="catch-item-actions">
                      <Button
                        type="button"
                        unstyled
                        onClick={() => handleEditCatch(index)}
                        className="edit-catch-button"
                      >
                        <Icon.Edit size={3} />
                      </Button>
                      <Button
                        type="button"
                        unstyled
                        onClick={() => handleDeleteCatch(index)}
                        className="delete-catch-button"
                      >
                        <Icon.Delete size={3} />
                      </Button>
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