import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'wac-slide-ten',
    templateUrl: './slide-ten.component.html'
})
export class SlideTenComponent {}
