"use strict";

app.factory('SerializationService', ['InstrumentService', 'PatternService', 'SequencerService', function(InstrumentService, PatternService, SequencerService) {
  var serializeInstruments = function() {
    var serializedInstruments = {};

    InstrumentService.instruments().forEach(function(instrument) {
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

      serializedInstruments[instrument.id] = new JSSynth.Instrument(serializedConfig);
    });

    return serializedInstruments;
  };

  var serializePatterns = function(serializedInstruments) {
    var serializedPatterns = {};

    var emptyPattern = {
      id: -1,
      name: 'Empty Pattern',
      instrumentID: 1,
      tracks: [
        {
          muted: false,
          notes: [{name: ''},
                  {name: ''},
                  {name: ''},
                  {name: ''},
                  {name: ''},
                  {name: ''},
                  {name: ''},
                  {name: ''},
                  {name: ''},
                  {name: ''},
                  {name: ''},
                  {name: ''},
                  {name: ''},
                  {name: ''},
                  {name: ''},
                  {name: ''},],
        },
      ],
    };

    PatternService.patterns().forEach(function(pattern) {
      var serializedTracks = [];
      var instrument = serializedInstruments[pattern.instrumentID];

      pattern.rows.forEach(function(row) {
        var sequence = JSSynth.SequenceParser.parse(serializeTrackNotesIntoSequence(row));
        serializedTracks.push(new JSSynth.Track(instrument, sequence, row.muted));
      });

      var serializedPattern = new JSSynth.Pattern();
      serializedPattern.replaceTracks(serializedTracks);

      serializedPatterns[pattern.id] = serializedPattern;
    });

    // Empty pattern
    serializedPatterns[-1] = new JSSynth.Pattern();
    var emptyTracks = [];
    emptyPattern.tracks.forEach(function(track) {
      var sequence = JSSynth.SequenceParser.parse(serializeTrackNotesIntoSequence(track));
      emptyTracks.push(new JSSynth.Track(serializedInstruments[1], sequence, track.muted));
    });
    serializedPatterns[-1].replaceTracks(emptyTracks);

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
    var serializedInstruments = serializeInstruments();
    var serializedPatterns = serializePatterns(serializedInstruments);
    var serializedPatternSequence = [];

    var sequencerPatterns = SequencerService.tracks();
    var totalSteps = sequencerPatterns[0].patterns.length;

    for (var i = 0; i < totalSteps; i++) {
      serializedPatternSequence[i * 16] = [];
      
      sequencerPatterns.forEach(function(row) {
        if (!row.muted) {
          serializedPatternSequence[i * 16].push(serializedPatterns[row.patterns[i].patternID]);
        }
      });
    }

    return serializedPatternSequence;
  };

  return serializationService;
}]);
