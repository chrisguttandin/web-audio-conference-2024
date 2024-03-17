import { Injectable, signal } from '@angular/core';
import { animationFrame } from 'subscribable-things';

@Injectable({
    providedIn: 'root'
})
export class AnalyserNodeLevelMeterService {
    public clicks = signal(0);

    public level = signal(0);

    public peak = signal(0);

    #analyserNode: null | AnalyserNode = null;

    #levelSize = 128;

    #peakSize = 4096;

    #smoothingTimeConstant = 0;

    public get levelSize(): number {
        return this.#levelSize;
    }

    public set levelSize(value: number) {
        this.#levelSize = value;

        if (this.#analyserNode !== null) {
            this.#analyserNode.fftSize = Math.max(value, this.#peakSize);
        }
    }

    // eslint-disable-next-line @typescript-eslint/member-ordering
    public get peakSize(): number {
        return this.#peakSize;
    }

    public set peakSize(value: number) {
        this.#peakSize = value;

        if (this.#analyserNode !== null) {
            this.#analyserNode.fftSize = Math.max(value, this.#levelSize);
        }
    }

    // eslint-disable-next-line @typescript-eslint/member-ordering
    public get smoothingTimeConstant(): number {
        return this.#smoothingTimeConstant;
    }

    public set smoothingTimeConstant(value: number) {
        this.#smoothingTimeConstant = value;
    }

    public connect(audioNode: AudioNode) {
        const fftSize = Math.max(this.#levelSize, this.#peakSize);
        const analyserNode = new AnalyserNode(audioNode.context, { fftSize });

        audioNode.connect(analyserNode);

        let data = new Float32Array(fftSize);

        this.#analyserNode = analyserNode;

        animationFrame()(() => {
            performance.mark('animation-frame-started');

            if (data.length !== analyserNode.fftSize) {
                data = new Float32Array(analyserNode.fftSize);
            }

            analyserNode.getFloatTimeDomainData(data);

            let clicks = 0;
            let peak = 0;
            let squaredSum = 0;

            const levelOffset = data.length - this.#levelSize;
            const peakOffset = data.length - this.#peakSize;

            // eslint-disable-next-line unicorn/no-for-loop
            for (let i = 0; i < data.length; i += 1) {
                const sample = data[i];

                if (sample >= 1 || sample <= -1) {
                    clicks += 1;
                }

                if (i >= peakOffset) {
                    peak = Math.max(peak, Math.abs(sample));
                }

                if (i >= levelOffset) {
                    squaredSum += sample ** 2;
                }
            }

            const level = Math.sqrt(squaredSum / this.#levelSize);

            this.clicks.update((previousValue) => previousValue + clicks);
            this.level.update((previousValue) => Math.max(previousValue * this.#smoothingTimeConstant, Math.round(level * 200)));
            this.peak.update((previousValue) => Math.max(previousValue * this.#smoothingTimeConstant, Math.round(peak * 200)));
        });
    }
}
