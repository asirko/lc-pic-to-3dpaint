import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule } from '@angular/forms';
import { moveItemInArray } from '@angular/cdk/drag-drop';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { extractMainColorsByKMeans } from '../../logic/extract-main-colors/kmeans.logic';
import { DataStore } from '../../stores/data.store';
import { customGuesstimateColors } from '../../logic/extract-main-colors/custom-guesstimate.logic';

@Component({
  selector: 'lc-colors-picker',
  imports: [ReactiveFormsModule],
  templateUrl: './colors-picker.component.html',
  styleUrl: './colors-picker.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ColorsPickerComponent {
  readonly #fb = inject(FormBuilder);
  readonly #ds = inject(DataStore);

  readonly imageData = this.#ds.imageData;
  readonly colorArray = this.#fb.nonNullable.array<FormControl<string>>([]);

  constructor() {
    this.colorArray.valueChanges.pipe(takeUntilDestroyed()).subscribe(colors => this.#ds.colors.set(colors));
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
    const imageData = this.imageData();
    if (!imageData) {
      return;
    }
    this.#setColors(customGuesstimateColors(imageData));
  }

  kMeans() {
    const imageData = this.imageData();
    if (!imageData) {
      return;
    }
    this.#setColors(extractMainColorsByKMeans(imageData, 5));
  }

  #setColors(colors: string[]) {
    this.colorArray.reset();
    colors.forEach(color => this.colorArray.push(this.#fb.nonNullable.control(color)));
  }
}
