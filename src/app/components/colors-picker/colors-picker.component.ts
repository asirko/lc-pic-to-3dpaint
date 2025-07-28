import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { moveItemInArray } from '@angular/cdk/drag-drop';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { startWith } from 'rxjs';

@Component({
  selector: 'lc-colors-picker',
  imports: [ReactiveFormsModule],
  templateUrl: './colors-picker.component.html',
  styleUrl: './colors-picker.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ColorsPickerComponent implements OnInit {
  readonly #fb = inject(FormBuilder);
  readonly #destroyRef = inject(DestroyRef);

  readonly colorsChange = output<string[]>();

  readonly colorArray = this.#fb.nonNullable.array([
    this.#fb.nonNullable.control('#ffffff'), //
    this.#fb.nonNullable.control('#000000'),
  ]);

  ngOnInit(): void {
    this.colorArray.valueChanges
      .pipe(takeUntilDestroyed(this.#destroyRef), startWith(this.colorArray.getRawValue()))
      .subscribe(colors => this.colorsChange.emit(colors));
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
