import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PrismComponent } from '../prism/prism.component';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [PrismComponent],
    selector: 'wac-slide-five',
    standalone: true,
    templateUrl: './slide-five.component.html'
})
export class SlideFiveComponent {}
