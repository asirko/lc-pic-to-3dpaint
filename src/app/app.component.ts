import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ImageLoader } from './components/image-loader/image-loader.component';
import { ColorsPickerComponent } from './components/colors-picker/colors-picker.component';
import { LayeredImageComponent } from './components/layered-image/layered-image.component';
import { PrintParamsComponent } from './components/print-params/print-params.component';

@Component({
  selector: 'lc-app',
  imports: [ImageLoader, ColorsPickerComponent, LayeredImageComponent, PrintParamsComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  readonly steps = [
    { icon: 'image', label: "Choix de l'image" },
    { icon: 'tune', label: 'Paramétrage' },
    { icon: 'palette', label: 'Couleurs' },
    { icon: 'visibility', label: 'Aperçu' },
    { icon: 'view_in_ar', label: 'Export 3D' },
  ];
  readonly activeStep = signal(0);

  setStep(index: number) {
    this.activeStep.set(index);
  }
}
