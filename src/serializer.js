"use strict";

import * as SynthCore from "./synth_core";

export class Serializer {
  constructor() {};

  static serializeSynthInstrument(instrument, bufferCollection) {
    let serializedConfig = {
      oscillators: [
        {
          waveform: instrument.oscillator1Waveform,
          octave: instrument.oscillator1Octave,
          detune: 0,
          amplitude: instrument.oscillator1Amplitude,
        },
        {
          waveform: instrument.oscillator2Waveform,
          octave: instrument.oscillator2Octave,
          detune: instrument.oscillator2Detune,
          amplitude: instrument.oscillator2Amplitude,
        }
      ],
      noise: {
        amplitude: instrument.noiseAmplitude,
        type: instrument.noiseType,
      },
      lfo: {
        waveform:  instrument.lfoWaveform,
        frequency: instrument.lfoFrequency,
        amplitude: instrument.lfoAmplitude,
      },
      filter: {
        cutoff:    instrument.filterCutoff,
        resonance: instrument.filterResonance,
        lfo: {
          waveform:  instrument.filterLFOWaveform,
          frequency: instrument.filterLFOFrequency,
          amplitude: instrument.filterLFOAmplitude,
        },
        envelope: {
          amount:            instrument.filterEnvelopeAmount,
          attackTime:        instrument.filterEnvelopeAttackTime,
          decayTime:         instrument.filterEnvelopeDecayTime,
          sustainPercentage: instrument.filterEnvelopeSustainPercentage,
          releaseTime:       instrument.filterEnvelopeReleaseTime,
        },
      },
      envelope: {
        attackTime:        instrument.envelopeAttackTime,
        decayTime:         instrument.envelopeDecayTime,
        sustainPercentage: instrument.envelopeSustainPercentage,
        releaseTime:       instrument.envelopeReleaseTime,
      },
    };

    return new SynthCore.SynthInstrument(serializedConfig, bufferCollection.getBuffer("white-noise"), bufferCollection.getBuffer("pink-noise"));
  };

  static serializeSampleInstrument(instrument, bufferCollection) {
    let serializedConfig = {
      sample: instrument.sample,
      loop: instrument.loop,
      rootNoteName: instrument.rootNoteName,
      rootNoteOctave: instrument.rootNoteOctave,
      filter: {
        cutoff:    instrument.filterCutoff,
        resonance: instrument.filterResonance,
        lfo: {
          waveform:  instrument.filterLFOWaveform,
          frequency: instrument.filterLFOFrequency,
          amplitude: instrument.filterLFOAmplitude,
        },
        envelope: {
          amount:            instrument.filterEnvelopeAmount,
          attackTime:        instrument.filterEnvelopeAttackTime,
          decayTime:         instrument.filterEnvelopeDecayTime,
          sustainPercentage: instrument.filterEnvelopeSustainPercentage,
          releaseTime:       instrument.filterEnvelopeReleaseTime,
        },
      },
      envelope: {
        attackTime:        instrument.envelopeAttackTime,
        decayTime:         instrument.envelopeDecayTime,
        sustainPercentage: instrument.envelopeSustainPercentage,
        releaseTime:       instrument.envelopeReleaseTime,
      },
    };

    return new SynthCore.SampleInstrument(serializedConfig, bufferCollection);
  };

  static serializeInstrument(instrument, bufferCollection) {
    if (instrument.type === "synth") {
      return Serializer.serializeSynthInstrument(instrument, bufferCollection);
    }
    else if (instrument.type === "sample") {
      return Serializer.serializeSampleInstrument(instrument, bufferCollection);
    }
    else {
      return undefined;
    }
  };

  static serializePatterns(patterns) {
    let serializedPatterns = {};

    patterns.forEach(function(pattern) {
      let serializedRows = [];

      pattern.rows.forEach(function(row) {
        let sequence;
        let rawSequenceString;

        rawSequenceString = row.notes.map(function(note) { return note.name; }).join(' ');
        sequence = SynthCore.SequenceParser.parse(rawSequenceString);
        serializedRows.push(sequence);
      });

      serializedPatterns[pattern.id] = serializedRows;
    });

    return serializedPatterns;
  };

  static instrumentByID(instruments, id) {
    let i;
    for (i = 0; i < instruments.length; i++) {
      if (instruments[i].id === id) {
        return instruments[i];
      }
    }

    return undefined;
  };

  static patternsByTrackID(allPatterns, trackID) {
    let i;
    let patterns = [];

    for (i = 0; i < allPatterns.length; i++) {
      if (allPatterns[i].trackID === trackID) {
        patterns.push(allPatterns[i]);
      }
    }

    return patterns;
  };

  static serializeScore(measureCount, tracks, patterns) {
    const STEPS_PER_MEASURE = 16;
    const TOTAL_STEPS = measureCount * STEPS_PER_MEASURE;

    let i, j, k;
    let serializedPatterns;
    let serializedNotes = [];

    for (i = 0; i < TOTAL_STEPS; i++) {
      serializedNotes[i] = [];
    }

    tracks.forEach(function(track) {
      let serializedPatterns = Serializer.serializePatterns(Serializer.patternsByTrackID(patterns, track.id));
      let patternRows, patternRow;
      let startStep;

      for (i = 0; i < track.patterns.length; i++) {
        startStep = track.patterns[i].startStep;
        patternRows = serializedPatterns[track.patterns[i].patternID];

        for (j = 0; j < patternRows.length; j++) {
          patternRow = patternRows[j];

          for (k = 0; k < patternRow.length; k++) {
            if (patternRow[k] && patternRow[k].name()) {
              serializedNotes[startStep + k].push(new SynthCore.InstrumentNote(patternRow[k], 1.0, track.id));
            }
          }
        }
      }
    });

    return SynthCore.Score(serializedNotes);
  };
};
