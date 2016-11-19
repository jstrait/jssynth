"use strict";

app.factory('IdGeneratorService', function() {
  var IdGeneratorService = {};

  IdGeneratorService.buildGenerator = function() {
    var nextId = 0;

    return {
      next: function() {
        nextId++;

        return nextId;  
      },
   };
  };

  return IdGeneratorService;
});

app.factory('InstrumentService', ['$rootScope', 'IdGeneratorService', function($rootScope, IdGeneratorService) {
  var idGenerator = IdGeneratorService.buildGenerator();

  var instruments = [{
                        id:                 idGenerator.next(),
                        name:               'Instrument 1',
                        waveform1:          'square',
                        waveform1Octave:    0,
                        waveform2:          'sawtooth',
                        waveform2Detune:    0,
                        waveform2Octave:    0,
                        lfoWaveform:        'sine',
                        lfoFrequency:       5,
                        lfoAmplitude:       10,
                        filterCutoff:       1000,
                        filterResonance:    0,
                        filterLFOWaveform:  'sine',
                        filterLFOFrequency: 5,
                        filterLFOAmplitude: 0,
                        envelopeAttack:     0.0,
                        envelopeDecay:      0.0,
                        envelopeSustain:    1.0,
                        envelopeRelease:    0.0,
                     },
                     {
                        id:                 idGenerator.next(),
                        name:               'Instrument 2',
                        waveform1:          'sawtooth',
                        waveform1Octave:    0,
                        waveform2:          'sine',
                        waveform2Detune:    0,
                        waveform2Octave:    0,
                        lfoWaveform:        'sine',
                        lfoFrequency:       5,
                        lfoAmplitude:       0,
                        filterCutoff:       1000,
                        filterResonance:    0,
                        filterLFOWaveform:  'sine',
                        filterLFOFrequency: 5,
                        filterLFOAmplitude: 0,
                        envelopeAttack:     0.0,
                        envelopeDecay:      0.0,
                        envelopeSustain:    1.0,
                        envelopeRelease:    0.0,
                     },];

  var instrumentService = {};

  instrumentService.addInstrument = function() {
    var id = idGenerator.next();
    var newInstrument = {
      id:                 id,
      name:               'Instrument ' + id,
      waveform1:          'sawtooth',
      waveform1Octave:    0,
      waveform2:          'square',
      waveform2Detune:    0,
      waveform1Octave:    0,
      lfoWaveform:        'sine',
      lfoFrequency:       5,
      lfoAmplitude:       0,
      filterCutoff:       1000,
      filterResonance:    0,
      filterLFOWaveform:  'sine',
      filterLFOFrequency: 5,
      filterLFOAmplitude: 0,
      envelopeAttack:     0.0,
      envelopeDecay:      0.0,
      envelopeSustain:    1.0,
      envelopeRelease:    0.0,
    };

    instruments.push(newInstrument);

    $rootScope.$broadcast('InstrumentService.update');

    return newInstrument;
  };

  instrumentService.removeInstrument = function(instrumentID) {
    var i;

    var instrumentIndex = null;
    for (i = 0; i < instruments.length; i++) {
      if (instruments[i].id === instrumentID) {
        instrumentIndex = i;
      }
    }

    if (instrumentIndex !== null) {
      instruments.splice(instrumentIndex, 1);
    }

    $rootScope.$broadcast('InstrumentService.update');
  };

  instrumentService.updateInstrument = function() {
    $rootScope.$broadcast('InstrumentService.update');
  };

  instrumentService.instrumentByID = function(targetID) {
    for (var i = 0; i < instruments.length; i++) {
      if (instruments[i].id === targetID) {
        return instruments[i];
      }
    }

    return null;
  };

  instrumentService.instruments = function() { return instruments; };

  return instrumentService;
}]);

app.factory('PatternService', ['$rootScope', 'IdGeneratorService', 'InstrumentService', function($rootScope, IdGeneratorService, InstrumentService) {
  var idGenerator = IdGeneratorService.buildGenerator();

  var patterns = [
                   {
                     id: idGenerator.next(),
                     name: 'Pattern 1',
                     instrumentID: 1,
                     rows: [
                       {
                         muted: false,
                         notes: [{name: 'E4'},
                                 {name: 'G4'},
                                 {name: ''},
                                 {name: 'E4'},
                                 {name: 'A5'},
                                 {name: '-'},
                                 {name: 'C5'},
                                 {name: '-'},
                                 {name: 'A5'},
                                 {name: '-'},
                                 {name: 'G4'},
                                 {name: '-'},
                                 {name: 'E4'},
                                 {name: 'D4'},
                                 {name: 'C4'},
                                 {name: ''},],
                       },
                     ],
                   },
                   {
                     id: idGenerator.next(),
                     name: 'Pattern 2',
                     instrumentID: 2,
                     rows: [
                       {
                         muted: false,
                         notes: [{name: 'C1'},
                                 {name: '-'},
                                 {name: '-'},
                                 {name: '-'},
                                 {name: '-'},
                                 {name: '-'},
                                 {name: '-'},
                                 {name: '-'},
                                 {name: '-'},
                                 {name: '-'},
                                 {name: '-'},
                                 {name: '-'},
                                 {name: 'D1'},
                                 {name: '-'},
                                 {name: '-'},
                                 {name: '-'},],
                       },
                       {
                         muted: false,
                         notes: [{name: 'C3'},
                                 {name: '-'},
                                 {name: '-'},
                                 {name: '-'},
                                 {name: '-'},
                                 {name: '-'},
                                 {name: '-'},
                                 {name: '-'},
                                 {name: '-'},
                                 {name: '-'},
                                 {name: '-'},
                                 {name: '-'},
                                 {name: ''},
                                 {name: ''},
                                 {name: ''},
                                 {name: ''},],
                       },
                       {
                         muted: false,
                         notes: [{name: 'E3'},
                                 {name: '-'},
                                 {name: '-'},
                                 {name: '-'},
                                 {name: '-'},
                                 {name: '-'},
                                 {name: '-'},
                                 {name: '-'},
                                 {name: '-'},
                                 {name: '-'},
                                 {name: '-'},
                                 {name: '-'},
                                 {name: ''},
                                 {name: ''},
                                 {name: ''},
                                 {name: ''},],
                       },
                     ],
                   },
                 ];
  
  var patternService = {};

  patternService.addPattern = function(instrumentID) {
    var id = idGenerator.next();

    var newPattern = {
      id: id,
      name: 'Pattern ' + id,
      instrumentID: instrumentID,
      rows: [
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
      ]
    };

    patterns.push(newPattern);

    $rootScope.$broadcast('PatternService.update');

    return newPattern;
  };

  patternService.removePattern = function(patternID) {
    var patternIndex = patternIndexByID(patternID);
    patterns.splice(patternIndex, 1);

    $rootScope.$broadcast('PatternService.update');
  };

  var patternIndexByID = function(targetID) {
    for (var i = 0; i < patterns.length; i++) {
      if (patterns[i].id === targetID) {
        return i;
      }
    }

    return null;
  };

  patternService.addRow = function(patternID) {
    var newRow = {
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
                           {name: ''}],
                   };
    var pattern = patternService.patternByID(patternID);
    pattern.rows.push(newRow);

    $rootScope.$broadcast('PatternService.update');
  };

  patternService.removeRow = function(patternID, rowIndex) {
    var pattern = patternService.patternByID(patternID);
    pattern.rows.splice(rowIndex, 1);

    if (pattern.rows.length === 0) {
      patternService.addRow(patternID);
    }

    $rootScope.$broadcast('PatternService.update');
  };

  patternService.toggleRowMute = function(patternID, rowIndex) {
    var pattern = patternService.patternByID(patternID);
    pattern.rows[rowIndex].muted = !pattern.rows[rowIndex].muted;
    $rootScope.$broadcast('PatternService.update');
  };

  patternService.updateName = function(patternID) {
    $rootScope.$broadcast('PatternService.update');
  };

  patternService.updateNotes = function(patternID, rowIndex, noteIndex) {
    var i;
    var pattern = patternService.patternByID(patternID);
    var newNoteName = pattern.rows[rowIndex].notes[noteIndex].name;

    if (newNoteName === "-") {
      i = noteIndex - 1;
      while (i >= 0 && pattern.rows[rowIndex].notes[i].name === "") {
        pattern.rows[rowIndex].notes[i].name = "-";
        i -= 1;
      }
    }
    else if (newNoteName === "") {
      i = noteIndex + 1;
      while (i < pattern.rows[rowIndex].notes.length && pattern.rows[rowIndex].notes[i].name === "-") {
        pattern.rows[rowIndex].notes[i].name = "";
        i += 1;
      }
    }

    $rootScope.$broadcast('PatternService.update');
  };
 
  patternService.patterns = function() { return patterns; };

  patternService.patternByID = function(targetID) {
    for (var i = 0; i < patterns.length; i++) {
      if (patterns[i].id === targetID) {
        return patterns[i];
      }
    }

    return null;
  };

  patternService.patternsByInstrumentID = function(targetID) {
    var filteredPatterns = [];

    for (var i = 0; i < patterns.length; i++) {
      if (patterns[i].instrumentID === targetID) {
        filteredPatterns.push(patterns[i]);
      }
    }

    return filteredPatterns;
  };

  return patternService;
}]);


app.factory('SequencerService', ['$rootScope', 'IdGeneratorService', 'InstrumentService', 'PatternService', function($rootScope, IdGeneratorService, InstrumentService, PatternService) {
  var idGenerator = IdGeneratorService.buildGenerator();

  var tracks = [
                   {
                     id: idGenerator.next(),
                     name: 'Melody',
                     instrumentID: 1,
                     muted: false,
                     patterns: [
                       { patternID: 1, },
                       { patternID: 1, },
                       { patternID: 1, },
                       { patternID: 1, },
                       { patternID: 1, },
                       { patternID: 1, },
                       { patternID: 1, },
                       { patternID: 1, },
                     ],
                   },
                   {
                     id: idGenerator.next(),
                     name: 'Chords',
                     instrumentID: 2,
                     muted: false,
                     patterns: [
                       { patternID: 2, },
                       { patternID: 2, },
                       { patternID: 2, },
                       { patternID: 2, },
                       { patternID: 2, },
                       { patternID: 2, },
                       { patternID: 2, },
                       { patternID: 2, },
                     ],
                   }
                 ];

  var trackIndexByID = function(targetID) {
    for (var i = 0; i < tracks.length; i++) {
      if (tracks[i].id === targetID) {
        return i;
      }
    }

    return null;
  };

  var sequencerService = {};

  sequencerService.tracks = function() { return tracks; };

  sequencerService.changeSequencer = function(sequenceIndex) {
    $rootScope.$broadcast('SequencerService.update');
  };

  sequencerService.trackByID = function(targetID) {
    for (var i = 0; i < tracks.length; i++) {
      if (tracks[i].id === targetID) {
        return tracks[i];
      }
    }

    return null;
  };

  sequencerService.addTrack = function() {
    var newInstrument = InstrumentService.addInstrument();
    var newPattern = PatternService.addPattern(newInstrument.id);

    var newTrack = {
      id: idGenerator.next(),
      name: 'New Track',
      instrumentID: newInstrument.id,
      muted: false,
      patterns: [
        { patternID: -1, },
        { patternID: -1, },
        { patternID: -1, },
        { patternID: -1, },
        { patternID: -1, },
        { patternID: -1, },
        { patternID: -1, },
        { patternID: -1, },
      ],
    };
    tracks.push(newTrack);

    $rootScope.$broadcast('SequencerService.update');

    return newTrack;
  };

  sequencerService.removeTrack = function(trackID) {
    var track = sequencerService.trackByID(trackID);
    var trackIndex = trackIndexByID(trackID);

    PatternService.patternsByInstrumentID(track.instrumentID).forEach(function(pattern) {
      PatternService.removePattern(pattern.id);
    });

    InstrumentService.removeInstrument(track.instrumentID);

    tracks.splice(trackIndex, 1);

    if (tracks.length === 0) {
      sequencerService.addTrack();
    }

    $rootScope.$broadcast('SequencerService.update');
  };

  sequencerService.toggleTrackMute = function(trackID) {
    var trackIndex = trackIndexByID(trackID);
    tracks[trackIndex].muted = !tracks[trackIndex].muted;
    $rootScope.$broadcast('SequencerService.update');
  };

  sequencerService.unsetPattern = function(patternID) {
    tracks.forEach(function(track) {
      track.patterns.forEach(function(pattern) {
        if (pattern.patternID === patternID) {
          pattern.patternID = -1;
        }
      });
    });
  };

  return sequencerService;
}]);


app.factory('SerializationService', ['InstrumentService', 'PatternService', 'SequencerService', function(InstrumentService, PatternService, SequencerService) {
  var serializeInstruments = function() {
    var serializedInstruments = {};

    InstrumentService.instruments().forEach(function(instrument) {
      var filterCutoff = parseInt(instrument.filterCutoff, 10);

      var serializedConfig = {
        waveform1: instrument.waveform1,
        waveform1Octave: parseInt(instrument.waveform1Octave),
        waveform2: instrument.waveform2,
        waveform2Detune: parseInt(instrument.waveform2Detune),
        waveform2Octave: parseInt(instrument.waveform2Octave),
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


app.factory('TransportService', ['$rootScope', function($rootScope) {
  var playing = false;
  var amplitude = 0.25;
  var tempo = 100;
  var loop = true;

  var stopCallback = function() {
    playing = false;
  };

  var songPlayer = new JSSynth.SongPlayer([[new JSSynth.Pattern()]]);
  var transport = new JSSynth.Transport(songPlayer, stopCallback);

  if (!transport) {
    alert("Your browser doesn't appear to support WebAudio, and so won't be able to use the JS-120. Try a recent version of Chrome, Safari, or Firefox.");
    return;
  }

  var transportService = {};

  transportService.toggle = function() {
    transport.toggle();
    playing = !playing;

    if (playing) {
      $rootScope.$broadcast('TransportService.start');
    }
    else {
      $rootScope.$broadcast('TransportService.stop');
    }
  };

  transportService.setTempo = function(newTempo) {
    tempo = newTempo;
    transport.setTempo(newTempo);
  };

  transportService.setAmplitude = function(newAmplitude) {
    amplitude = newAmplitude;
    transport.setAmplitude(newAmplitude);
  };

  transportService.setPatterns = function(newPatterns) {
    songPlayer.replacePatterns(newPatterns);
  };

  transportService.loop = function(newLoop) {
    loop = newLoop;
  };

  transportService.currentStep = function() {
    if (playing) {
      return transport.elapsedSteps();
    }
    else {
      return null;
    }
  };

  transportService.export = function(exportCompleteCallback) {
    var offlineTransport = new JSSynth.OfflineTransport(songPlayer, tempo, amplitude, exportCompleteCallback);
    offlineTransport.tick();
  };

  return transportService;
}]);
