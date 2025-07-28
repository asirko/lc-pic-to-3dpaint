import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ImageLoader } from './components/imgage-loader/image-loader.component';
import { ColorsPickerComponent } from './components/colors-picker/colors-picker.component';
import { LayeredImageComponent } from './components/layered-image/layered-image.component';
import { RGB } from './interfaces/colors.interface';
import { getColorDistance, transformRGBToHex } from './utils/colors.utils';

@Component({
  selector: 'lc-app',
  imports: [ImageLoader, ColorsPickerComponent, LayeredImageComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  readonly imageData = signal<ImageData | undefined>(undefined);
  readonly colors = signal<string[]>(['#ffffff', '#000000']);

  guesstimateColors() {
    let pixels: RGB[] = [];
    const imageDataArray = this.imageData()!.data;
    for (let i = 0; i < imageDataArray.length; i += 4) {
      pixels.push([imageDataArray[i], imageDataArray[i + 1], imageDataArray[i + 2]]);
    }
    const colorsSelected: RGB[] = [];
    for (let i = 0; i < 8; i++) {
      const mostPresentColor = this.#getMostPresentColor(pixels);
      colorsSelected.push(mostPresentColor);
      pixels = pixels.filter(pixel => getColorDistance(pixel, mostPresentColor) > 20);
    }
    this.colors.set(colorsSelected.map(transformRGBToHex));
    console.log(colorsSelected);
  }

  #getMostPresentColor(pixels: RGB[]): RGB {
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
}
