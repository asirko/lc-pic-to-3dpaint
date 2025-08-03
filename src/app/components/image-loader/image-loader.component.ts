import { ChangeDetectionStrategy, Component, effect, ElementRef, inject, signal, viewChild } from '@angular/core';
import { readFileAsDataURL, readImage } from '../../utils/file.utils';
import { DataStore } from '../../stores/data.store';
import { Step } from '../step.abstract';

@Component({
  selector: 'lc-image-loader',
  imports: [],
  templateUrl: './image-loader.component.html',
  styleUrl: './image-loader.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageLoader extends Step {
  readonly #ds = inject(DataStore);

  readonly canvas = viewChild<ElementRef<HTMLCanvasElement>>('canvas');
  readonly file = signal<File | undefined>(undefined);
  readonly img = signal<HTMLImageElement | undefined>(undefined);
  readonly isDragOver = signal(false);

  constructor() {
    super();
    effect(() => {
      const canvas = this.canvas()?.nativeElement;
      const img = this.img();
      if (canvas && img) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(this.img()!, 0, 0, canvas.width, canvas.height);
          const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height);
          if (imageData) {
            this.#ds.imageData.set(imageData);
          }
        }
      }
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.#loadFile(input.files[0]);
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragOver.set(true);
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragOver.set(false);
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragOver.set(false);
    if (event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      this.#loadFile(event.dataTransfer.files[0]);
    }
  }

  async #loadFile(file: File) {
    this.file.set(file);
    const fileAsDataUrl = await readFileAsDataURL(file);
    const img = await readImage(fileAsDataUrl);
    this.img.set(img);
    this.#ds.imageElement.set(img);
  }
}
