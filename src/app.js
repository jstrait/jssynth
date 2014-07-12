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
  $scope.notes = [{name: 'A3'},
                  {name: 'C#3'},
                  {name: 'Eb3'},
                  {name: 'C##3'},
                  {name: 'Dbb3'},
                  {name: 'B3'},
                  {name: 'C3'}, 
                  {name: 'G3'}];

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

      transport = new JSSynth.Transport(audioContext, instrument, parseNotes(), parseInt($scope.tempo, 10), $scope.loop, stopCallback);
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
    transport.updateNotes(parseNotes());
  };

  $scope.updateTempo = function() {
    transport.updateTempo(parseInt($scope.tempo, 10));
  };

  $scope.updateLoop = function() {
    transport.loop = $scope.loop;
  };

  $scope.toggle = function() {
    transport.toggle();
    $scope.playing = !$scope.playing;
  };
}]);

// Adapted from:
// http://stackoverflow.com/questions/19094150/using-angularjs-directive-to-format-input-field-while-leaving-scope-variable-unc
// http://jsfiddle.net/KPeBD/2/
app.directive('noteInput', function () {
  return {
    require: 'ngModel',
    link: function (scope, element, attrs, ctrl) {
       if (!ctrl) return;

       function formatNoteValue(rawValue) {
         var formattedValue = rawValue;
         formattedValue = formattedValue.replace("##", "𝄪");
         formattedValue = formattedValue.replace("#", "♯");
         formattedValue = formattedValue.replace("bb", "𝄫");
         formattedValue = formattedValue.replace("b", "♭");

         return formattedValue;
       };

       ctrl.$formatters.push(function (a) {
         return formatNoteValue(ctrl.$modelValue);
       });

       element.bind('blur', function(e) {
         element.val(formatNoteValue(element.val()));
       });
    }
  };
});
