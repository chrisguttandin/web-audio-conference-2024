import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'wac-slide-ten',
    standalone: true,
    templateUrl: './slide-ten.component.html'
})
export class SlideTenComponent {}
