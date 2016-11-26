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

  var serializePatterns = function(patterns) {
    var serializedPatterns = {};

    patterns.forEach(function(pattern) {
      var serializedTracks = [];

      pattern.rows.forEach(function(row) {
        var sequence;

        if (!row.muted) {
          sequence = JSSynth.SequenceParser.parse(serializeTrackNotesIntoSequence(row));
          serializedTracks.push(sequence);
        }
      });

      serializedPatterns[pattern.id] = serializedTracks;
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
    var i, j;
    var serializedInstrument;
    var serializedPatterns;
    var serializedNotes = [];

    var sequencerTracks = SequencerService.tracks();
    var totalMeasures = sequencerTracks[0].patterns.length;

    for (i = 0; i < totalMeasures * 16; i++) {
      serializedNotes[i] = [];
    }

    sequencerTracks.forEach(function(sequencerTrack) {
      if (sequencerTrack.muted) {
        return;
      }

      serializedInstrument = serializeInstrument(InstrumentService.instrumentByID(sequencerTrack.instrumentID));
      serializedPatterns = serializePatterns(PatternService.patternsByTrackID(sequencerTrack.id));

      for (i = 0; i < totalMeasures; i++) {
        if (sequencerTrack.patterns[i].patternID !== -1) {
          var tracks = serializedPatterns[sequencerTrack.patterns[i].patternID];

          tracks.forEach(function(sequence) {
            for (j = 0; j < sequence.length; j++) {
              if (sequence[j]) {
                serializedNotes[(i * 16) + j].push(new JSSynth.InstrumentNote(sequence[j], serializedInstrument, sequencerTrack.volume));
              }
            }
          });
        }
      }
    });

    return serializedNotes;
  };

  return serializationService;
}]);
