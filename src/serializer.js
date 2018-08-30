"use strict";

import * as JSSynth from "./jssynth";

class Serializer {
  constructor() {};

  static serializeSynthInstrument(instrument, bufferCollection) {
    let filterCutoff = instrument.filterCutoff;
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
      },
      lfo: {
        waveform:  instrument.lfoWaveform,
        frequency: instrument.lfoFrequency,
        amplitude: instrument.lfoAmplitude,
      },
      filter: {
        cutoff:    filterCutoff,
        resonance: instrument.filterResonance,
        mode: instrument.filterModulator,
        lfo: {
          waveform:  instrument.filterLFOWaveform,
          frequency: instrument.filterLFOFrequency,
          amplitude: instrument.filterLFOAmplitude * filterCutoff,
        },
        envelope: {
          amount:  instrument.filterEnvelopeAmount,
          attack:  instrument.filterEnvelopeAttack,
          decay:   instrument.filterEnvelopeDecay,
          sustain: instrument.filterEnvelopeSustain,
          release: instrument.filterEnvelopeRelease,
        },
      },
      envelope: {
        attack:  instrument.envelopeAttack,
        decay:   instrument.envelopeDecay,
        sustain: instrument.envelopeSustain,
        release: instrument.envelopeRelease,
      },
    };

    return new JSSynth.SynthInstrument(serializedConfig, bufferCollection.getBuffer("noise"));
  };

  static serializeSampleInstrument(instrument, bufferCollection) {
    let filterCutoff = instrument.filterCutoff;

    let serializedConfig = {
      sample: instrument.sample,
      loop: instrument.loop,
      filter: {
        cutoff:    filterCutoff,
        resonance: instrument.filterResonance,
        mode: instrument.filterModulator,
        lfo: {
          waveform:  instrument.filterLFOWaveform,
          frequency: instrument.filterLFOFrequency,
          amplitude: instrument.filterLFOAmplitude * filterCutoff,
        },
        envelope: {
          amount:  instrument.filterEnvelopeAmount,
          attack:  instrument.filterEnvelopeAttack,
          decay:   instrument.filterEnvelopeDecay,
          sustain: instrument.filterEnvelopeSustain,
          release: instrument.filterEnvelopeRelease,
        },
      },
      envelope: {
        attack:  instrument.envelopeAttack,
        decay:   instrument.envelopeDecay,
        sustain: instrument.envelopeSustain,
        release: instrument.envelopeRelease,
      },
    };

    return new JSSynth.SampleInstrument(serializedConfig, bufferCollection);
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
        sequence = JSSynth.SequenceParser.parse(rawSequenceString);
        serializedRows.push(sequence);
      });

      serializedPatterns[pattern.id] = serializedRows;
    });

    return serializedPatterns;
  };

  static trackByID(tracks, id) {
    let i;
    for (i = 0; i < tracks.length; i++) {
      if (tracks[i].id === id) {
        return tracks[i];
      }
    }

    return undefined;
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

  static unmutedTrackCounter(count, currentTrack) {
    return (currentTrack.muted) ? count : (count + 1);
  };

  static serialize(measureCount, tracks, instruments, patterns, bufferCollection) {
    const STEPS_PER_MEASURE = 16;
    const TOTAL_STEPS = measureCount * STEPS_PER_MEASURE;

    const unmutedTrackCount = tracks.reduce(Serializer.unmutedTrackCounter, 0);
    const trackVolumeMultiplier = 1 / unmutedTrackCount;

    let i, j;
    let serializedInstrument;
    let serializedPatterns;
    let serializedNotes = [];

    for (i = 0; i < TOTAL_STEPS; i++) {
      serializedNotes[i] = [];
    }

    tracks.forEach(function(track) {
      let trackVolume = track.volume * trackVolumeMultiplier;

      if (track.muted) {
        return;
      }

      serializedInstrument = Serializer.serializeInstrument(Serializer.instrumentByID(instruments, track.instrumentID), bufferCollection);
      serializedPatterns = Serializer.serializePatterns(Serializer.patternsByTrackID(patterns, track.id));

      for (i = 0; i < measureCount; i++) {
        if (track.patterns[i].patternID !== -1) {
          let sequences = serializedPatterns[track.patterns[i].patternID];

          sequences.forEach(function(sequence) {
            for (j = 0; j < sequence.length; j++) {
              if (sequence[j] && sequence[j].name()) {
                serializedNotes[(i * STEPS_PER_MEASURE) + j].push(new JSSynth.InstrumentNote(sequence[j], serializedInstrument, trackVolume));
              }
            }
          });
        }
      }
    });

    return serializedNotes;
  };
};

export { Serializer };
