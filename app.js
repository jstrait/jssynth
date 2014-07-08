"use strict";

var app = angular.module('js100', []);

app.controller('controller', ['$scope', function($scope) {
  var audioContext;
  var transport;

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
  $scope.notes = "A-3 C-3 E-3 C-3 D-3 B-3 C-3 G-3"
  $scope.tempo = 100;
  $scope.loop = true;

  var toGenericConfig = function() {
    return {
      waveform:           $scope.waveform,
      amplitude:          parseFloat($scope.amplitude),
      lfoWaveform:        $scope.lfoWaveform,
      lfoFrequency:       parseFloat($scope.lfoFrequency),
      lfoAmplitude:       parseInt($scope.lfoAmplitude, 10),
      filterCutoff:       parseInt($scope.filterCutoff, 10),
      filterResonance:    parseInt($scope.filterResonance, 10),
      filterLFOWaveform:  $scope.filterLFOWaveform,
      filterLFOFrequency: parseFloat($scope.filterLFOFrequency),
      filterLFOAmplitude: parseInt($scope.filterLFOAmplitude, 10),
      envelopeAttack:     parseFloat($scope.envelopeAttack),
      envelopeDecay:      parseFloat($scope.envelopeDecay),
      envelopeSustain:    parseFloat($scope.envelopeSustain),
      envelopeRelease:    parseFloat($scope.envelopeRelease),
    };
  };

  $scope.init = function() {
    if ('AudioContext' in window) {
      audioContext = new AudioContext();

      var config = toGenericConfig();
      var instrument = new JS100.Instrument(audioContext, config);
      transport = new JS100.Transport(audioContext, instrument, $scope.notes, parseInt($scope.tempo, 10), $scope.loop);
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
    var instrument = new JS100.Instrument(audioContext, config);
    transport.instrument = instrument;
  };

  $scope.updateTempo = function() {
    transport.updateTempo(parseInt($scope.tempo, 10));
  };

  $scope.updateLoop = function() {
    transport.loop = $scope.loop;
  };

  $scope.toggle = function() {
    transport.toggle();
  };
}]);

app.directive('appTransportToggle', function() {
  var link = function(scope, element, attrs) {
    element.on('click', function(e) {
      element.toggleClass('enabled');
      element.scope().toggle();
    });
  };

  return { link: link };
});
