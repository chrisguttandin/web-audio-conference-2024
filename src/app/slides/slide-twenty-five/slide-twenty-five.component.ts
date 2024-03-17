import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'wac-slide-twenty-five',
    standalone: true,
    templateUrl: './slide-twenty-five.component.html'
})
export class SlideTwentyFiveComponent {}
