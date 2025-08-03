import { RGB } from '../../interfaces/colors.interface';
import { getColorDistance, transformRGBToHex } from '../../utils/colors.utils';

export function customGuesstimateColors(imageData: ImageData): string[] {
  let pixels: RGB[] = [];
  for (let i = 0; i < imageData.data.length; i += 4) {
    pixels.push([imageData.data[i], imageData.data[i + 1], imageData.data[i + 2]]);
  }
  const colorsSelected: RGB[] = [];
  for (let i = 0; i < 8; i++) {
    const mostPresentColor = getMostPresentColor(pixels);
    colorsSelected.push(mostPresentColor);
    pixels = pixels.filter(pixel => getColorDistance(pixel, mostPresentColor) > 20);
  }
  return colorsSelected.map(transformRGBToHex);
}

function getMostPresentColor(pixels: RGB[]): RGB {
  const colorsCount = new Map<string /*color hex3*/, number /*nb pixels with such color*/>();
  for (let pixel of pixels) {
    const color16 = pixel.map(c => Math.floor(c / 16));
    const hex3 = `#${color16.map(c => c.toString(16)).join('')}`;
    if (!colorsCount.has(hex3)) {
      colorsCount.set(hex3, 1);
    } else {
      colorsCount.set(hex3, colorsCount.get(hex3)! + 1);
    }
  }
  const mostPresentHex3 = [...colorsCount.entries()]
    .map(([hex3, nbPixel]) => ({ hex3, nbPixel }))
    .reduce((acc, curr) => (acc.nbPixel < curr.nbPixel ? curr : acc));

  return mostPresentHex3.hex3
    .slice(1)
    .split('')
    .map(c => parseInt(c + c, 16)) as RGB;
}
