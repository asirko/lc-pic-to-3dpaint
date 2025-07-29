import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DataStore } from '../../stores/data.store';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';

@Component({
  selector: 'lc-print-params',
  imports: [ReactiveFormsModule, FormsModule],
  templateUrl: './print-params.component.html',
  styleUrl: './print-params.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PrintParamsComponent {
  readonly store = inject(DataStore);
  readonly keepRatio = signal(true);
  readonly diagonale = signal(this.calculateDiagonal());

  constructor() {
    // use to Observable to react only to changes of the store.imageData
    toObservable(this.store.imageData)
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.processDimensionsFromWidth());
  }

  calculateDiagonal() {
    const width = this.store.widthPrintCm();
    const height = this.store.heightPrintCm();
    return Math.sqrt(width ** 2 + height ** 2);
  }

  processDimensionsFromWidth() {
    const width = this.store.widthPrintCm();
    const image = this.store.imageData();
    if (image && this.keepRatio()) {
      const ratio = image.width / image.height;
      this.store.heightPrintCm.set(width / ratio);
      this.diagonale.set(this.calculateDiagonal());
    }
  }

  processDimensionsFromHeight() {
    const height = this.store.heightPrintCm();
    const image = this.store.imageData();
    if (image && this.keepRatio()) {
      const ratio = image.width / image.height;
      this.store.heightPrintCm.set(height * ratio);
      this.diagonale.set(this.calculateDiagonal());
    }
  }

  processDimensionsFromDiagonal() {
    const diagonal = this.diagonale();
    const image = this.store.imageData();
    if (image && this.keepRatio()) {
      const ratio = image.width / image.height;
      const height = Math.sqrt(diagonal ** 2 / (1 + ratio ** 2));
      const width = ratio * height;
      this.store.widthPrintCm.set(width);
      this.store.heightPrintCm.set(height);
    }
  }
}
