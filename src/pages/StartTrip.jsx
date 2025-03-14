import "../index.css";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Form,
  Label,
  TextInput,
  FormGroup,
  ErrorMessage,
  TimePicker,
  Select,
} from "@trussworks/react-uswds";
import Footer from "../components/Footer";
import StepIndicator from "../components/StepIndicator";
import { useLocalStorage } from "../hooks/useLocalStorage";

function StartTrip() {
  const navigate = useNavigate();
  const { setItem, getItem } = useLocalStorage();
  
  // Initialize form data from localStorage if it exists
  const [formData, setFormData] = useState(() => {
    const savedData = getItem('tripData');
    return savedData || {
      latitude: '',
      longitude: '',
      weather: '',
      startTime: '',
    };
  });
  
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  // Handle input changes
  const handleInputChange = (e) => {
    // Check if e is an event (from TextInput/Select) or a direct value (from TimePicker)
    if (e && e.target) {
      const { name, value } = e.target;
      setFormData({
        ...formData,
        [name]: value,
      });
      
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
  const handleTimeChange = (time, name = 'startTime') => {
    setFormData({
      ...formData,
      [name]: time,
    });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: undefined,
      });
    }
  };

  // Validate form data
  const validateForm = () => {
    const newErrors = {};
    
    // Validate latitude
    if (!formData.latitude) {
      newErrors.latitude = 'Latitude is required';
    } else if (isNaN(formData.latitude) || 
               Number(formData.latitude) < -90 || 
               Number(formData.latitude) > 90) {
      newErrors.latitude = 'Latitude must be between -90 and 90 degrees';
    }
    
    // Validate longitude
    if (!formData.longitude) {
      newErrors.longitude = 'Longitude is required';
    } else if (isNaN(formData.longitude) || 
               Number(formData.longitude) < -180 || 
               Number(formData.longitude) > 180) {
      newErrors.longitude = 'Longitude must be between -180 and 180 degrees';
    }
    
    // Validate weather
    if (!formData.weather) {
      newErrors.weather = 'Weather condition is required';
    }
    
    // Validate start time
    if (!formData.startTime) {
      newErrors.startTime = 'Start time is required';
    }
    
    return newErrors;
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    
    const newErrors = validateForm();
    setErrors(newErrors);
    
    // If no errors, save to localStorage and navigate to next page
    if (Object.keys(newErrors).length === 0) {
      setItem('tripData', formData);
      navigate('/catch');
    }
  };

  return (
    <>
      <div className="page-content">
        <StepIndicator />
        
        <h1>Start Trip</h1>
        <p>Enter your trip details below to begin.</p>
        
        <div style={{ width: '100%', maxWidth: '600px', margin: '0 auto' }}>
          <Form onSubmit={handleSubmit}>
            {/* Latitude Input */}
            <FormGroup error={submitted && errors.latitude}>
              <Label htmlFor="latitude" error={submitted && errors.latitude}>
                Latitude
              </Label>
              {submitted && errors.latitude && (
                <ErrorMessage id="latitude-error-message">
                  {errors.latitude}
                </ErrorMessage>
              )}
              <TextInput
                id="latitude"
                name="latitude"
                type="number"
                step="0.000001"
                value={formData.latitude}
                onChange={handleInputChange}
                validationStatus={submitted && errors.latitude ? 'error' : undefined}
                aria-describedby={submitted && errors.latitude ? "latitude-error-message" : undefined}
              />
            </FormGroup>

            {/* Longitude Input */}
            <FormGroup error={submitted && errors.longitude}>
              <Label htmlFor="longitude" error={submitted && errors.longitude}>
                Longitude
              </Label>
              {submitted && errors.longitude && (
                <ErrorMessage id="longitude-error-message">
                  {errors.longitude}
                </ErrorMessage>
              )}
              <TextInput
                id="longitude"
                name="longitude"
                type="number"
                step="0.000001"
                value={formData.longitude}
                onChange={handleInputChange}
                validationStatus={submitted && errors.longitude ? 'error' : undefined}
                aria-describedby={submitted && errors.longitude ? "longitude-error-message" : undefined}
              />
            </FormGroup>

            {/* Weather Conditions Select */}
            <FormGroup error={submitted && errors.weather}>
              <Label htmlFor="weather" error={submitted && errors.weather}>
                Weather Conditions
              </Label>
              {submitted && errors.weather && (
                <ErrorMessage id="weather-error-message">
                  {errors.weather}
                </ErrorMessage>
              )}
              <Select
                id="weather"
                name="weather"
                value={formData.weather}
                onChange={handleInputChange}
                validationStatus={submitted && errors.weather ? 'error' : undefined}
                aria-describedby={submitted && errors.weather ? "weather-error-message" : undefined}
              >
                <option value="">- Select weather condition -</option>
                <option value="Sunny">Sunny</option>
                <option value="Cloudy">Cloudy</option>
                <option value="Rainy">Rainy</option>
              </Select>
            </FormGroup>

            {/* Trip Start Time */}
            <FormGroup error={submitted && errors.startTime}>
              <Label htmlFor="startTime" error={submitted && errors.startTime}>
                Trip Start Time
              </Label>
              {submitted && errors.startTime && (
                <ErrorMessage id="startTime-error-message">
                  {errors.startTime}
                </ErrorMessage>
              )}
              <TimePicker
                id="startTime"
                name="startTime"
                hint="hh:mm"
                value={formData.startTime}
                onChange={(time) => handleTimeChange(time)}
                minTime="00:00"
                maxTime="23:30"
                step={30}
                validationStatus={submitted && errors.startTime ? 'error' : undefined}
                aria-describedby={submitted && errors.startTime ? "startTime-error-message" : undefined}
              />
            </FormGroup>
          </Form>
        </div>
      </div>
      
      <Footer nextPath="/catch" onNextClick={handleSubmit} />
    </>
  );
}

export default StartTrip;
