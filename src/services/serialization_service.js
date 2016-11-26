"use strict";

app.factory('SerializationService', ['InstrumentService', 'PatternService', 'SequencerService', function(InstrumentService, PatternService, SequencerService) {
  var serializeInstrument = function(instrument) {
    var filterCutoff = parseInt(instrument.filterCutoff, 10);

    var serializedConfig = {
      oscillators: [
        {
          waveform: instrument.waveform1,
          octave: parseInt(instrument.waveform1Octave),
          detune: 0,
        },
        {
          waveform: instrument.waveform2,
          octave: parseInt(instrument.waveform2Octave),
          detune: parseInt(instrument.waveform2Detune),
        }
      ],
      lfo: {
        waveform:  instrument.lfoWaveform,
        frequency: parseFloat(instrument.lfoFrequency),
        amplitude: parseInt(instrument.lfoAmplitude, 10),
      },
      filter: {
        cutoff:    filterCutoff,
        resonance: parseInt(instrument.filterResonance, 10),
        lfo: {
          waveform:  instrument.filterLFOWaveform,
          frequency: parseFloat(instrument.filterLFOFrequency),
          amplitude: parseFloat(instrument.filterLFOAmplitude) * filterCutoff,
        },
      },
      envelope: {
        attack:  parseFloat(instrument.envelopeAttack),
        decay:   parseFloat(instrument.envelopeDecay),
        sustain: parseFloat(instrument.envelopeSustain),
        release: parseFloat(instrument.envelopeRelease),
      },
    };

    return new JSSynth.Instrument(serializedConfig);
  };

  var serializePatterns = function(patterns, instrument, trackVolume) {
    var serializedPatterns = {};

    patterns.forEach(function(pattern) {
      var serializedTracks = [];

      pattern.rows.forEach(function(row) {
        if (!row.muted) {
          var sequence = JSSynth.SequenceParser.parse(serializeTrackNotesIntoSequence(row));
          serializedTracks.push(new JSSynth.Track(instrument, sequence, trackVolume));
        }
      });

      var serializedPattern = new JSSynth.Pattern();
      serializedPattern.replaceTracks(serializedTracks);

      serializedPatterns[pattern.id] = serializedPattern;
    });

    return serializedPatterns;
  };

  var serializeTrackNotesIntoSequence = function(track) {
    var rawNotes = [];

    track.notes.forEach(function(note, index) {
      rawNotes[index] = note.name;
    });

    return rawNotes.join(' ');
  };

  var serializationService = {};

  serializationService.serialize = function() {
    var i;
    var serializedInstrument;
    var serializedPatterns;
    var serializedPatternSequence = [];

    var sequencerTracks = SequencerService.tracks();
    var totalMeasures = sequencerTracks[0].patterns.length;

    for (i = 0; i < totalMeasures; i++) {
      serializedPatternSequence[i * 16] = [];
    }

    sequencerTracks.forEach(function(sequencerTrack) {
      if (sequencerTrack.muted) {
        return;
      }

      serializedInstrument = serializeInstrument(InstrumentService.instrumentByID(sequencerTrack.instrumentID));
      serializedPatterns = serializePatterns(PatternService.patternsByTrackID(sequencerTrack.id), serializedInstrument, sequencerTrack.volume);

      for (i = 0; i < totalMeasures; i++) {
        if (sequencerTrack.patterns[i].patternID !== -1) {
          serializedPatternSequence[i * 16].push(serializedPatterns[sequencerTrack.patterns[i].patternID]);
        }
      }
    });

    return serializedPatternSequence;
  };

  return serializationService;
}]);
