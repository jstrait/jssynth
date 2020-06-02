"use strict";

const LITTLE_ENDIAN = true;
const AUDIO_FORMAT_CODE = 1;  // I.e., PCM
const NUM_CHANNELS = 1;
const BITS_PER_SAMPLE = 16;
const BYTES_PER_SAMPLE = 2;
const MAX_SAMPLE_VALUE = 32767;
const BLOCK_ALIGN = BYTES_PER_SAMPLE * NUM_CHANNELS;
const WAVEFILE_HEADER_BYTE_COUNT = 44;
const RIFF_CHUNK_BODY_BYTE_COUNT_MINIMUM = 36;
const FORMAT_CHUNK_BODY_BYTE_COUNT = 16;

export function WaveWriter(sampleRate) {
  const BYTE_RATE = BLOCK_ALIGN * sampleRate;

  var write = function(rawFloat32SampleData) {
    const sampleDataByteCount = rawFloat32SampleData.length * BYTES_PER_SAMPLE;
    const fileLength = WAVEFILE_HEADER_BYTE_COUNT + sampleDataByteCount;
    var outputView = new DataView(new ArrayBuffer(fileLength));
    var sampleByteOffset;
    var clampedSample;
    var i;

    outputView.setUint8(  0, "R".charCodeAt(0), LITTLE_ENDIAN);
    outputView.setUint8(  1, "I".charCodeAt(0), LITTLE_ENDIAN);
    outputView.setUint8(  2, "F".charCodeAt(0), LITTLE_ENDIAN);
    outputView.setUint8(  3, "F".charCodeAt(0), LITTLE_ENDIAN);
    outputView.setUint32( 4, RIFF_CHUNK_BODY_BYTE_COUNT_MINIMUM + sampleDataByteCount, LITTLE_ENDIAN);
    outputView.setUint8(  8, "W".charCodeAt(0), LITTLE_ENDIAN);
    outputView.setUint8(  9, "A".charCodeAt(0), LITTLE_ENDIAN);
    outputView.setUint8( 10, "V".charCodeAt(0), LITTLE_ENDIAN);
    outputView.setUint8( 11, "E".charCodeAt(0), LITTLE_ENDIAN);
    outputView.setUint8( 12, "f".charCodeAt(0), LITTLE_ENDIAN);
    outputView.setUint8( 13, "m".charCodeAt(0), LITTLE_ENDIAN);
    outputView.setUint8( 14, "t".charCodeAt(0), LITTLE_ENDIAN);
    outputView.setUint8( 15, " ".charCodeAt(0), LITTLE_ENDIAN);
    outputView.setUint32(16, FORMAT_CHUNK_BODY_BYTE_COUNT, LITTLE_ENDIAN);
    outputView.setUint16(20, AUDIO_FORMAT_CODE, LITTLE_ENDIAN);
    outputView.setUint16(22, NUM_CHANNELS, LITTLE_ENDIAN);
    outputView.setUint32(24, sampleRate, LITTLE_ENDIAN);
    outputView.setUint32(28, BYTE_RATE, LITTLE_ENDIAN);
    outputView.setUint16(32, BLOCK_ALIGN, LITTLE_ENDIAN);
    outputView.setUint16(34, BITS_PER_SAMPLE, LITTLE_ENDIAN);
    outputView.setUint8( 36, "d".charCodeAt(0), LITTLE_ENDIAN);
    outputView.setUint8( 37, "a".charCodeAt(0), LITTLE_ENDIAN);
    outputView.setUint8( 38, "t".charCodeAt(0), LITTLE_ENDIAN);
    outputView.setUint8( 39, "a".charCodeAt(0), LITTLE_ENDIAN);
    outputView.setUint32(40, sampleDataByteCount, LITTLE_ENDIAN);

    sampleByteOffset = WAVEFILE_HEADER_BYTE_COUNT;

    // Float32Array doesn't appear to support forEach() in Safari 9
    for (i = 0; i < rawFloat32SampleData.length; i++) {
      // Should this round?
      clampedSample = Math.max(Math.min(rawFloat32SampleData[i], 1.0), -1.0);
      outputView.setInt16(sampleByteOffset, clampedSample * MAX_SAMPLE_VALUE, LITTLE_ENDIAN);

      sampleByteOffset += BYTES_PER_SAMPLE;
    }

    return outputView;
  };


  return {
    write: write,
  };
};
