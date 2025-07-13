/**
 * Calculates statistics for a trip based on its catch data
 * @param {Array} tripCatches - Array of catch objects for a trip
 * @returns {Object} Object containing totalCount, totalWeight, and avgLength
 */
export const calculateTripStats = (tripCatches) => {
  if (!tripCatches || tripCatches.length === 0) {
    return { totalCount: 0, totalWeight: 0, avgLength: 0 };
  }

  const totalCount = tripCatches.length;

  const totalWeight = tripCatches
    .reduce((sum, catchItem) => sum + (catchItem.weight || 0), 0)
    .toFixed(1);

  const totalLength = tripCatches.reduce(
    (sum, catchItem) => sum + (catchItem.length || 0),
    0,
  );

  const avgLength = totalCount > 0 ? (totalLength / totalCount).toFixed(1) : 0;

  return { totalCount, totalWeight, avgLength };
}; 