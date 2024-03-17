import { Injectable, signal } from '@angular/core';
import { animationFrame } from 'subscribable-things';

const AUDIO_WORKLET_SOURCE_CODE = `class AudioWorkletOutputProcessor extends AudioWorkletProcessor {
    static parameterDescriptors = [
        {
            defaultValue: 0,
            name: 'size'
        }
    ];

    output = new Float32Array(128);

    outputIndex = 0;

    process (inputs, outputs, { size }) {
        if (inputs.length > 0 && inputs[0].length > 0) {
            let clicks = 0;
            let peak = 0;
            let squaredSum = 0;

            for (let i = 0; i < inputs[0][0].length; i += 1) {
                const sample = inputs[0][0][i];

                if (sample >= 1 || sample <= -1) {
                    clicks += 1;
                }

                peak = Math.max(peak, Math.abs(sample));
                squaredSum += sample ** 2;

                if (i % size[0] + 1 === size[0]) {
                    this.output[this.outputIndex] = currentFrame + i;
                    this.output[this.outputIndex + 1] = clicks;
                    this.output[this.outputIndex + 2] = peak;
                    this.output[this.outputIndex + 3] = squaredSum;

                    if (outputs.length > 0 && outputs[0].length > 0) {
                        outputs[0][0].set(this.output);
                    }

                    this.outputIndex = (this.outputIndex + 4) % 128;

                    clicks = 0;
                    peak = 0;
                    squaredSum = 0;
                }
            }
        }

        return true;
    }
}

registerProcessor('output-processor', AudioWorkletOutputProcessor);
`;
const AUDIO_CONTEXT_CACHE = new WeakSet<BaseAudioContext>();

@Injectable({
    providedIn: 'root'
})
export class AudioWorkletOutputProcessorLevelMeterService {
    public clicks = signal(0);

    public duration = signal(0);

    public level = signal(0);

    public peak = signal(0);

    #levelSize = 128;

    #peakSize = 4096;

    #sizeAudioParam: null | AudioParam = null;

    #smoothingTimeConstant = 0;

    public get levelSize(): number {
        return this.#levelSize;
    }

    public set levelSize(value: number) {
        this.#levelSize = value;
        this.#sizeAudioParam?.setValueAtTime(Math.min(128, value, this.#peakSize), 0);
    }

    // eslint-disable-next-line @typescript-eslint/member-ordering
    public get peakSize(): number {
        return this.#peakSize;
    }

    public set peakSize(value: number) {
        this.#peakSize = value;
        this.#sizeAudioParam?.setValueAtTime(Math.min(128, value, this.#levelSize), 0);
    }

    // eslint-disable-next-line @typescript-eslint/member-ordering
    public get smoothingTimeConstant(): number {
        return this.#smoothingTimeConstant;
    }

    public set smoothingTimeConstant(value: number) {
        this.#smoothingTimeConstant = value;
    }

    public async connect(audioNode: AudioNode) {
        const { context } = audioNode;

        await this.#addModule(context);

        const fftSize = 128;
        const analyserNode = new AnalyserNode(context, { fftSize });
        const audioWorkletNode = new AudioWorkletNode(context, 'output-processor', {
            outputChannelCount: [1],
            parameterData: { size: Math.min(128, this.#levelSize, this.#peakSize) }
        });

        this.#sizeAudioParam = (<Map<string, AudioParam>>audioWorkletNode.parameters).get('size') ?? null;

        audioNode.connect(audioWorkletNode).connect(analyserNode);

        let duration = 0;
        let lastFrame = 0;
        let nextIndex = 0;

        const data = new Float32Array(fftSize);
        const peaks: number[] = [];
        const squaredSums: number[] = [];

        animationFrame()(() => {
            performance.mark('animation-frame-started');

            analyserNode.getFloatTimeDomainData(data);

            let clicks = 0;

            while (data[nextIndex] > lastFrame) {
                lastFrame = data[nextIndex];

                clicks += data[nextIndex + 1];
                peaks.push(data[nextIndex + 2]);
                squaredSums.push(data[nextIndex + 3]);

                nextIndex = (nextIndex + 4) % fftSize;
            }

            while (peaks.length > Math.max(1, this.#peakSize / 128)) {
                peaks.shift();
            }

            while (squaredSums.length > Math.max(1, this.#levelSize / 128)) {
                squaredSums.shift();
            }

            const level = Math.sqrt(squaredSums.reduce((a, b) => a + b, 0) / this.#levelSize);
            const peak = Math.max(...peaks);

            performance.mark('animation-frame-ended');

            const measure = performance.measure('animation-frame-duration', 'animation-frame-started', 'animation-frame-ended');

            duration += measure.duration;

            this.clicks.update((previousValue) => previousValue + clicks);
            this.duration.set(parseFloat(duration.toFixed(3)));
            this.level.update((previousValue) => Math.max(previousValue * this.#smoothingTimeConstant, Math.round(level * 200)));
            this.peak.update((previousValue) => Math.max(previousValue * this.#smoothingTimeConstant, Math.round(peak * 200)));
        });
    }

    // eslint-disable-next-line class-methods-use-this
    async #addModule(audioContext: BaseAudioContext): Promise<void> {
        if (AUDIO_CONTEXT_CACHE.has(audioContext)) {
            return;
        }

        AUDIO_CONTEXT_CACHE.add(audioContext);

        const blob = new Blob([AUDIO_WORKLET_SOURCE_CODE], {
            type: 'application/javascript; charset=utf-8'
        });
        const url = URL.createObjectURL(blob);

        await audioContext.audioWorklet.addModule(url);

        URL.revokeObjectURL(url);
    }
}
