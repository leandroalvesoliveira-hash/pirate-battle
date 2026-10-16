export function calculateDistance(
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number {
  const distanceX = x1 - x2;
  const distanceY = y1 - y2;

  return Math.hypot(distanceX, distanceY);
}