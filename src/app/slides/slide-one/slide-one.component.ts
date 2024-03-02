import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'wac-slide-one',
    standalone: true,
    templateUrl: './slide-one.component.html'
})
export class SlideOneComponent {}
