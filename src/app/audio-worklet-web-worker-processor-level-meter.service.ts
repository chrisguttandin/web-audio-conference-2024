import { Injectable, signal } from '@angular/core';
import { animationFrame } from 'subscribable-things';

const AUDIO_WORKLET_SOURCE_CODE = `class AudioWorkletWebWorkerProcessor extends AudioWorkletProcessor {
    static parameterDescriptors = [
        {
            defaultValue: 0,
            name: 'size'
        }
    ];

    event = { clicks: 0, level: 0, max: 0 };

    process (inputs, _, { size }) {
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
                    this.event.clicks = clicks;
                    this.event.peak = peak;
                    this.event.squaredSum = squaredSum;

                    this.port.postMessage(this.event);

                    clicks = 0;
                    peak = 0;
                    squaredSum = 0;
                }
            }
        }

        return true;
    }
}

registerProcessor('web-worker-processor', AudioWorkletWebWorkerProcessor);
`;
const AUDIO_CONTEXT_CACHE = new WeakSet<BaseAudioContext>();

@Injectable({
    providedIn: 'root'
})
export class AudioWorkletWebWorkerProcessorLevelMeterService {
    public clicks = signal(0);

    public level = signal(0);

    public peak = signal(0);

    #levelSize = 128;

    #peakSize = 4096;

    #sizeAudioParam: null | AudioParam = null;

    #smoothingTimeConstant = 0;

    #worker: null | Worker = null;

    public get levelSize(): number {
        return this.#levelSize;
    }

    public set levelSize(value: number) {
        this.#levelSize = value;
        this.#sizeAudioParam?.setValueAtTime(Math.min(128, value, this.#peakSize), 0);

        if (this.#worker) {
            this.#worker.postMessage({ levelSize: value });
        }
    }

    // eslint-disable-next-line @typescript-eslint/member-ordering
    public get peakSize(): number {
        return this.#peakSize;
    }

    public set peakSize(value: number) {
        this.#peakSize = value;
        this.#sizeAudioParam?.setValueAtTime(Math.min(128, value, this.#levelSize), 0);

        if (this.#worker) {
            this.#worker.postMessage({ peakSize: value });
        }
    }

    // eslint-disable-next-line @typescript-eslint/member-ordering
    public get smoothingTimeConstant(): number {
        return this.#smoothingTimeConstant;
    }

    public set smoothingTimeConstant(value: number) {
        this.#smoothingTimeConstant = value;
        if (this.#worker !== null) {
            this.#worker.postMessage({ smoothingTimeConstant: value });
        }
    }

    public async connect(audioNode: AudioNode, canvas: OffscreenCanvas, worker: Worker) {
        const { context } = audioNode;

        this.#worker = worker;

        await this.#addModule(context);

        const audioWorkletNode = new AudioWorkletNode(context, 'web-worker-processor', {
            parameterData: { size: Math.min(128, this.#levelSize, this.#peakSize) }
        });

        this.#sizeAudioParam = (<Map<string, AudioParam>>audioWorkletNode.parameters).get('size') ?? null;

        audioNode.connect(audioWorkletNode);

        let clicks = 0;

        worker.postMessage({ canvas, port: audioWorkletNode.port }, [audioWorkletNode.port, canvas]);

        worker.onmessage = ({ data }) => {
            clicks += data;
        };

        animationFrame()(() => {
            this.clicks.update((previousValue) => previousValue + clicks);

            clicks = 0;
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
