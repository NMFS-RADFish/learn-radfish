/**
 * Aggregates raw catch data by species
 * Calculates total count, total weight, and average length for each species
 * @param {Array} catchData - An array of catch objects from the RADFish store
 * @returns {Array} An array of objects, each representing aggregated data for one species
 */
export const aggregateCatchesBySpecies = (catchData) => {
  if (!Array.isArray(catchData)) {
    console.warn("aggregateCatchesBySpecies: catchData must be an array");
    return [];
  }

  // Use a map to group catches by species
  const speciesMap = {};

  catchData.forEach((catchItem) => {
    // Skip items without species
    if (!catchItem.species) return;

    // Initialize species entry if it doesn't exist
    if (!speciesMap[catchItem.species]) {
      speciesMap[catchItem.species] = {
        species: catchItem.species,
        weights: [],
        lengths: [],
        count: 0,
      };
    }
    
    // Add weight and length to arrays for calculation, increment count
    speciesMap[catchItem.species].weights.push(catchItem.weight || 0); // Default to 0 if null/undefined
    speciesMap[catchItem.species].lengths.push(catchItem.length || 0); // Default to 0 if null/undefined
    speciesMap[catchItem.species].count++;
  });

  // Calculate totals and averages for each species
  return Object.values(speciesMap).map((item) => {
    const totalWeight = item.weights.reduce((sum, val) => sum + val, 0);
    const totalLength = item.lengths.reduce((sum, val) => sum + val, 0);
    const avgLength = item.count > 0 ? totalLength / item.count : 0;

    return {
      species: item.species,
      totalWeight: totalWeight.toFixed(1), // Format to one decimal place
      avgLength: avgLength.toFixed(1), // Format to one decimal place
      count: item.count,
    };
  });
}; 