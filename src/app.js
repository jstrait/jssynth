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
  };

  instrumentService.updateInstrument = function() {
    $rootScope.$broadcast('InstrumentService.update');
  };

  instrumentService.instruments = function() { return instruments; };

  return instrumentService;
}]);

app.factory('PatternService', ['$rootScope', 'InstrumentService', function($rootScope, InstrumentService) {
  var patterns = [
                   {
                     name: 'Pattern A',
                     instrumentID: 0,
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
                     name: 'Pattern B',
                     instrumentID: 1,
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

  var Serializer = function() {
    var serializer = {};

    var serializeInstruments = function() {
      var serializedInstruments = [];

      InstrumentService.instruments().forEach(function(instrument) {
        var filterCutoff = parseInt(instrument.filterCutoff, 10);

        serializedInstruments.push({
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
        });
      });

      return serializedInstruments;
    };

    var serializeTrackNotesIntoSequence = function(track) {
      var rawNotes = [];

      track.notes.forEach(function(note, index) {
        rawNotes[index] = note.name;
      });

      return rawNotes.join(' ');
    };

    serializer.serialize = function() {
      var serializedInstruments = serializeInstruments();
      var serializedTracks = [];

      serializedInstruments.forEach(function(serializedInstrument, index) {
        var instrument = new JSSynth.Instrument(serializedInstrument);
        var instrumentTracks = patterns[index].tracks;

        instrumentTracks.forEach(function(track) {
          var sequence = JSSynth.SequenceParser.parse(serializeTrackNotesIntoSequence(track));
          serializedTracks.push(new JSSynth.Track(instrument, sequence, track.muted));
        });
      });

      return serializedTracks;
    };

    return serializer;
  };

  
  var patternService = {};

  patternService.addTrack = function(instrumentIndex) {
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
    patterns[instrumentIndex].tracks.push(newTrack);

    $rootScope.$broadcast('PatternService.update');
  };

  patternService.removeTrack = function(instrumentIndex, trackIndex) {
    patterns[instrumentIndex].tracks.splice(trackIndex, 1);

    if (patterns[instrumentIndex].tracks.length === 0) {
      patternService.addTrack(instrumentIndex);
    }

    $rootScope.$broadcast('PatternService.update');
  };

  patternService.toggleTrackMute = function(instrumentIndex, trackIndex) {
    patterns[instrumentIndex].tracks[trackIndex].muted = !patterns[instrumentIndex].tracks[trackIndex].muted;
    $rootScope.$broadcast('PatternService.update');
  };

  patternService.updateNotes = function(instrumentIndex, trackIndex, noteIndex) {
    var i;
    var newNoteName = patterns[instrumentIndex].tracks[trackIndex].notes[noteIndex].name;

    if (newNoteName === "-") {
      i = noteIndex - 1;
      while (i >= 0 && patterns[instrumentIndex].tracks[trackIndex].notes[i].name === "") {
        patterns[instrumentIndex].tracks[trackIndex].notes[i].name = "-";
        i -= 1;
      }
    }
    else if (newNoteName === "") {
      i = noteIndex + 1;
      while (i < patterns[instrumentIndex].tracks[trackIndex].notes.length && patterns[instrumentIndex].tracks[trackIndex].notes[i].name === "-") {
        patterns[instrumentIndex].tracks[trackIndex].notes[i].name = "";
        i += 1;
      }
    }

    $rootScope.$broadcast('PatternService.update');
  };
 
  patternService.patterns = function() { return patterns; };

  patternService.serialize = function() {
    return new Serializer().serialize();
  };

  return patternService;
}]);


app.factory('TransportService', ['$rootScope', function($rootScope) {
  var playing = false;
  var amplitude = 0.25;
  var tempo = 100;
  var loop = true;

  var stopCallback = function() {
    playing = false;
  };

  var pattern = new JSSynth.Pattern();
  var transport = new JSSynth.Transport(pattern, stopCallback);

  if (!transport) {
    alert("Your browser doesn't appear to support WebAudio, and so won't be able to use the JS-120. Try a recent version of Chrome, Safari, or Firefox.");
    return;
  }

  var transportService = {};

  transportService.toggle = function() {
    transport.toggle();
  };

  transportService.setTempo = function(newTempo) {
    tempo = newTempo;
    transport.setTempo(newTempo);
  };

  transportService.setAmplitude = function(newAmplitude) {
    amplitude = newAmplitude;
    transport.setAmplitude(newAmplitude);
  };

  transportService.setPattern = function(newTracks) {
    pattern.replaceTracks(newTracks);
  };

  transportService.loop = function(newLoop) {
    loop = newLoop;
  };

  transportService.export = function(exportCompleteCallback) {
    var offlineTransport = new JSSynth.OfflineTransport(pattern, tempo, amplitude, exportCompleteCallback);
    offlineTransport.tick();
  };

  return transportService;
}]);


app.controller('InstrumentController', ['$scope', 'InstrumentService', function($scope, InstrumentService) {
  $scope.instruments = InstrumentService.instruments();

  $scope.$on('InstrumentService.update', function(event) {
    $scope.instruments = InstrumentService.instruments();
  });

  $scope.addInstrument = function() {
    InstrumentService.addInstrument();
  };

  $scope.updateInstrument = function() {
    InstrumentService.updateInstrument();
  };
}]);


app.controller('PatternController', ['$scope', 'InstrumentService', 'PatternService', function($scope, InstrumentService, PatternService) {
  $scope.patterns = PatternService.patterns();

  $scope.$on('PatternService.update', function(event) {
    $scope.patterns = PatternService.patterns();
  });

  $scope.addTrack = function(patternIndex) {
    PatternService.addTrack(patternIndex);
  };

  $scope.removeTrack = function(patternIndex, trackIndex) {
    PatternService.removeTrack(patternIndex, trackIndex);
  };

  $scope.toggleTrackMute = function(patternIndex, trackIndex) {
    PatternService.toggleTrackMute(patternIndex, trackIndex);
  };

  $scope.updateNotes = function(patternIndex, trackIndex, noteIndex) {
    PatternService.updateNotes(patternIndex, trackIndex, noteIndex);
  };
}]);


app.controller('TransportController', ['$scope', 'PatternService', 'TransportService', function($scope, PatternService, TransportService) {
  $scope.playing = false;
  $scope.amplitude = 0.25;
  $scope.tempo = 100;
  $scope.loop = true;
  $scope.downloadFileName = "js-120";

  TransportService.setPattern(PatternService.serialize());
  $scope.$on('InstrumentService.update', function(event) {
    TransportService.setPattern(PatternService.serialize());
  });
  $scope.$on('PatternService.update', function(event) {
    TransportService.setPattern(PatternService.serialize());
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
           var trackIndex = parseInt(element[0].id.split("-")[1], 10);
           var noteIndex = parseInt(element[0].id.split("-")[3], 10);
           var nextNoteId = 'track-' + (trackIndex + config.trackIndexDelta) + '-note-' + (noteIndex + config.noteIndexDelta);

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
