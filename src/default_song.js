"use strict";

const instruments = [
  {
    id: 1,
    type: "synth",
    name: "Bass Synth",
    oscillator1Waveform: "sawtooth",
    oscillator1Octave: 0,
    oscillator1Amplitude: 1.0,
    oscillator2Waveform: "square",
    oscillator2Detune: 7,
    oscillator2Octave: 0,
    oscillator2Amplitude: 1.0,
    noiseAmplitude: 0.0,
    noiseType: "pink",
    lfoWaveform: "sine",
    lfoFrequency: 7.1,
    lfoAmplitude: 2,
    filterCutoff: 200,
    filterResonance: 0,
    filterLFOWaveform: "sine",
    filterLFOFrequency: 2.1,
    filterLFOAmplitude: 0,
    filterEnvelopeAmount: 1500,
    filterEnvelopeAttackTime: 0,
    filterEnvelopeDecayTime: 0.1,
    filterEnvelopeSustainPercentage: 0.09,
    filterEnvelopeReleaseTime: 0,
    envelopeAttackTime: 0,
    envelopeDecayTime: 0,
    envelopeSustainPercentage: 1,
    envelopeReleaseTime: 0,
    delayTime: 0.0,
    delayFeedback: 0.0,
    reverbWetPercentage: 0.0,
  },
  {
    id: 2,
    type: "synth",
    name: "Arpeggio",
    oscillator1Waveform: "sawtooth",
    oscillator1Octave: 1,
    oscillator1Amplitude: 1.0,
    oscillator2Waveform: "square",
    oscillator2Detune: 7,
    oscillator2Octave: 1,
    oscillator2Amplitude: 1.0,
    noiseAmplitude: 0.0,
    noiseType: "pink",
    lfoWaveform: "sine",
    lfoFrequency: 5,
    lfoAmplitude: 0,
    filterCutoff: 9950,
    filterResonance: 0,
    filterLFOWaveform: "sine",
    filterLFOFrequency: 5,
    filterLFOAmplitude: 0,
    filterEnvelopeAmount: 1500,
    filterEnvelopeAttackTime: 0,
    filterEnvelopeDecayTime: 0,
    filterEnvelopeSustainPercentage: 1,
    filterEnvelopeReleaseTime: 0,
    envelopeAttackTime: 0,
    envelopeDecayTime: 0.09,
    envelopeSustainPercentage: 0.16,
    envelopeReleaseTime: 0.99,
    delayTime: 0.4,
    delayFeedback: 0.5,
    reverbWetPercentage: 0.0,
  },
  {
    id: 3,
    type: "synth",
    name: "Squeal",
    oscillator1Waveform: "square",
    oscillator1Octave: 0,
    oscillator1Amplitude: 1.0,
    oscillator2Waveform: "sawtooth",
    oscillator2Detune: 6,
    oscillator2Octave: 0,
    oscillator2Amplitude: 1.0,
    noiseAmplitude: 0.0,
    noiseType: "pink",
    lfoWaveform: "sine",
    lfoFrequency: 6,
    lfoAmplitude: 57,
    filterCutoff: 2800,
    filterResonance: 0,
    filterLFOWaveform: "sine",
    filterLFOFrequency: 5,
    filterLFOAmplitude: 0,
    filterEnvelopeAmount: 1500,
    filterEnvelopeAttackTime: 0.48,
    filterEnvelopeDecayTime: 0.17,
    filterEnvelopeSustainPercentage: 0.17,
    filterEnvelopeReleaseTime: 0,
    envelopeAttackTime: 0.13,
    envelopeDecayTime: 0,
    envelopeSustainPercentage: 1,
    envelopeReleaseTime: 0,
    delayTime: 0.3,
    delayFeedback: 0.4,
    reverbWetPercentage: 0.4,
  },
  {
    id: 4,
    type: "sample",
    name: "Bass Drum",
    sample: "Instrument 4",
    filename: "bass.wav",
    loop: false,
    rootNoteName: "A",
    rootNoteOctave: 4,
    filterCutoff: 9950,
    filterResonance: 0,
    filterLFOWaveform: "sine",
    filterLFOFrequency: 5,
    filterLFOAmplitude: 0,
    filterEnvelopeAmount: 1500,
    filterEnvelopeAttackTime: 0,
    filterEnvelopeDecayTime: 0,
    filterEnvelopeSustainPercentage: 1,
    filterEnvelopeReleaseTime: 0,
    envelopeAttackTime: 0,
    envelopeDecayTime: 0,
    envelopeSustainPercentage: 1,
    envelopeReleaseTime: 0,
    delayTime: 0.0,
    delayFeedback: 0.0,
    reverbWetPercentage: 0.0,
  },
  {
    id: 5,
    type: "sample",
    name: "Snare Drum",
    sample: "Instrument 5",
    filename: "snare.wav",
    loop: false,
    rootNoteName: "A",
    rootNoteOctave: 4,
    filterCutoff: 9950,
    filterResonance: 0,
    filterLFOWaveform: "sine",
    filterLFOFrequency: 5,
    filterLFOAmplitude: 0,
    filterEnvelopeAmount: 1500,
    filterEnvelopeAttackTime: 0,
    filterEnvelopeDecayTime: 0,
    filterEnvelopeSustainPercentage: 1,
    filterEnvelopeReleaseTime: 0,
    envelopeAttackTime: 0,
    envelopeDecayTime: 0,
    envelopeSustainPercentage: 1,
    envelopeReleaseTime: 0,
    delayTime: 0.0,
    delayFeedback: 0.0,
    reverbWetPercentage: 0.0,
  },
  {
    id:6,
    type: "sample",
    name: "Hi-Hat",
    sample: "Instrument 6",
    filename: "hihat.wav",
    loop: false,
    rootNoteName: "A",
    rootNoteOctave: 4,
    filterCutoff: 9950,
    filterResonance: 0,
    filterLFOWaveform: "sine",
    filterLFOFrequency: 5,
    filterLFOAmplitude: 0,
    filterEnvelopeAmount: 1500,
    filterEnvelopeAttackTime: 0,
    filterEnvelopeDecayTime: 0,
    filterEnvelopeSustainPercentage: 1,
    filterEnvelopeReleaseTime: 0,
    envelopeAttackTime: 0,
    envelopeDecayTime: 0,
    envelopeSustainPercentage: 1,
    envelopeReleaseTime: 0,
    delayTime: 0.0,
    delayFeedback: 0.0,
    reverbWetPercentage: 0.0,
  },
];

const patterns = [
  {
    id: 1,
    name: "Bass Synth 1",
    trackID: 1,
    rows: [
      {
        notes: [{name: "G2"},
                {name: "A2"},
                {name: "A1"},
                {name: ""},
                {name: "A1"},
                {name: ""},
                {name: ""},
                {name: "A1"},
                {name: ""},
                {name: "A1"},
                {name: "A1"},
                {name: ""},
                {name: "C2"},
                {name: "A1"},
                {name: "G2"},
                {name: "-"},],
      },
    ],
  },
  {
    id: 2,
    name: "Bass Synth 2",
    trackID: 1,
    rows: [
      {
        notes: [{name: "G2"},
                {name: "A2"},
                {name: "A1"},
                {name: ""},
                {name: "A1"},
                {name: ""},
                {name: ""},
                {name: "A1"},
                {name: ""},
                {name: "A1"},
                {name: "C2"},
                {name: ""},
                {name: "C2"},
                {name: "A1"},
                {name: "G1"},
                {name: "-"},],
      },
    ],
  },
  {
    id: 3,
    name: "Bass Synth 3",
    trackID: 1,
    rows: [
      {
        notes: [{name: "A1"},
                {name: "A1"},
                {name: ""},
                {name: "A1"},
                {name: "A1"},
                {name: ""},
                {name: "A1"},
                {name: "A1"},
                {name: "-"},
                {name: "-"},
                {name: "-"},
                {name: "-"},
                {name: "C2"},
                {name: "-"},
                {name: "G2"},
                {name: "-"},],
      },
    ],
  },
  {
    id: 4,
    name: "Bass Synth 4",
    trackID: 1,
    rows: [
      {
        notes: [{name: "A1"},
                {name: "A1"},
                {name: ""},
                {name: "A1"},
                {name: "A1"},
                {name: ""},
                {name: "A1"},
                {name: "A1"},
                {name: "-"},
                {name: "-"},
                {name: "C2"},
                {name: "-"},
                {name: "C2"},
                {name: "A1"},
                {name: "G1"},
                {name: "-"},],
      },
    ],
  },
  {
    id: 5,
    name: "Arpeggio 1",
    trackID: 2,
    rows: [
      {
        notes: [{name: "A3"},
                {name: "E4"},
                {name: "A4"},
                {name: "A3"},
                {name: "E4"},
                {name: "A4"},
                {name: "A3"},
                {name: "E4"},
                {name: "C4"},
                {name: "A3"},
                {name: "A4"},
                {name: "E4"},
                {name: "A3"},
                {name: "A2"},
                {name: "A1"},
                {name: "A0"},],
      },
    ],
  },
  {
    id: 6,
    name: "Arpeggio 2",
    trackID: 2,
    rows: [
      {
        notes: [{name: "C4"},
                {name: "E4"},
                {name: "C5"},
                {name: "C4"},
                {name: "E4"},
                {name: "C5"},
                {name: "C4"},
                {name: "E4"},
                {name: "C4"},
                {name: "C3"},
                {name: "C5"},
                {name: "E4"},
                {name: "C4"},
                {name: "C3"},
                {name: "C2"},
                {name: "C1"},],
      },
    ],
  },
  {
    id: 7,
    name: "Squeal 1",
    trackID: 3,
    rows: [
      {
        notes: [{name: "C5"},
                {name: "-"},
                {name: "-"},
                {name: "-"},
                {name: "B4"},
                {name: "-"},
                {name: "-"},
                {name: "-"},
                {name: "G4"},
                {name: "-"},
                {name: "-"},
                {name: "-"},
                {name: "E4"},
                {name: "-"},
                {name: "-"},
                {name: "-"},],
      },
    ],
  },
  {
    id: 8,
    name: "Bass Drum 1",
    trackID: 4,
    rows: [
      {
        notes: [{name: "A4"},
                {name: "-"},
                {name: "-"},
                {name: "-"},
                {name: "A4"},
                {name: "-"},
                {name: "-"},
                {name: "-"},
                {name: "A4"},
                {name: "-"},
                {name: "-"},
                {name: "-"},
                {name: "A4"},
                {name: "-"},
                {name: "-"},
                {name: "-"},],
      },
    ],
  },
  {
    id: 9,
    name: "Bass Drum 2",
    trackID: 4,
    rows: [
      {
        notes: [{name: "A4"},
                {name: "-"},
                {name: "-"},
                {name: "-"},
                {name: "A4"},
                {name: "-"},
                {name: "-"},
                {name: "-"},
                {name: "A4"},
                {name: "A4"},
                {name: "-"},
                {name: "-"},
                {name: "A4"},
                {name: "-"},
                {name: "-"},
                {name: "-"},],
      },
    ],
  },
  {
    id: 10,
    name: "Snare Drum 1",
    trackID: 5,
    rows: [
      {
        notes: [{name: ""},
                {name: ""},
                {name: ""},
                {name: ""},
                {name: "A4"},
                {name: "-"},
                {name: "-"},
                {name: "-"},
                {name: ""},
                {name: ""},
                {name: ""},
                {name: ""},
                {name: "A4"},
                {name: "-"},
                {name: "-"},
                {name: "-"},],
      },
    ],
  },
  {
    id: 11,
    name: "Hi-Hat 1",
    trackID: 6,
    rows: [
      {
        notes: [{name: "A4"},
                {name: "A4"},
                {name: "A4"},
                {name: "-"},
                {name: "A4"},
                {name: "-"},
                {name: "A3"},
                {name: "F4"},
                {name: "A4"},
                {name: ""},
                {name: "E@5"},
                {name: "A4"},
                {name: "A4"},
                {name: "A4"},
                {name: "-"},
                {name: ""},],
      },
    ],
  },
  {
    id: 12,
    name: "Hi-Hat 2",
    trackID: 6,
    rows: [
      {
        notes: [{name: "A4"},
                {name: "A4"},
                {name: "A4"},
                {name: "A5"},
                {name: "A4"},
                {name: "A4"},
                {name: "A1"},
                {name: "A4"},
                {name: "A4"},
                {name: "A3"},
                {name: "A4"},
                {name: "A5"},
                {name: "A4"},
                {name: "A4"},
                {name: "A2"},
                {name: "A1"},],
      },
    ],
  },
];

const tracks = [
  {
    id: 1,
    name: "Bass Synth",
    instrumentID: 1,
    muted: false,
    volume: 0.8,
    patterns: [
      { patternID: 1, },
      { patternID: 2, },
      { patternID: 1, },
      { patternID: 2, },
      { patternID: 3, },
      { patternID: 4, },
      { patternID: 3, },
      { patternID: 4, },
    ],
  },
  {
    id: 2,
    name: "Arpeggio",
    instrumentID: 2,
    muted: false,
    volume: 0.5,
    patterns: [
      { patternID: -1, },
      { patternID: -1, },
      { patternID: -1, },
      { patternID: -1, },
      { patternID: 5, },
      { patternID: -1, },
      { patternID: 6, },
      { patternID: -1, },
    ],
  },
  {
    id: 3,
    name: "Squeal",
    instrumentID: 3,
    muted: false,
    volume: 0.6,
    patterns: [
      { patternID: -1, },
      { patternID: -1, },
      { patternID: -1, },
      { patternID: -1, },
      { patternID: -1, },
      { patternID: -1, },
      { patternID: -1, },
      { patternID: 7, },
    ],
  },
  {
    id: 4,
    name: "Bass Drum",
    instrumentID: 4,
    muted: false,
    volume: 1.0,
    patterns: [
      { patternID: 8, },
      { patternID: 8, },
      { patternID: 8, },
      { patternID: 8, },
      { patternID: 9, },
      { patternID: 9, },
      { patternID: 9, },
      { patternID: 9, },
    ],
  },
  {
    id: 5,
    name: "Snare Drum",
    instrumentID: 5,
    muted: false,
    volume: 0.8,
    patterns: [
      { patternID: -1, },
      { patternID: -1, },
      { patternID: -1, },
      { patternID: -1, },
      { patternID: 10, },
      { patternID: 10, },
      { patternID: 10, },
      { patternID: 10, },
    ],
  },
  {
    id: 6,
    name: "Hi-Hat",
    instrumentID: 6,
    muted: false,
    volume: 0.8,
    patterns: [
      { patternID: 11, },
      { patternID: 11, },
      { patternID: 11, },
      { patternID: 11, },
      { patternID: 12, },
      { patternID: 12, },
      { patternID: 12, },
      { patternID: 12, },
    ],
  },
];

export { instruments, patterns, tracks };
