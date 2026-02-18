/**
 * remove-filename.ts
 * Removes the last dot and anything after it in a string.
 * Example: "example.image.jpg" => "example.image"
 */

export function removeFilename(str: string): string {
  const lastDotIndex = str.lastIndexOf(".");
  if (lastDotIndex === -1) return str; // no dot found, return original
  return str.slice(0, lastDotIndex);
}
