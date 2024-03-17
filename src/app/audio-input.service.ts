import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class AudioInputService {
    #audioInput: null | AudioNode = null;

    public start(): AudioNode {
        if (this.#audioInput === null) {
            const audioContext = new AudioContext();
            const baseOscillatorNode = new OscillatorNode(audioContext, { frequency: 200 });
            const constantSourceNode = new ConstantSourceNode(audioContext, { offset: 2 });
            const flipGainNode = new GainNode(audioContext, { gain: -1 });
            const levelGainNode = new GainNode(audioContext, { gain: 0.25 });
            const mixGainNode = new GainNode(audioContext, { gain: 0 });
            const noiseOscillatorNode = new OscillatorNode(audioContext, { frequency: 0.1 });
            const shapeOscillatorNode = new OscillatorNode(audioContext, {
                frequency: 1.5,
                type: 'sawtooth'
            });

            baseOscillatorNode.start();
            constantSourceNode.start();
            noiseOscillatorNode.start();
            shapeOscillatorNode.start();

            baseOscillatorNode.connect(mixGainNode).connect(levelGainNode);
            constantSourceNode.connect(mixGainNode.gain);
            noiseOscillatorNode.connect(mixGainNode.gain);
            shapeOscillatorNode.connect(flipGainNode).connect(mixGainNode.gain);

            this.#audioInput = levelGainNode;
        }

        return this.#audioInput;
    }
}
