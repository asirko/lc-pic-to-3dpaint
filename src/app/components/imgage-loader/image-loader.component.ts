import { ChangeDetectionStrategy, Component, effect, ElementRef, output, signal, viewChild } from '@angular/core';
import { rectangleDimensions } from '../../utils/geometry.utils';
import { readFileAsDataURL, readImage } from '../../utils/file.utils';

@Component({
  selector: 'lc-image-loader',
  imports: [],
  templateUrl: './image-loader.component.html',
  styleUrl: './image-loader.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageLoader {
  readonly imageDataChange = output<ImageData>();

  readonly canvas = viewChild<ElementRef<HTMLCanvasElement>>('canvas');

  readonly diagonal = signal(10);
  readonly img = signal<HTMLImageElement | undefined>(undefined);

  constructor() {
    effect(() => {
      const canvas = this.canvas()?.nativeElement;
      const img = this.img();
      const diagonal = this.diagonal();
      if (canvas && img && diagonal) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          canvas.width = img.width;
          canvas.height = img.height;
          const dimensions = rectangleDimensions(diagonal, img.width, img.height);
          canvas.style.width = `${dimensions.widthCm}cm`;
          canvas.style.height = `${dimensions.heightCm}cm`;
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(this.img()!, 0, 0, canvas.width, canvas.height);
          const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height);
          if (imageData) {
            this.imageDataChange.emit(imageData);
          }
        }
      }
    });
  }

  async onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const fileAsDataUrl = await readFileAsDataURL(input.files[0]);
      const img = await readImage(fileAsDataUrl);
      this.img.set(img);
    }
  }
}
