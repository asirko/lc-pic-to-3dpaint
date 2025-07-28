import { ChangeDetectionStrategy, Component, inject, input, OnChanges, output } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule } from '@angular/forms';
import { moveItemInArray } from '@angular/cdk/drag-drop';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'lc-colors-picker',
  imports: [ReactiveFormsModule],
  templateUrl: './colors-picker.component.html',
  styleUrl: './colors-picker.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ColorsPickerComponent implements OnChanges {
  readonly #fb = inject(FormBuilder);

  readonly colorsChange = output<string[]>();
  readonly colors = input<string[]>();

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
}
