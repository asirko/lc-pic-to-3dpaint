import { ChangeDetectionStrategy, Component, effect, ElementRef, input, signal, viewChildren } from '@angular/core';
import { rectangleDimensions } from '../../utils/geometry.utils';
import { getClosestColorIndex, transformHexToRgb } from '../../utils/colors.utils';
import { RGB } from '../../interfaces/colors.interface';

@Component({
  selector: 'lc-layered-image',
  imports: [],
  templateUrl: './layered-image.component.html',
  styleUrl: './layered-image.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LayeredImageComponent {
  readonly imageData = input.required<ImageData>();
  readonly colors = input.required<string[]>();

  readonly canvasArray = viewChildren<ElementRef<HTMLCanvasElement>>('canvas');

  readonly diagonal = signal(10);

  constructor() {
    effect(() => {
      const imageData = this.imageData();
      const rgbColors = this.colors().map(color => transformHexToRgb(color));
      const canvasArray = this.canvasArray().map(er => er.nativeElement);
      const diagonal = this.diagonal();

      if (canvasArray.length > 1 && canvasArray.length === rgbColors.length) {
        const targetImageDataArray = getTargetImageDataArray(imageData, rgbColors);
        const dimensions = rectangleDimensions(diagonal, imageData.width, imageData.height);

        canvasArray.forEach((canvas, colorIndex) => {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            canvas.width = imageData.width;
            canvas.height = imageData.height;
            canvas.style.width = `${dimensions.widthCm}cm`;
            canvas.style.height = `${dimensions.heightCm}cm`;
            //ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.putImageData(targetImageDataArray[colorIndex], 0, 0);
          }
        });
      }
    });
  }
}

function getTargetImageDataArray(imageData: ImageData, rgbColors: RGB[]): ImageData[] {
  const targetImageDataArray = rgbColors.map(
    () =>
      new ImageData(
        imageData.data.map(() => 0),
        imageData.width,
        imageData.height,
      ),
  );

  for (let i = 0; i < imageData.data.length; i += 4) {
    const color = imageData.data.slice(i, i + 3) as unknown as RGB;
    const closestColorIndex = getClosestColorIndex(color, rgbColors);
    const closestColor = rgbColors[closestColorIndex];
    targetImageDataArray[closestColorIndex].data[i] = closestColor[0]; // Set alpha to 255
    targetImageDataArray[closestColorIndex].data[i + 1] = closestColor[1]; // G
    targetImageDataArray[closestColorIndex].data[i + 2] = closestColor[2]; // B
    targetImageDataArray[closestColorIndex].data[i + 3] = 255; // A
  }

  return targetImageDataArray;
}
