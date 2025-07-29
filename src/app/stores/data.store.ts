import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DataStore {
  nozzleDiameterCm = signal(0.4);
  widthPrintCm = signal(15);
  heightPrintCm = signal(10);
  colors = signal<string[]>([]);
  imageData = signal<HTMLImageElement | null>(null);
}
