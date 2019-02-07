"use strict";

export class BufferGenerator  {
  static generateWhiteNoise(audioContext) {
    var noiseBuffer = audioContext.createBuffer(1, audioContext.sampleRate, audioContext.sampleRate);
    var noiseChannel = noiseBuffer.getChannelData(0);
    var i;

    for (i = 0; i < noiseChannel.length; i++) {
      noiseChannel[i] = (Math.random() * 2.0) - 1.0;
    }

    return noiseBuffer;
  };

  static generatePinkNoise(audioContext) {
    var noiseBuffer = audioContext.createBuffer(1, audioContext.sampleRate, audioContext.sampleRate);
    var noiseChannel = noiseBuffer.getChannelData(0);
    var white;
    var i;

    // Adapted from https://noisehack.com/generate-noise-web-audio-api/, https://github.com/zacharydenton/noise.js
    var b0, b1, b2, b3, b4, b5, b6;
    b0 = b1 = b2 = b3 = b4 = b5 = b6 = 0.0;
    for (i = 0; i < noiseChannel.length; i++) {
      white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      noiseChannel[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      noiseChannel[i] *= 0.11; // (roughly) compensate for gain
      b6 = white * 0.115926;
    }

    return noiseBuffer;
  };

  static generateReverbImpulseResponse(audioContext) {
    var impulseResponseBuffer = audioContext.createBuffer(1, audioContext.sampleRate, audioContext.sampleRate);
    var channelData = impulseResponseBuffer.getChannelData(0);
    var sampleCount = impulseResponseBuffer.sampleRate;
    var i;

    for (i = 0; i < channelData.length; i++) {
      channelData[i] = ((Math.random() * 2) - 1) * ((sampleCount - i) / sampleCount);
    }

    return impulseResponseBuffer;
  };
}
