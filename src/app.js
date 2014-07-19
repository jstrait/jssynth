"use strict";

var app = angular.module('js100', []);

app.controller('controller', ['$scope', function($scope) {
  var audioContext;
  var transport;

  $scope.playing = false;
  $scope.waveform = 'sawtooth';
  $scope.amplitude = 0.75;
  $scope.lfoWaveform = 'sine'
  $scope.lfoFrequency = 5;
  $scope.lfoAmplitude = 0;
  $scope.filterCutoff = 1000;
  $scope.filterResonance = 0;
  $scope.filterLFOWaveform = 'sine'
  $scope.filterLFOFrequency = 5;
  $scope.filterLFOAmplitude = 0;
  $scope.envelopeAttack = 0.0;
  $scope.envelopeDecay = 0.0;
  $scope.envelopeSustain = 1.0;
  $scope.envelopeRelease = 0.0;
  $scope.tempo = 100;
  $scope.loop = true;
  $scope.notes = [{name: 'C3'},
                  {name: ''},
                  {name: 'Eb3'},
                  {name: 'F3'},
                  {name: 'G3'},
                  {name: 'Bb4'},
                  {name: 'F3'}, 
                  {name: 'Bb4'}];

  var toGenericConfig = function() {
    var filterCutoff = parseInt($scope.filterCutoff, 10);

    return {
      waveform:           $scope.waveform,
      amplitude:          parseFloat($scope.amplitude),
      lfoWaveform:        $scope.lfoWaveform,
      lfoFrequency:       parseFloat($scope.lfoFrequency),
      lfoAmplitude:       parseInt($scope.lfoAmplitude, 10),
      filterCutoff:       filterCutoff,
      filterResonance:    parseInt($scope.filterResonance, 10),
      filterLFOWaveform:  $scope.filterLFOWaveform,
      filterLFOFrequency: parseFloat($scope.filterLFOFrequency),
      filterLFOAmplitude: parseFloat($scope.filterLFOAmplitude) * filterCutoff,
      envelopeAttack:     parseFloat($scope.envelopeAttack),
      envelopeDecay:      parseFloat($scope.envelopeDecay),
      envelopeSustain:    parseFloat($scope.envelopeSustain),
      envelopeRelease:    parseFloat($scope.envelopeRelease),
    };
  };

  var parseNotes = function() {
    var rawNotes = [];

    for (var i = 0; i < $scope.notes.length; i++) {
      rawNotes[i] = $scope.notes[i].name;
    }

    return rawNotes.join(' ');
  };

  var stopCallback = function() {
    $scope.playing = false;
    $scope.$digest();
  };

  $scope.init = function() {
    if ('AudioContext' in window) {
      audioContext = new AudioContext();

      var config = toGenericConfig();
      var instrument = new JSSynth.Instrument(audioContext, config);

      transport = new JSSynth.Transport(audioContext, instrument, stopCallback);
      transport.setNotes(parseNotes());
      transport.setTempo(parseInt($scope.tempo, 10));
    }
    else {
      alert("Your browser doesn't appear to be cool enough to run the JS-100");
      return;
    }
  };
  $scope.init();

  $scope.updateInstrument = function() {
    var config = toGenericConfig();
    console.log(config);
    var instrument = new JSSynth.Instrument(audioContext, config);
    transport.instrument = instrument;
  };

  $scope.updateNotes = function() {
    transport.setNotes(parseNotes());
  };

  $scope.updateTempo = function() {
    transport.setTempo(parseInt($scope.tempo, 10));
  };

  $scope.updateLoop = function() {
    transport.loop = $scope.loop;
  };

  $scope.toggle = function() {
    transport.toggle();
    $scope.playing = !$scope.playing;
  };
}]);

app.directive('noteInput', function () {
  return {
    require: 'ngModel',
    link: function (scope, element, attrs, ctrl) {
       if (!ctrl) return;

       function formatNoteValue(rawValue) {
         var formattedValue = rawValue;

         // Make first character uppercase (but not subsequent characters, to avoid
         // making a 'b' uppercase, which will mess with ♭ replacement).
         var firstCharacter = formattedValue.substr(0, 1);
         formattedValue = firstCharacter.toUpperCase() + formattedValue.substr(1);

         formattedValue = formattedValue.replace("##", "𝄪");
         formattedValue = formattedValue.replace("#", "♯");
         formattedValue = formattedValue.replace("bb", "𝄫");
         formattedValue = formattedValue.replace("b", "♭");

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

         if (/^$|(^[A-G](b|bb|#|##){0,1}[0-7]$)/.test(parsedValue)) {
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
         if (e.keyCode === 32) {  // Space bar
           element.val('');
         }
         else if (e.keyCode === 37) {  // Left arrow key
           if (element[0].selectionStart === 0 && !(element.hasClass('first'))) {
             var noteIndex = parseInt(element[0].id.split("-")[1], 10);
             var nextNoteId = 'note-' + (noteIndex - 1);
           
             document.getElementById(nextNoteId).focus();
           }
         }
         else if (e.keyCode === 39) {  // Right arrow key
           if (element[0].selectionEnd === element.val().length && !(element.hasClass('last'))) {
             var noteIndex = parseInt(element[0].id.split("-")[1], 10);
             var nextNoteId = 'note-' + (noteIndex + 1);
           
             document.getElementById(nextNoteId).focus();
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
