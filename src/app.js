"use strict";

var app = angular.module('js110', []);

app.controller('controller', ['$scope', function($scope) {
  var synth = { };

  $scope.playing = false;
  $scope.amplitude = 0.25;
  $scope.tempo = 100;
  $scope.loop = true;
  $scope.downloadFileName = "js-110";

  $scope.instruments = [{
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

  $scope.tracks = [
                    [
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

                    [
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
                  ];


  var Serializer = function() {
    var serializer = {};

    var serializeInstruments = function() {
      var serializedInstruments = [];

      $scope.instruments.forEach(function(instrument) {
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
      var tracks = [];

      serializedInstruments.forEach(function(serializedInstrument, index) {
        var instrument = new JSSynth.Instrument(serializedInstrument);
        var instrumentTracks = $scope.tracks[index];

        instrumentTracks.forEach(function(track) {
          var sequence = JSSynth.SequenceParser.parse(serializeTrackNotesIntoSequence(track));
          tracks.push(new JSSynth.Track(instrument, sequence, track.muted));
        });
      });

      return tracks;
    };

    return serializer;
  };

  var syncPatternTracks = function(pattern) {
    var tracks = new Serializer().serialize();
    pattern.replaceTracks(tracks);
  };

  $scope.init = function() {
    var stopCallback = function() {
      $scope.playing = false;
      $scope.$digest();
    };

    synth.pattern = new JSSynth.Pattern();
    syncPatternTracks(synth.pattern);
    synth.transport = new JSSynth.Transport(synth.pattern, stopCallback);

    if (synth.transport) {
      synth.transport.setTempo(parseInt($scope.tempo, 10));
    }
    else {
      alert("Your browser doesn't appear to support WebAudio, and so won't be able to use the JS-110. Try a recent version of Chrome, Safari, or Firefox.");
      return;
    }
  };
  $scope.init();

  $scope.updateInstrument = function() {
    syncPatternTracks(synth.pattern);
  };

  $scope.addTrack = function(instrumentIndex) {
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
    $scope.tracks[instrumentIndex].push(newTrack);

    syncPatternTracks(synth.pattern);
  };

  $scope.removeTrack = function(instrumentIndex, trackIndex) {
    $scope.tracks[instrumentIndex].splice(trackIndex, 1);

    if ($scope.tracks[instrumentIndex].length === 0) {
      $scope.addTrack(instrumentIndex);
    }
    else {
      syncPatternTracks(synth.pattern);
    }
  };

  $scope.toggleTrackMute = function(instrumentIndex, trackIndex) {
    console.log(instrumentIndex + ", " + trackIndex);
    $scope.tracks[instrumentIndex][trackIndex].muted = !$scope.tracks[instrumentIndex][trackIndex].muted;
    syncPatternTracks(synth.pattern);
  };

  $scope.updateNotes = function(instrumentIndex, trackIndex, noteIndex) {
    var i;
    var newNoteName = $scope.tracks[instrumentIndex][trackIndex].notes[noteIndex].name;

    if (newNoteName === "-") {
      i = noteIndex - 1;
      while (i >= 0 && $scope.tracks[instrumentIndex][trackIndex].notes[i].name === "") {
        $scope.tracks[instrumentIndex][trackIndex].notes[i].name = "-";
        i -= 1;
      }
    }
    else if (newNoteName === "") {
      i = noteIndex + 1;
      while (i < $scope.tracks[instrumentIndex][trackIndex].notes.length && $scope.tracks[instrumentIndex][trackIndex].notes[i].name === "-") {
        $scope.tracks[instrumentIndex][trackIndex].notes[i].name = "";
        i += 1;
      }
    }

    syncPatternTracks(synth.pattern);
  };

  $scope.updateTempo = function() {
    synth.transport.setTempo(parseInt($scope.tempo, 10));
  };

  $scope.updateAmplitude = function() {
    synth.transport.setAmplitude(parseFloat($scope.amplitude));
  };

  $scope.toggle = function() {
    synth.transport.toggle();
    $scope.playing = !$scope.playing;
  };

  $scope.updateLoop = function() {
    synth.transport.loop = $scope.loop;
  };

  $scope.export = function() {
    var pattern = new JSSynth.Pattern();
    syncPatternTracks(pattern);

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

    var offlineTransport = new JSSynth.OfflineTransport(pattern, parseInt($scope.tempo, 10), parseFloat($scope.amplitude), exportCompleteCallback);
    offlineTransport.tick();
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
