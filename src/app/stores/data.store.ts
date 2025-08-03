import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DataStore {
  nozzleDiameterCm = signal(0.4);
  widthPrintCm = signal(15);
  heightPrintCm = signal(10);
  colors = signal<string[]>([]);
  layerThicknessMm = signal(0.2); // todo
  nbLayerPerColor = signal(3); // todo
  imageElement = signal<HTMLImageElement | null>(null);
  imageData = signal<ImageData | null>(null);
}
