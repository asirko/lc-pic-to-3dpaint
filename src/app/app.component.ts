import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ImageLoader } from './components/imgage-loader/image-loader.component';
import { ColorsPickerComponent } from './components/colors-picker/colors-picker.component';
import { LayeredImageComponent } from './components/layered-image/layered-image.component';

@Component({
  selector: 'lc-app',
  imports: [ImageLoader, ColorsPickerComponent, LayeredImageComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  readonly imageData = signal<ImageData | undefined>(undefined);
  readonly colors = signal<string[]>([]);
}
