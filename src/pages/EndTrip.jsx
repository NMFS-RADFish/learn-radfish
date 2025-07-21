import "../index.css";

import React, { useState, useEffect } from "react";
import { useApplication } from "@nmfs-radfish/react-radfish";
import {
  Button,
  Form,
  FormGroup,
  Grid,
  GridContainer,
  Label,
  Select,
  StepIndicator,
  StepIndicatorStep,
  TimePicker,
} from "@trussworks/react-uswds";
import {
  FIELD_NAMES,
} from "../utils";
import { useTripNavigation, useTripData } from "../hooks";

function EndTrip() {
  // --- RADFish Application Context ---
  const app = useApplication();
  
  // --- Custom Hooks ---
  const { tripId, navigateHome, navigateWithTripId } = useTripNavigation();
  
  // --- State Management ---
  const [formData, setFormData] = useState({
    endWeather: "",
    endTime: "",
  });
  
  // --- Trip Data Management ---
  const { trip, isLoading, updateTrip } = useTripData(
    tripId,
    (error) => {
      console.warn("Trip loading error:", error);
      navigateHome();
    }
  );
  
  // --- Effects ---
  useEffect(() => {
    if (trip) {
      setFormData({
        endWeather: trip.endWeather || "",
        endTime: trip.endTime || "",
      });
    }
  }, [trip]);
  
  // --- Event Handlers ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleTimeChange = (time, fieldName = 'endTime') => {
    setFormData(prev => ({ ...prev, [fieldName]: time }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const success = await updateTrip({
        ...formData,
        status: "in-progress",
        step: 4
      });
      
      if (success) {
        navigateWithTripId("/review", tripId);
      } else {
        throw new Error("Failed to update trip");
      }
    } catch (error) {
      console.error("Error saving end trip data:", error);
    }
  };
  
  // --- Render Logic ---
  if (isLoading) {
    return <div className="padding-5 text-center">Loading trip end details...</div>;
  }
  
  return (
    <>
      <GridContainer className="padding-y-4 padding-x-0 width-full maxw-mobile-lg">
        <Grid row>
          <Grid col="fill">
            <div className="margin-top-4 border-bottom border-base-light padding-bottom-2">
              <StepIndicator
                headingLevel="h4"
                ofText="of"
                stepText="Step"
                className="usa-step-indicator margin-bottom-0"
                showLabels={false}
              >
                <StepIndicatorStep label="Start Trip" status="complete" />
                <StepIndicatorStep label="Log Catch" status="complete" />
                <StepIndicatorStep label="End Trip" status="current" />
                <StepIndicatorStep label="Review and Submit" />
              </StepIndicator>
            </div>
            
            <Form onSubmit={handleSubmit} large className="margin-top-3">
              <FormGroup>
                <Label htmlFor="endWeather" requiredMarker>
                  End Weather
                </Label>
                <Select
                  id="endWeather"
                  name="endWeather"
                  value={formData.endWeather}
                  onChange={handleInputChange}
                >
                  <option value="">-Select-</option>
                  <option value="Sunny">Sunny</option>
                  <option value="Cloudy">Cloudy</option>
                  <option value="Rainy">Rainy</option>
                </Select>
              </FormGroup>

              <FormGroup>
                <Label htmlFor="endTime" requiredMarker>
                  End Time
                </Label>
                <TimePicker
                  id="endTime"
                  name="endTime"
                  defaultValue={formData.endTime}
                  onChange={(time) => handleTimeChange(time, 'endTime')}
                  minTime="00:00"
                  maxTime="23:30"
                  step={30}
                />
              </FormGroup>
            </Form>
          </Grid>
        </Grid>
      </GridContainer>
      
      <footer className="position-fixed bottom-0 width-full bg-gray-5 padding-bottom-2 padding-x-2 shadow-1 z-top">
        <div className="display-flex flex-justify maxw-mobile-lg margin-x-auto padding-top-2">
          <Button
            outline
            type="button"
            className="width-card-lg bg-white"
            onClick={() => navigateWithTripId("/catch", tripId)}
          >
            Back
          </Button>
          <Button
            type="submit"
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

export default EndTrip;