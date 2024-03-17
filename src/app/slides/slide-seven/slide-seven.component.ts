import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PrismComponent } from '../prism/prism.component';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [PrismComponent],
    selector: 'wac-slide-seven',
    standalone: true,
    templateUrl: './slide-seven.component.html'
})
export class SlideSevenComponent {}
