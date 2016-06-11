"use strict";

var app = angular.module('js120', []);

app.factory('InstrumentService', ['$rootScope', function($rootScope) {
  var IDGenerator = function() {
    var nextId = 0;

    return {
      next: function() {
        nextId++;

        return nextId;  
      },
   };
  };
  var idGenerator = new IDGenerator();

  var instruments = [{
                        id:                 idGenerator.next(),
                        name:               'Instrument 1',
                        waveform:           'square',
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
                        waveform:           'sawtooth',
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
      waveform:           'sawtooth',
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

app.factory('PatternService', ['$rootScope', 'InstrumentService', function($rootScope, InstrumentService) {
  var IDGenerator = function() {
    var nextId = 0;

    return {
      next: function() {
        nextId++;

        return nextId;  
      },
   };
  };
  var idGenerator = new IDGenerator();

  var patterns = [
                   {
                     id: idGenerator.next(),
                     name: 'Pattern 1',
                     instrumentID: 1,
                     tracks: [
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
                     tracks: [
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

  patternService.changeInstrument = function(patternIndex) {
    $rootScope.$broadcast('PatternService.update');
  };

  patternService.addPattern = function(instrumentID) {
    var id = idGenerator.next();

    var newPattern = {
      id: id,
      name: 'Pattern ' + id,
      instrumentID: instrumentID,
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
      ]
    };

    patterns.push(newPattern);

    $rootScope.$broadcast('PatternService.update');
  };

  patternService.addTrack = function(patternID) {
    var newTrack = {
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
    pattern.tracks.push(newTrack);

    $rootScope.$broadcast('PatternService.update');
  };

  patternService.removeTrack = function(patternID, trackIndex) {
    var pattern = patternService.patternByID(patternID);
    pattern.tracks.splice(trackIndex, 1);

    if (pattern.tracks.length === 0) {
      patternService.addTrack(patternID);
    }

    $rootScope.$broadcast('PatternService.update');
  };

  patternService.toggleTrackMute = function(patternID, trackIndex) {
    var pattern = patternService.patternByID(patternID);
    pattern.tracks[trackIndex].muted = !pattern.tracks[trackIndex].muted;
    $rootScope.$broadcast('PatternService.update');
  };

  patternService.updateName = function(patternIndex) {
    $rootScope.$broadcast('PatternService.update');
  };

  patternService.updateNotes = function(patternID, trackIndex, noteIndex) {
    var i;
    var pattern = patternService.patternByID(patternID);
    var newNoteName = pattern.tracks[trackIndex].notes[noteIndex].name;

    if (newNoteName === "-") {
      i = noteIndex - 1;
      while (i >= 0 && pattern.tracks[trackIndex].notes[i].name === "") {
        pattern.tracks[trackIndex].notes[i].name = "-";
        i -= 1;
      }
    }
    else if (newNoteName === "") {
      i = noteIndex + 1;
      while (i < pattern.tracks[trackIndex].notes.length && pattern.tracks[trackIndex].notes[i].name === "-") {
        pattern.tracks[trackIndex].notes[i].name = "";
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


app.factory('SequencerService', ['$rootScope', 'InstrumentService', function($rootScope, InstrumentService) {
  var patterns = [
                   {
                     muted: false,
                     patterns: [
                       { patternID: 1, },
                       { patternID: 2, },
                       { patternID: -1, },
                       { patternID: 1, },
                       { patternID: 1, },
                       { patternID: 1, },
                       { patternID: 1, },
                       { patternID: 1, },
                     ],
                   },
                   {
                     muted: false,
                     patterns: [
                       { patternID: 2, },
                       { patternID: -1, },
                       { patternID: -1, },
                       { patternID: 2, },
                       { patternID: 2, },
                       { patternID: 2, },
                       { patternID: 2, },
                       { patternID: 2, },
                     ],
                   }
                 ];

  var sequencerService = {};

  sequencerService.patterns = function() { return patterns; };

  sequencerService.changeSequencer = function(sequenceIndex) {
    $rootScope.$broadcast('SequencerService.update');
  };

  sequencerService.addRow = function(rowIndex) {
    patterns.push({
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
    });

    $rootScope.$broadcast('SequencerService.update');
  };

  sequencerService.removeRow = function(rowIndex) {
    patterns.splice(rowIndex, 1);

    if (patterns.length === 0) {
      sequencerService.addRow(0);
    }

    $rootScope.$broadcast('SequencerService.update');
  };

  sequencerService.toggleRowMute = function(rowIndex) {
    patterns[rowIndex].muted = !patterns[rowIndex].muted;
    $rootScope.$broadcast('SequencerService.update');
  };

  return sequencerService;
}]);


app.factory('SerializationService', ['InstrumentService', 'PatternService', 'SequencerService', function(InstrumentService, PatternService, SequencerService) {
  var serializeInstruments = function() {
    var serializedInstruments = {};

    InstrumentService.instruments().forEach(function(instrument) {
      var filterCutoff = parseInt(instrument.filterCutoff, 10);

      var serializedConfig = {
        waveform:  instrument.waveform,
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

      pattern.tracks.forEach(function(track) {
        var sequence = JSSynth.SequenceParser.parse(serializeTrackNotesIntoSequence(track));
        serializedTracks.push(new JSSynth.Track(instrument, sequence, track.muted));
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

    var sequencerPatterns = SequencerService.patterns();
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


app.controller('InstrumentCollectionController', ['$rootScope', '$scope', 'InstrumentService', function($rootScope, $scope, InstrumentService) {
  var buildInstrumentOptions = function() {
    return InstrumentService.instruments().map(function(instrument) {
     return { id: instrument.id, name: instrument.name };
    });
  };

  $scope.instrumentOptions = buildInstrumentOptions();
  $scope.$on('InstrumentService.update', function(event) {
    $scope.instrumentOptions = buildInstrumentOptions();
  });

  $scope.selectedInstrumentID = 1;

  $scope.addInstrument = function() {
    var newInstrument = InstrumentService.addInstrument();
    $scope.selectedInstrumentID = newInstrument.id;
    $scope.changeSelectedInstrument(newInstrument.id);
  };

  $scope.changeSelectedInstrument = function(instrumentID) {
    $scope.selectedInstrumentID = instrumentID;
    $rootScope.$broadcast('InstrumentCollectionController.selectedInstrumentChanged', { instrumentID: instrumentID });
  };
}]);


app.controller('InstrumentController', ['$scope', 'InstrumentService', function($scope, InstrumentService) {
  var instrumentID = 1;
  
  $scope.instrument = InstrumentService.instrumentByID(instrumentID);
  $scope.$on('InstrumentCollectionController.selectedInstrumentChanged', function(event, args) {
    instrumentID = args.instrumentID;
    $scope.instrument = InstrumentService.instrumentByID(instrumentID);
  });

  $scope.$on('InstrumentService.update', function(event) {
    $scope.instrument = InstrumentService.instrumentByID(instrumentID);
  });

  $scope.updateInstrument = function() {
    InstrumentService.updateInstrument();
  };
}]);


app.controller('PatternController', ['$scope', 'InstrumentService', 'PatternService', function($scope, InstrumentService, PatternService) {
  var instrumentID = 1;
  $scope.patterns = PatternService.patternsByInstrumentID(instrumentID);

  var buildInstrumentOptions = function() {
    return InstrumentService.instruments().map(function(instrument) {
     return { id: instrument.id, name: instrument.name };
    });
  };

  $scope.instrumentOptions = buildInstrumentOptions();
  $scope.$on('InstrumentService.update', function(event) {
    $scope.instrumentOptions = buildInstrumentOptions();
  });
  $scope.$on('InstrumentCollectionController.selectedInstrumentChanged', function(event, args) {
    instrumentID = args.instrumentID;
    $scope.patterns = PatternService.patternsByInstrumentID(instrumentID);
  });

  $scope.$on('PatternService.update', function(event) {
    $scope.patterns = PatternService.patternsByInstrumentID(instrumentID);
  });

  $scope.addPattern = function() {
    PatternService.addPattern(instrumentID);
  };

  $scope.updateName = function(patternIndex) {
    PatternService.updateName(patternIndex);
  };

  $scope.changeInstrument = function(patternIndex) {
    PatternService.changeInstrument(patternIndex);
  };

  $scope.addTrack = function(patternID) {
    PatternService.addTrack(patternID);
  };

  $scope.removeTrack = function(patternID, trackIndex) {
    PatternService.removeTrack(patternID, trackIndex);
  };

  $scope.toggleTrackMute = function(patternIndex, trackIndex) {
    PatternService.toggleTrackMute(patternIndex, trackIndex);
  };

  $scope.updateNotes = function(patternIndex, trackIndex, noteIndex) {
    PatternService.updateNotes(patternIndex, trackIndex, noteIndex);
  };
}]);


app.controller('SequencerController', ['$scope', 'PatternService', 'SequencerService', 'TransportService', function($scope, PatternService, SequencerService, TransportService) {
  $scope.patterns = SequencerService.patterns();
  $scope.currentStep = 1;

  var buildPatternOptions = function() {
    var patternOptions = PatternService.patterns().map(function(pattern) {
      return { id: pattern.id, name: pattern.name };
    });

    patternOptions.unshift({ id: -1, name: ''});

    return patternOptions;
  };

  $scope.patternOptions = buildPatternOptions();
  $scope.$on('PatternService.update', function(event) {
    $scope.patternOptions = buildPatternOptions();
  });

  $scope.changeSequencer = function(sequenceIndex) {
    SequencerService.changeSequencer(sequenceIndex);
  };

  $scope.addRow = function(rowIndex) {
    SequencerService.addRow(rowIndex);
  };

  $scope.removeRow = function(rowIndex) {
    SequencerService.removeRow(rowIndex);
  };

  $scope.toggleRowMute = function(rowIndex) {
    SequencerService.toggleRowMute(rowIndex);
  };

  $scope.syncCurrentStep = function() {
    if (TransportService.currentStep()) {
      $scope.currentStep = Math.floor((TransportService.currentStep() / 16) % 8) + 1;
    }
    else
    {
      $scope.currentStep = null;
    }
  };
}]);


app.controller('TransportController', ['$scope', 'SerializationService', 'TransportService', function($scope, SerializationService, TransportService) {
  $scope.playing = false;
  $scope.amplitude = 0.25;
  $scope.tempo = 100;
  $scope.loop = true;
  $scope.downloadFileName = "js-120";

  TransportService.setPatterns(SerializationService.serialize());
  $scope.$on('InstrumentService.update', function(event) {
    TransportService.setPatterns(SerializationService.serialize());
  });
  $scope.$on('PatternService.update', function(event) {
    TransportService.setPatterns(SerializationService.serialize());
  });
  $scope.$on('SequencerService.update', function(event) {
    TransportService.setPatterns(SerializationService.serialize());
  });

  $scope.updateTempo = function() {
    TransportService.setTempo(parseInt($scope.tempo, 10));
  };

  $scope.updateAmplitude = function() {
    TransportService.setAmplitude(parseFloat($scope.amplitude));
  };

  $scope.toggle = function() {
    TransportService.toggle();
    $scope.playing = !$scope.playing;
  };

  $scope.updateLoop = function() {
    TransportService.loop = $scope.loop;
  };

  $scope.export = function() {
    var exportCompleteCallback = function(blob) {
      var url  = window.URL.createObjectURL(blob);

      var hiddenDownloadLink = document.getElementById("hidden-download-link");
      if (typeof hiddenDownloadLink.download != "undefined") {
        hiddenDownloadLink.download = $scope.downloadFileName + ".wav";
        hiddenDownloadLink.href = url;
        hiddenDownloadLink.click();
      }
      else {
        alert("Downloading to Wave file is not supported in your browser.");
      }

      window.URL.revokeObjectURL(blob);
    };

    TransportService.export(exportCompleteCallback);
  };
}]);


// Copied from Angular docs, added to allow using an integer value
// with a <select> tag.
app.directive('convertToNumber', function() {
  return {
    require: 'ngModel',
    link: function(scope, element, attrs, ngModel) {
      ngModel.$parsers.push(function(val) {
        return parseInt(val, 10);
      });
      ngModel.$formatters.push(function(val) {
        return '' + val;
      });
    }
  };
});


app.directive('transportProgress', ['$interval', function($interval) {
  return {
    require: 'ngModel',
    link: function(scope, element, attrs, ctrl) {
      if (!ctrl) return;
      var updateProgress = function() {
        scope.syncCurrentStep();
      };

      element.on('$destroy', function() {
        $interval.cancel(timeoutId);
      });

      var timeoutId = $interval(function() {
        updateProgress();
      }, 1);
    },
  };
}]);


app.directive('noteInput', function () {
  return {
    require: 'ngModel',
    link: function (scope, element, attrs, ctrl) {
       if (!ctrl) return;

       var formatNoteValue = function(rawValue) {
         var formattedValue = rawValue;

         // Make first character uppercase (but not subsequent characters, to avoid
         // making a 'b' uppercase, which will mess with ♭ replacement).
         var firstCharacter = formattedValue.substr(0, 1);
         formattedValue = firstCharacter.toUpperCase() + formattedValue.substr(1);

         formattedValue = formattedValue.replace("##", "𝄪");
         formattedValue = formattedValue.replace("#", "♯");
         formattedValue = formattedValue.replace("bb", "𝄫");
         formattedValue = formattedValue.replace("b", "♭");
         formattedValue = formattedValue.replace("-", "—");

         return formattedValue;
       };

       ctrl.$formatters.push(function (a) {
         return formatNoteValue(ctrl.$modelValue);
       });

       ctrl.$parsers.unshift(function (viewValue) {
         var parsedValue = viewValue;

         // Make first character uppercase (but not subsequent characters, to avoid
         // making a 'b' uppercase, which will mess with ♭ replacement).
         var firstCharacter = viewValue.substr(0, 1);
         parsedValue = firstCharacter.toUpperCase() + viewValue.substr(1);
         parsedValue = parsedValue.replace("♯", "#");
         parsedValue = parsedValue.replace("𝄪", "##");
         parsedValue = parsedValue.replace("♭", "b");
         parsedValue = parsedValue.replace("𝄫", "bb");

         if (/^$|^-$|(^[A-G](b|bb|#|##){0,1}[0-7]$)/.test(parsedValue)) {
           ctrl.$setValidity('noteInput', true);
           return parsedValue;
         }
         else {
           ctrl.$setValidity('noteInput', false);
           return '';
         }
       });

       element.bind('blur', function(e) {
         element.val(formatNoteValue(element.val()));
       });

       element.bind('keydown', function(e) {
         var changeCurrentlySelectedNote = function(element, config) {
           var patternID = parseInt(element[0].id.split("-")[1], 10);
           var trackIndex = parseInt(element[0].id.split("-")[3], 10);
           var noteIndex = parseInt(element[0].id.split("-")[5], 10);
           var nextNoteId = 'pattern-' + patternID + '-track-' + (trackIndex + config.trackIndexDelta) + '-note-' + (noteIndex + config.noteIndexDelta);

           document.getElementById(nextNoteId).focus();
         };

         var currentValue = element.val();

         if (e.keyCode === 32) {  // Space bar
           element.val('');
         }
         else if (e.keyCode >= 48 && e.keyCode <= 57) {  // Numbers 0 through 9
           if (/^.*\d$/.test(currentValue)) {
             element.val(currentValue.slice(0, currentValue.length - 1));
           }
         }
         else if (e.keyCode === 189) {  // Dash
           element.val('');
         }
         else if (e.keyCode === 37) {  // Left arrow key
           if (element[0].selectionStart === 0 && !(element.hasClass('firstNote'))) {
             changeCurrentlySelectedNote(element, { trackIndexDelta: 0, noteIndexDelta: -1 });
           }
         }
         else if (e.keyCode === 39) {  // Right arrow key
           if (element[0].selectionEnd === currentValue.length && !(element.hasClass('lastNote'))) {
             changeCurrentlySelectedNote(element, { trackIndexDelta: 0, noteIndexDelta: 1 });
           }
         }
         else if (e.keyCode === 38) {  // Up arrow key
           if (!(element.hasClass('firstTrack'))) {
             changeCurrentlySelectedNote(element, { trackIndexDelta: -1, noteIndexDelta: 0 });
           }
         }
         else if (e.keyCode === 40) {  // Down arrow key
           if (!(element.hasClass('lastTrack'))) {
             changeCurrentlySelectedNote(element, { trackIndexDelta: 1, noteIndexDelta: 0 });
           }
         }
       });

       element.bind('keyup', function(e) {
         if (e.keyCode === 32) {  // Space bar
           element.val('');
         }
       });
    }
  };
});
