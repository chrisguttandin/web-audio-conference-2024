import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, effect, inject, input, signal, viewChild } from '@angular/core';
import { AudioWorkletOutputProcessorLevelMeterService } from '../../audio-worklet-output-processor-level-meter.service';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'wac-audio-worklet-output-processor-level-meter',
    standalone: true,
    templateUrl: './audio-worklet-output-processor-level-meter.component.html'
})
export class AudioWorkletOutputProcessorLevelMeterComponent {
    public audioWorkletOutputProcessorLevelMeterService = inject(AudioWorkletOutputProcessorLevelMeterService);

    public canvasRef = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');

    public clicks = signal(0);

    public duration = signal(0);

    public level = signal(0);

    public levelSize = input.required<number>();

    public peak = signal(0);

    public peakSize = input.required<number>();

    public showClicks = input(false);

    public showDuration = input(false);

    public smoothingTimeConstant = input.required<number>();

    public sourceNode = input.required<AudioNode>();

    #changeDetectorRef = inject(ChangeDetectorRef);

    constructor() {
        effect(() => {
            this.audioWorkletOutputProcessorLevelMeterService.levelSize = 2 ** this.levelSize();
        });

        effect(() => {
            this.audioWorkletOutputProcessorLevelMeterService.peakSize = 2 ** this.peakSize();
        });

        effect(() => {
            this.audioWorkletOutputProcessorLevelMeterService.smoothingTimeConstant = this.smoothingTimeConstant();
        });

        effect(() => {
            const sourceNode = this.sourceNode();

            this.audioWorkletOutputProcessorLevelMeterService.connect(sourceNode);

            this.clicks = this.audioWorkletOutputProcessorLevelMeterService.clicks;
            this.duration = this.audioWorkletOutputProcessorLevelMeterService.duration;
            this.level = this.audioWorkletOutputProcessorLevelMeterService.level;
            this.peak = this.audioWorkletOutputProcessorLevelMeterService.peak;

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
