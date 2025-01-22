import { ChangeDetectionStrategy, Component, HostListener, inject, signal } from '@angular/core';
import { AudioInputService } from '../../audio-input.service';
import { WindowService } from '../../window.service';
// eslint-disable-next-line max-len
import { AudioWorkletPostMessageProcessorLevelMeterComponent } from '../audio-worklet-post-message-processor-level-meter/audio-worklet-post-message-processor-level-meter.component';
import { AnalyserNodeLevelMeterComponent } from '../analyser-node-level-meter/analyser-node-level-meter.component';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [AnalyserNodeLevelMeterComponent, AudioWorkletPostMessageProcessorLevelMeterComponent],
    selector: 'wac-slide-eight',
    templateUrl: './slide-eight.component.html'
})
export class SlideEightComponent {
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
        if (event.code !== undefined && event.code === 'KeyC') {
            this.#click();
        } else if (event.code !== undefined && event.code === 'KeyS') {
            this.#start();
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function, class-methods-use-this, no-empty-function
    #click = () => {};

    #start() {
        const sourceNode = this.#audioInputService.start();
        const gainNode = new GainNode(sourceNode.context);
        const waveShaperNode = new WaveShaperNode(sourceNode.context, { curve: [-1, 1] });

        this.#click = () => {
            const constantSourceNode = new ConstantSourceNode(sourceNode.context, { offset: 2 });
            const { currentTime } = sourceNode.context;

            constantSourceNode.connect(gainNode);
            constantSourceNode.start(currentTime);
            constantSourceNode.stop(currentTime + 1 / sourceNode.context.sampleRate);
        };

        sourceNode.connect(gainNode).connect(waveShaperNode);

        this.sourceNode.set(waveShaperNode);
    }
}
