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

function StartTrip() {
  const navigate = useNavigate();
  
  // TODO: Replace with RADFish IndexedDB Storage
  const [formData, setFormData] = useState({
    latitude: '',
    longitude: '',
    weather: '',
    startTime: '',
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
    
    // If no errors, save data and navigate to next page
    if (Object.keys(newErrors).length === 0) {
      // TODO: Implement data storage here
      console.log('Trip data to be saved:', formData);
      navigate('/catch');
    }
  };

  return (
    <>
      <div className="page-content">
        <StepIndicator />
        <h1>Start Trip</h1>
        <div style={{ 
          width: '100%', 
          maxWidth: '600px', 
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Form onSubmit={handleSubmit}>
            {/* Latitude and Longitude on same row */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
              {/* Latitude Input */}
              <div style={{ flex: '1' }}>
                <FormGroup error={submitted && errors.latitude}>
                  <Label 
                    htmlFor="latitude" 
                    error={submitted && errors.latitude}
                    style={{ textAlign: 'left', display: 'block', width: '100%' }}
                  >
                    Latitude<span className="text-secondary-vivid">*</span>
                  </Label>
                  <span className="usa-hint" style={{ textAlign: 'left', display: 'block' }}>DD</span>
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
              </div>

              {/* Longitude Input */}
              <div style={{ flex: '1' }}>
                <FormGroup error={submitted && errors.longitude}>
                  <Label 
                    htmlFor="longitude" 
                    error={submitted && errors.longitude}
                    style={{ textAlign: 'left', display: 'block', width: '100%' }}
                  >
                    Longitude<span className="text-secondary-vivid">*</span>
                  </Label>
                  <span className="usa-hint" style={{ textAlign: 'left', display: 'block' }}>DD</span>
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
              </div>
            </div>

            {/* Weather Conditions Select - Full Width */}
            <FormGroup error={submitted && errors.weather} className="margin-bottom-4">
              <Label 
                htmlFor="weather" 
                error={submitted && errors.weather}
                style={{ textAlign: 'left', display: 'block', width: '100%' }}
              >
                Weather<span className="text-secondary-vivid">*</span>
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
                <option value="">-Select-</option>
                <option value="Sunny">Sunny</option>
                <option value="Cloudy">Cloudy</option>
                <option value="Rainy">Rainy</option>
              </Select>
            </FormGroup>

            {/* Trip Start Time - Full Width */}
            <FormGroup error={submitted && errors.startTime} className="margin-bottom-4">
              <Label 
                htmlFor="startTime" 
                error={submitted && errors.startTime}
                style={{ textAlign: 'left', display: 'block', width: '100%' }}
              >
                Time<span className="text-secondary-vivid">*</span>
              </Label>
              {submitted && errors.startTime && (
                <ErrorMessage id="startTime-error-message">
                  {errors.startTime}
                </ErrorMessage>
              )}
              <TimePicker
                id="startTime"
                name="startTime"
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
