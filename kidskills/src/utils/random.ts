/**
 * Get a random item from an array
 * @param array The array to get a random item from
 * @returns A random item from the array
 */
export function getRandomItem<T>(array: T[]): T {
  if (!array || array.length === 0) {
    throw new Error('Cannot get random item from empty array');
  }
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Get a random integer between min and max (inclusive)
 * @param min Minimum value
 * @param max Maximum value
 * @returns A random integer between min and max
 */
export function getRandomInt(min: number, max: number): number {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Shuffle an array using the Fisher-Yates algorithm
 * @param array The array to shuffle
 * @returns A new shuffled array
 */
export function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
} 