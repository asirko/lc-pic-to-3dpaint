import { RGB } from '../interfaces/colors.interface';

export function transformHexToRgb(hex: string): RGB {
  if (hex.startsWith('#')) {
    hex = hex.slice(1);
  }
  if (hex.length === 3) {
    hex = hex
      .split('')
      .map(c => c + c)
      .join('');
  }
  if (hex.length !== 6) {
    throw new Error('Invalid hex color format');
  }
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  return [r, g, b];
}

export function transformRGBToHex(rgb: RGB): string {
  if (rgb.length !== 3) {
    throw new Error('Invalid RGB color format');
  }
  return `#${rgb.map(c => c.toString(16).padStart(2, '0')).join('')}`;
}

export function getClosestColorIndex(targetColor: RGB, colors: RGB[]): number {
  if (colors.length < 2) {
    throw new Error('need at lest two colors to find the closest one');
  }
  let closestIndex = 0;
  let closestDistance = getColorDistance(targetColor, colors[0]);

  for (let i = 1; i < colors.length; i++) {
    const distance = getColorDistance(targetColor, colors[i]);
    if (distance < closestDistance) {
      closestDistance = distance;
      closestIndex = i;
    }
  }

  return closestIndex;
}

export function getColorDistance(color1: RGB, color2: RGB): number {
  return Math.sqrt((color1[0] - color2[0]) ** 2 + (color1[1] - color2[1]) ** 2 + (color1[2] - color2[2]) ** 2);
}
