/**
 * Formats an ISO date string (or Date object) into a localized date display
 * @param {string | Date} dateString - The date string or object to format
 * @returns {string} The formatted date string, or fallback text if input is invalid
 */
export const formatDate = (dateString) => {
  if (!dateString) return "No date";
  try {
    const date = new Date(dateString);
    // Check if the date is valid after parsing
    if (isNaN(date.getTime())) {
      return "Invalid date";
    }
    return date.toLocaleDateString(); // Uses browser's locale
  } catch (e) {
    console.error("Error formatting date:", e);
    return "Invalid date"; // Return fallback text on formatting error
  }
};

/**
 * Formats a time string (HH:MM) from 24-hour format to 12-hour format with AM/PM
 * @param {string} timeString - The time string in HH:MM format
 * @returns {string} The formatted time string (e.g., "1:30 PM"), or "" if input is invalid
 */
export const format24HourTo12Hour = (timeString) => {
  if (
    !timeString ||
    typeof timeString !== "string" ||
    !timeString.includes(":")
  )
    return "";

  try {
    // Parse hours and minutes
    const [hoursStr, minutesStr] = timeString.split(":");
    let hours = parseInt(hoursStr, 10);
    const minutes = minutesStr.padStart(2, "0"); // Ensure minutes are two digits

    // Validate parsed values
    if (isNaN(hours) || hours < 0 || hours > 23) return "";

    // Determine AM/PM
    const period = hours >= 12 ? "PM" : "AM";

    // Convert hours to 12-hour format
    hours = hours % 12;
    hours = hours === 0 ? 12 : hours; // Convert 0 to 12 for 12 AM/PM

    return `${hours}:${minutes} ${period}`;
  } catch (e) {
    console.error("Error formatting time:", e);
    return ""; // Return empty string on formatting error
  }
}; 