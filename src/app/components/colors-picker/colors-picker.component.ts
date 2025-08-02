import { ChangeDetectionStrategy, Component, inject, input, OnChanges, output } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule } from '@angular/forms';
import { moveItemInArray } from '@angular/cdk/drag-drop';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RGB } from '../../interfaces/colors.interface';
import { getColorDistance, transformRGBToHex } from '../../utils/colors.utils';
import { extractMainColorsByKMeans } from '../../logic/extract-main-colors.logic';

@Component({
  selector: 'lc-colors-picker',
  imports: [ReactiveFormsModule],
  templateUrl: './colors-picker.component.html',
  styleUrl: './colors-picker.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ColorsPickerComponent {
  readonly #fb = inject(FormBuilder);

  readonly colorArray = this.#fb.nonNullable.array<FormControl<string>>([]);

  constructor() {
    this.colorArray.valueChanges.pipe(takeUntilDestroyed()).subscribe(colors => this.colorsChange.emit(colors));
  }

  ngOnChanges() {
    this.colorArray.clear({ emitEvent: false });
    this.colors()?.forEach(color => this.colorArray.push(this.#fb.nonNullable.control(color), { emitEvent: false }));
  }

  addColor() {
    this.colorArray.push(this.#fb.nonNullable.control('#000000'));
  }

  removeColor(i: number) {
    this.colorArray.removeAt(i);
  }

  moveColor(fromIndex: number, toIndex: number) {
    moveItemInArray(this.colorArray.controls, fromIndex, toIndex);
  }

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

  kMeans() {
    this.colors.set(extractMainColorsByKMeans(this.imageData()!, 5));
  }
}
