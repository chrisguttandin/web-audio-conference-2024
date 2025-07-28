import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, effect, inject, input, signal, viewChild } from '@angular/core';
import { AnalyserNodeLevelMeterService } from '../../analyser-node-level-meter.service';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'wac-analyser-node-level-meter',
    templateUrl: './analyser-node-level-meter.component.html'
})
export class AnalyserNodeLevelMeterComponent {
    public analyserNodeLevelMeterService = inject(AnalyserNodeLevelMeterService);

    public canvasRef = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');

    public clicks = signal(0);

    public level = signal(0);

    public levelSize = input.required<number>();

    public peak = signal(0);

    public peakSize = input.required<number>();

    public showClicks = input(false);

    public smoothingTimeConstant = input.required<number>();

    public sourceNode = input.required<AudioNode>();

    #changeDetectorRef = inject(ChangeDetectorRef);

    constructor() {
        effect(() => {
            this.analyserNodeLevelMeterService.levelSize = 2 ** this.levelSize();
        });

        effect(() => {
            this.analyserNodeLevelMeterService.peakSize = 2 ** this.peakSize();
        });

        effect(() => {
            this.analyserNodeLevelMeterService.smoothingTimeConstant = this.smoothingTimeConstant();
        });

        effect(() => {
            const sourceNode = this.sourceNode();

            this.analyserNodeLevelMeterService.connect(sourceNode);

            this.clicks = this.analyserNodeLevelMeterService.clicks;
            this.level = this.analyserNodeLevelMeterService.level;
            this.peak = this.analyserNodeLevelMeterService.peak;

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
