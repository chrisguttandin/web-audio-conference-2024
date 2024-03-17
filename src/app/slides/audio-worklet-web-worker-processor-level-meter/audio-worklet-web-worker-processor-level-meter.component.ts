import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    OnDestroy,
    effect,
    inject,
    input,
    signal,
    viewChild
} from '@angular/core';
import { AudioWorkletWebWorkerProcessorLevelMeterService } from '../../audio-worklet-web-worker-processor-level-meter.service';

const WEB_WORKER_BLOB = new Blob(
    [
        `let destroy = () => {};
let levelSize = 128;
let peakSize = 4096;
let smoothingTimeConstant = 0;

self.onmessage = ({ data }) => {
    if (typeof data.levelSize === 'number') {
        levelSize = data.levelSize;

        return;
    }

    if (typeof data.peakSize === 'number') {
        peakSize = data.peakSize;

        return;
    }

    if (typeof data.smoothingTimeConstant === 'number') {
        smoothingTimeConstant = data.smoothingTimeConstant;

        return;
    }

    destroy();

    const { canvas, port } = data;

    const peaks = [];
    const squaredSums = [];

    port.onmessage = ({ data }) => {
        if (data.clicks > 0) {
            postMessage(data.clicks);
        }

        peaks.push(data.peak);
        squaredSums.push(data.squaredSum);
    };

    let smoothedLevel = 0;
    let smoothedPeak = 0;

    // @todo use device pixel ratio
    const height = 10 * 2;
    const width = 100 * 2;

    canvas.height = height;
    canvas.width = width;

    const context = canvas.getContext('2d');

    if (context === null) {
        throw new Error('The context could not be obtained.');
    }

    const draw = () => {
        while (peaks.length > Math.max(1, peakSize / 128)) {
            peaks.shift();
        }

        while (squaredSums.length > Math.max(1, levelSize / 128)) {
            squaredSums.shift();
        }

        const level = Math.sqrt(squaredSums.reduce((a, b) => a + b, 0) / levelSize);
        const peak = Math.max(...peaks);

        context.fillStyle = '#272822';
        context.fillRect(0, 0, width, height);

        smoothedLevel = Math.max(smoothedLevel * smoothingTimeConstant, Math.round(level * 200));

        context.fillStyle = '#cfb991';
        context.fillRect(0, 0, smoothedLevel, height);

        smoothedPeak = Math.max(smoothedPeak * smoothingTimeConstant, Math.round(peak * 200));

        context.fillStyle = '#DAAA00';
        context.fillRect(smoothedPeak, 0, 5, height);

        animationFrameHandle = requestAnimationFrame(draw);
    };

    let animationFrameHandle = requestAnimationFrame(draw);

    destroy = () => {
        port.onmessage = null;
        cancelAnimationFrame(animationFrameHandle);
    };
}
`
    ],
    { type: 'application/javascript; charset=utf-8' }
);

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'wac-audio-worklet-web-worker-processor-level-meter',
    standalone: true,
    templateUrl: './audio-worklet-web-worker-processor-level-meter.component.html'
})
export class AudioWorkletWebWorkerProcessorLevelMeterComponent implements OnDestroy {
    public audioWorkletWebWorkerProcessorLevelMeterService = inject(AudioWorkletWebWorkerProcessorLevelMeterService);

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

    #worker: Worker;

    constructor() {
        const url = URL.createObjectURL(WEB_WORKER_BLOB);

        this.#worker = new Worker(url);

        URL.revokeObjectURL(url);

        effect(() => {
            this.audioWorkletWebWorkerProcessorLevelMeterService.levelSize = 2 ** this.levelSize();
        });

        effect(() => {
            this.audioWorkletWebWorkerProcessorLevelMeterService.peakSize = 2 ** this.peakSize();
        });

        effect(() => {
            this.audioWorkletWebWorkerProcessorLevelMeterService.smoothingTimeConstant = this.smoothingTimeConstant();
        });

        effect(() => {
            const sourceNode = this.sourceNode();

            this.audioWorkletWebWorkerProcessorLevelMeterService.connect(
                sourceNode,
                this.canvasRef().nativeElement.transferControlToOffscreen(),
                this.#worker
            );

            this.clicks = this.audioWorkletWebWorkerProcessorLevelMeterService.clicks;
            this.level = this.audioWorkletWebWorkerProcessorLevelMeterService.level;
            this.peak = this.audioWorkletWebWorkerProcessorLevelMeterService.peak;

            this.#changeDetectorRef.detectChanges();
        });
    }

    public ngOnDestroy(): void {
        this.#worker.terminate();
    }
}
