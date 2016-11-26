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
      var serializedRows = [];

      pattern.rows.forEach(function(row) {
        var sequence;
        var rawSequenceString;

        if (!row.muted) {
          rawSequenceString = row.notes.map(function(note) { return note.name; }).join(' ');
          sequence = JSSynth.SequenceParser.parse(rawSequenceString);
          serializedRows.push(sequence);
        }
      });

      serializedPatterns[pattern.id] = serializedRows;
    });

    return serializedPatterns;
  };

  var serializationService = {};

  serializationService.serialize = function() {
    var i, j;
    var serializedInstrument;
    var serializedPatterns;
    var serializedNotes = [];

    for (i = 0; i < SequencerService.totalSteps(); i++) {
      serializedNotes[i] = [];
    }

    var tracks = SequencerService.tracks();
    tracks.forEach(function(track) {
      if (track.muted) {
        return;
      }

      serializedInstrument = serializeInstrument(InstrumentService.instrumentByID(track.instrumentID));
      serializedPatterns = serializePatterns(PatternService.patternsByTrackID(track.id));

      for (i = 0; i < track.patterns.length; i++) {
        if (track.patterns[i].patternID !== -1) {
          var tracks = serializedPatterns[track.patterns[i].patternID];

          tracks.forEach(function(sequence) {
            for (j = 0; j < sequence.length; j++) {
              if (sequence[j]) {
                serializedNotes[(i * 16) + j].push(new JSSynth.InstrumentNote(sequence[j], serializedInstrument, track.volume));
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
