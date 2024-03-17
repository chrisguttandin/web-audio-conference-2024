import { ChangeDetectionStrategy, Component, HostListener, inject, signal } from '@angular/core';
import { AudioInputService } from '../../audio-input.service';
import { WindowService } from '../../window.service';
// eslint-disable-next-line max-len
import { AudioWorkletPostMessageProcessorLevelMeterComponent } from '../audio-worklet-post-message-processor-level-meter/audio-worklet-post-message-processor-level-meter.component';
// eslint-disable-next-line max-len
import { AudioWorkletOutputProcessorLevelMeterComponent } from '../audio-worklet-output-processor-level-meter/audio-worklet-output-processor-level-meter.component';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [AudioWorkletPostMessageProcessorLevelMeterComponent, AudioWorkletOutputProcessorLevelMeterComponent],
    selector: 'wac-slide-twelve',
    standalone: true,
    templateUrl: './slide-twelve.component.html'
})
export class SlideTwelveComponent {
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
        if (event.code !== undefined && event.code === 'KeyS') {
            this.#start();
        }
    }

    #start() {
        this.sourceNode.set(this.#audioInputService.start());
    }
}
