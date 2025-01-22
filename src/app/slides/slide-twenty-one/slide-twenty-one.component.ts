import { ChangeDetectionStrategy, Component, HostListener, inject, signal } from '@angular/core';
import { AudioInputService } from '../../audio-input.service';
import { WindowService } from '../../window.service';
// eslint-disable-next-line max-len
import { AudioWorkletOutputProcessorLevelMeterComponent } from '../audio-worklet-output-processor-level-meter/audio-worklet-output-processor-level-meter.component';
// eslint-disable-next-line max-len
import { AudioWorkletWebWorkerProcessorLevelMeterComponent } from '../audio-worklet-web-worker-processor-level-meter/audio-worklet-web-worker-processor-level-meter.component';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [AudioWorkletOutputProcessorLevelMeterComponent, AudioWorkletWebWorkerProcessorLevelMeterComponent],
    selector: 'wac-slide-twenty-one',
    templateUrl: './slide-twenty-one.component.html'
})
export class SlideTwentyOneComponent {
    public levelSize = signal(7);

    public peakSize = signal(12);

    public smoothingTimeConstant = signal(0);

    public sourceNode = signal<null | AudioNode>(null);

    #audioInputService = inject(AudioInputService);

    #windowService = inject(WindowService);

    constructor() {
        const { nativeWindow } = this.#windowService;

        if (
            nativeWindow !== null &&
            !nativeWindow.matchMedia('(prefers-reduced-motion: reduce)').matches &&
            nativeWindow.navigator.userActivation.isActive
        ) {
            this.#start();
        }
    }

    @HostListener('document:keyup', ['$event']) public handleKeyUp(event: KeyboardEvent): void {
        if (event.code !== undefined && event.code === 'KeyF') {
            this.#freeze();
        } else if (event.code !== undefined && event.code === 'KeyS') {
            this.#start();
        }
    }

    // eslint-disable-next-line class-methods-use-this
    #freeze() {
        const now = performance.now();

        while (performance.now() - now < 1000) {
            // Just block anything else from happening.
        }
    }

    #start() {
        this.sourceNode.set(this.#audioInputService.start());
    }
}
