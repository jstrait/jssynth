"use strict";

var app = angular.module('js100', []);

app.controller('controller', ['$scope', function($scope) {
  var context = JS100.init();
  var transport;

  $scope.waveform = 'sawtooth';
  $scope.amplitude = 0.2;
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

  $scope.updateInstrument = function() {
    var config = toGenericConfig();
    var instrument = new JS100.Instrument(context.audioContext, config);
    transport.instrument = instrument;
  };

  $scope.updateTempo = function() {
    transport.updateTempo(parseInt($scope.tempo, 10));
  };

  $scope.start = function() {
    console.log(toGenericConfig());
    var config = toGenericConfig();
    var instrument = new JS100.Instrument(context.audioContext, config);
    transport = new JS100.Transport(context.audioContext, instrument, $scope.notes, config.tempo, config.loop);
    transport.start();
  };

  $scope.stop = function() {
    transport.stop();
  };

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
      tempo:              parseInt($scope.tempo, 10),
      loop:               $scope.loop,
    };
  };
}]);

app.directive('appTransportBegin', function() {
  var link = function(scope, element, attrs) {
    element.on('click', function(e) {
      element.scope().start();
    });
  };

  return { link: link };
});

app.directive('appTransportStop', function() {
  var link = function(scope, element, attrs) {
    element.on('click', function(e) {
      element.scope().stop();
    });
  };

  return { link: link };
});

app.directive('appTransportDownload', function() {
  var link = function(scope, element, attrs) {
    element.on('click', function(e) {
      element.scope().stop();
    });
  };

  return { link: link };
});

