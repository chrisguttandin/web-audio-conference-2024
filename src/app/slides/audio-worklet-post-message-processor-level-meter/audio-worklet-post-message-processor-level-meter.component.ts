import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, effect, inject, input, signal, viewChild } from '@angular/core';
import { AudioWorkletPostMessageProcessorLevelMeterService } from '../../audio-worklet-post-message-processor-level-meter.service';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'wac-audio-worklet-post-message-processor-level-meter',
    templateUrl: './audio-worklet-post-message-processor-level-meter.component.html'
})
export class AudioWorkletPostMessageProcessorLevelMeterComponent {
    public audioWorkletPostMessageProcessorLevelMeterService = inject(AudioWorkletPostMessageProcessorLevelMeterService);

    public canvasRef = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');

    public clicks = signal(0);

    public duration = signal(0);

    public level = signal(0);

    public levelSize = input.required<number>();

    public peak = signal(0);

    public peakSize = input.required<number>();

    public showDuration = input(false);

    public showClicks = input(false);

    public smoothingTimeConstant = input.required<number>();

    public sourceNode = input.required<AudioNode>();

    #changeDetectorRef = inject(ChangeDetectorRef);

    constructor() {
        effect(() => {
            this.audioWorkletPostMessageProcessorLevelMeterService.levelSize = 2 ** this.levelSize();
        });

        effect(() => {
            this.audioWorkletPostMessageProcessorLevelMeterService.peakSize = 2 ** this.peakSize();
        });

        effect(() => {
            this.audioWorkletPostMessageProcessorLevelMeterService.smoothingTimeConstant = this.smoothingTimeConstant();
        });

        effect(() => {
            const sourceNode = this.sourceNode();

            this.audioWorkletPostMessageProcessorLevelMeterService.connect(sourceNode);

            this.clicks = this.audioWorkletPostMessageProcessorLevelMeterService.clicks;
            this.duration = this.audioWorkletPostMessageProcessorLevelMeterService.duration;
            this.level = this.audioWorkletPostMessageProcessorLevelMeterService.level;
            this.peak = this.audioWorkletPostMessageProcessorLevelMeterService.peak;

            this.#changeDetectorRef.detectChanges();
        });

        effect(() => {
            const $canvas = this.canvasRef().nativeElement;
            const height = 20;
            const width = 200;

            $canvas.height = height;
            $canvas.width = width;

            const context = $canvas.getContext('2d');

            if (context === null) {
                throw new Error('The context could not be obtained.');
            }

            context.fillStyle = '#272822';
            context.fillRect(0, 0, width, height);

            const level = this.level();

            context.fillStyle = '#cfb991';
            context.fillRect(0, 0, level, height);

            const peak = this.peak();

            context.fillStyle = '#DAAA00';
            context.fillRect(peak, 0, 5, height);
        });
    }
}
