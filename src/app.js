"use strict";

var app = angular.module('js110', []);

app.controller('controller', ['$scope', function($scope) {
  var audioContext;

  var synth = { };

  $scope.playing = false;
  $scope.tempo = 100;
  $scope.loop = true;
  $scope.downloadFileName = "js-110";

  $scope.instruments = [{
                          waveform:           'sawtooth',
                          amplitude:          0.75,
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

  $scope.tracks = [{
                     muted: false,
                     notes: [{name: 'C3'},
                             {name: ''},
                             {name: 'Eb3'},
                             {name: 'F3'},
                             {name: 'G3'},
                             {name: 'Bb4'},
                             {name: 'F3'},
                             {name: 'Bb4'},
                             {name: 'C3'},
                             {name: ''},
                             {name: 'Eb3'},
                             {name: 'F3'},
                             {name: 'D3'},
                             {name: 'Eb3'},
                             {name: 'D3'},
                             {name: 'Bb3'},],
                   },
                   {
                     muted: false,
                     notes: [{name: 'C2'},
                             {name: ''},
                             {name: 'C2'},
                             {name: ''},
                             {name: 'C2'},
                             {name: ''},
                             {name: 'C2'},
                             {name: ''},
                             {name: 'C2'},
                             {name: ''},
                             {name: 'C2'},
                             {name: ''},
                             {name: 'C2'},
                             {name: ''},
                             {name: 'C2'},
                             {name: ''},],
                   },
                   {
                     muted: false,
                     notes: [{name: 'Eb3'},
                             {name: '-'},
                             {name: '-'},
                             {name: '-'},
                             {name: 'Eb3'},
                             {name: '-'},
                             {name: '-'},
                             {name: '-'},
                             {name: 'Eb3'},
                             {name: '-'},
                             {name: '-'},
                             {name: '-'},
                             {name: 'Eb3'},
                             {name: '-'},
                             {name: '-'},
                             {name: '-'},],
                   },];

  var serializeInstrument = function() {
    var filterCutoff = parseInt($scope.instruments[0].filterCutoff, 10);

    return {
      waveform:  $scope.instruments[0].waveform,
      amplitude: parseFloat($scope.instruments[0].amplitude),
      lfo: {
        waveform:  $scope.instruments[0].lfoWaveform,
        frequency: parseFloat($scope.instruments[0].lfoFrequency),
        amplitude: parseInt($scope.instruments[0].lfoAmplitude, 10),
      },
      filter: {
        cutoff:    filterCutoff,
        resonance: parseInt($scope.instruments[0].filterResonance, 10),
        lfo: {
          waveform:  $scope.instruments[0].filterLFOWaveform,
          frequency: parseFloat($scope.instruments[0].filterLFOFrequency),
          amplitude: parseFloat($scope.instruments[0].filterLFOAmplitude) * filterCutoff,
        },
      },
      envelope: {
        attack:  parseFloat($scope.instruments[0].envelopeAttack),
        decay:   parseFloat($scope.instruments[0].envelopeDecay),
        sustain: parseFloat($scope.instruments[0].envelopeSustain),
        release: parseFloat($scope.instruments[0].envelopeRelease),
      },
    };
  };

  var parseTrack = function(track) {
    var rawNotes = [];

    track.notes.forEach(function(note, index) {
      rawNotes[index] = note.name;
    });

    return rawNotes.join(' ');
  };

  var stopCallback = function() {
    $scope.playing = false;
    $scope.$digest();
  };

  var exportCompleteCallback = function(blob) {
    var url  = window.URL.createObjectURL(blob);
    document.getElementById("downloaded-file").src = url;

    var hiddenDownloadLink = document.getElementById("hidden-download-link");
    hiddenDownloadLink.download = $scope.downloadFileName + ".wav";
    hiddenDownloadLink.href = url;
    hiddenDownloadLink.click();

    window.URL.revokeObjectURL(blob);
  };

  var syncPatternTracks = function(pattern) {
    var instrument = new JSSynth.Instrument(serializeInstrument());

    var tracks = [];
    $scope.tracks.forEach(function(track) {
      var sequence = JSSynth.SequenceParser.parse(parseTrack(track));
      tracks.push(new JSSynth.Track(instrument, sequence, track.muted));
    });

    pattern.replaceTracks(tracks);
  };

  $scope.init = function() {
    synth.pattern = new JSSynth.Pattern();
    syncPatternTracks(synth.pattern);
    synth.transport = new JSSynth.Transport(synth.pattern, stopCallback);

    if (synth.transport) {
      audioContext = synth.transport.getAudioContext();
      synth.transport.setTempo(parseInt($scope.tempo, 10));
    }
    else {
      alert("Your browser doesn't appear to support WebAudio, and so won't be able to use the JS-110. Try a recent version of Chrome, Safari, or Firefox.");
      return;
    }
  };
  $scope.init();

  $scope.export = function() {
    var pattern = new JSSynth.Pattern();
    syncPatternTracks(pattern);

    var offlineTransport = new JSSynth.OfflineTransport(pattern, parseInt($scope.tempo, 10), exportCompleteCallback);
    offlineTransport.tick();
  };

  $scope.updateInstrument = function() {
    syncPatternTracks(synth.pattern);
  };

  $scope.updateNotes = function(trackIndex) {
    syncPatternTracks(synth.pattern);
  };

  $scope.addTrack = function() {
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
    $scope.tracks.push(newTrack);

    syncPatternTracks(synth.pattern);
  };

  $scope.removeTrack = function(index) {
    $scope.tracks.splice(index, 1);
    syncPatternTracks(synth.pattern);
  };

  $scope.updateTempo = function() {
    synth.transport.setTempo(parseInt($scope.tempo, 10));
  };

  $scope.updateLoop = function() {
    synth.transport.loop = $scope.loop;
  };

  $scope.toggleTrackMute = function(index) {
    $scope.tracks[index].muted = !$scope.tracks[index].muted;
    syncPatternTracks(synth.pattern);
  };

  $scope.toggle = function() {
    synth.transport.toggle();
    $scope.playing = !$scope.playing;
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

         if (e.keyCode === 32) {  // Space bar
           element.val('');
         }
         else if (e.keyCode === 37) {  // Left arrow key
           if (element[0].selectionStart === 0 && !(element.hasClass('firstNote'))) {
             changeCurrentlySelectedNote(element, { trackIndexDelta: 0, noteIndexDelta: -1 });
           }
         }
         else if (e.keyCode === 39) {  // Right arrow key
           if (element[0].selectionEnd === element.val().length && !(element.hasClass('lastNote'))) {
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
