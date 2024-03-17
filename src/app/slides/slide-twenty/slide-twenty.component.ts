import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PrismComponent } from '../prism/prism.component';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [PrismComponent],
    selector: 'wac-slide-twenty',
    standalone: true,
    templateUrl: './slide-twenty.component.html'
})
export class SlideTwentyComponent {}
